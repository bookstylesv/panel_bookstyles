/**
 * barber.service.ts — Cliente HTTP para BarberPro.
 * Usa Authorization: Bearer <VITE_BARBER_SUPERADMIN_KEY> para autenticarse
 * con los endpoints /api/superadmin/* de BarberPro.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_BARBER_API_URL || 'http://localhost:3000') + '/api/superadmin',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_BARBER_SUPERADMIN_KEY || ''}`,
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

export type BarberPlan   = 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';
export type BarberStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';

export interface BarberTenantListItem {
  id:           number;
  slug:         string;
  name:         string;
  plan:         BarberPlan;
  status:       BarberStatus;
  trialEndsAt:  string | null;
  paidUntil:    string | null;
  email:        string | null;
  phone:        string | null;
  city:         string | null;
  maxBarbers:   number;
  createdAt:    string;
}

export interface BarberTenantDetalle extends BarberTenantListItem {
  address:      string | null;
  logoUrl:      string | null;
  country:      string;
  modules:      Record<string, boolean>;
  _count: {
    users:        number;
    barbers:      number;
    appointments: number;
  };
}

export interface BarberDashboardStats {
  totalTenants:     number;
  activeTenants:    number;
  trialTenants:     number;
  suspendedTenants: number;
  byPlan: { plan: string; count: number }[];
}

export interface BarberCreateTenantDTO {
  slug:        string;
  name:        string;
  email?:      string;
  phone?:      string;
  city?:       string;
  plan?:       BarberPlan;
  maxBarbers?: number;
}

export interface BarberUpdateTenantDTO {
  name?:        string;
  plan?:        BarberPlan;
  status?:      BarberStatus;
  maxBarbers?:  number;
  paidUntil?:   string | null;
  trialEndsAt?: string | null;
  email?:       string;
  phone?:       string;
  city?:        string;
  logoUrl?:     string;
  modules?:     Record<string, boolean>;
}

export interface BarberHealthData {
  status:       'ok' | 'error';
  db_latency_ms: number;
  timestamp:    string;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const barberSvc = {
  getDashboard:   ()                              => api.get<{ data: BarberDashboardStats }>('/dashboard').then(r => r.data.data),
  getTenants:     (params?: Record<string, string | number>) => api.get<{ data: { items: BarberTenantListItem[]; total: number } }>('/tenants', { params }).then(r => r.data.data),
  getTenant:      (id: number)                    => api.get<{ data: BarberTenantDetalle }>(`/tenants/${id}`).then(r => r.data.data),
  createTenant:   (dto: BarberCreateTenantDTO)    => api.post<{ data: BarberTenantListItem }>('/tenants', dto).then(r => r.data.data),
  updateTenant:   (id: number, dto: BarberUpdateTenantDTO) => api.put<{ data: BarberTenantDetalle }>(`/tenants/${id}`, dto).then(r => r.data.data),
  suspendTenant:  (id: number)                    => api.post(`/tenants/${id}/suspend`).then(r => r.data),
  activateTenant: (id: number, dto?: { plan?: BarberPlan; paidUntil?: string }) => api.post(`/tenants/${id}/activate`, dto).then(r => r.data),
  getBarbers:     (id: number)                    => api.get<{ data: unknown[] }>(`/tenants/${id}/barbers`).then(r => r.data.data),
  getHealth:      ()                              => api.get<{ data: BarberHealthData }>('/health').then(r => r.data.data),
};
