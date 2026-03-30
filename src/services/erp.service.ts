/**
 * erp.service.ts — Cliente HTTP para ERP Full Pro.
 * Usa Authorization: Bearer <VITE_ERP_SUPERADMIN_KEY> para autenticarse
 * con los endpoints /api/superadmin/* del ERP Full Pro.
 * ERP aún no deployado — los métodos están definidos pero las páginas muestran ComingSoon.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_ERP_API_URL || 'http://localhost:3001') + '/api/superadmin',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_ERP_SUPERADMIN_KEY || ''}`,
  },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const message = err.response?.data?.error?.message ?? err.response?.data?.message ?? err.message ?? 'Error desconocido';
    return Promise.reject(new Error(message));
  }
);

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type ErpPlan   = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
export type ErpStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED' | 'PENDING_DELETION';

export interface ErpTenantListItem {
  id:                   string;
  name:                 string;
  slug:                 string;
  plan:                 ErpPlan;
  status:               ErpStatus;
  maxUsers:             number;
  maxProducts:          number;
  maxInvoicesPerMonth:  number;
  trialEndsAt:          string | null;
  createdAt:            string;
}

export interface ErpTenantDetalle extends ErpTenantListItem {
  subscriptionId: string | null;
  updatedAt:      string;
  _count: { users: number; products: number };
}

export interface ErpDashboardStats {
  total:     number;
  byStatus:  { status: string; count: number }[];
  byPlan:    { plan: string; count: number }[];
}

export interface ErpHealthData {
  status:        'ok' | 'error';
  db_latency_ms: number;
  timestamp:     string;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const erpSvc = {
  getDashboard:   ()                           => api.get<{ data: ErpDashboardStats }>('/dashboard').then(r => r.data.data),
  getTenants:     (params?: Record<string, string | number>) => api.get<{ data: { items: ErpTenantListItem[]; total: number } }>('/tenants', { params }).then(r => r.data.data),
  getTenant:      (id: string)                 => api.get<{ data: ErpTenantDetalle }>(`/tenants/${id}`).then(r => r.data.data),
  createTenant:   (dto: Partial<ErpTenantListItem>) => api.post<{ data: ErpTenantListItem }>('/tenants', dto).then(r => r.data.data),
  updateTenant:   (id: string, dto: Partial<ErpTenantListItem>) => api.put<{ data: ErpTenantDetalle }>(`/tenants/${id}`, dto).then(r => r.data.data),
  suspendTenant:  (id: string)                 => api.post(`/tenants/${id}/suspend`).then(r => r.data),
  activateTenant: (id: string)                 => api.post(`/tenants/${id}/activate`).then(r => r.data),
  getUsers:       (id: string)                 => api.get<{ data: unknown[] }>(`/tenants/${id}/users`).then(r => r.data.data),
  getHealth:      ()                           => api.get<{ data: ErpHealthData }>('/health').then(r => r.data.data),
};
