/**
 * dte.service.ts — Cliente HTTP para el panel DTE (Facturación Electrónica).
 * Conecta al backend Express de DTE vía su ruta /superadmin/*.
 * Usa cookie erp_superadmin_token (httpOnly, cross-domain con withCredentials).
 */

import axios from 'axios';

const api = axios.create({
  baseURL:         (import.meta.env.VITE_DTE_API_URL || 'http://localhost:3001') + '/superadmin',
  withCredentials: true,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const message = err.response?.data?.message ?? err.message ?? 'Error desconocido';
    return Promise.reject(new Error(message));
  }
);

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface DteSuperAdminUser {
  id:       number;
  username: string;
  nombre:   string;
}

export type DteTenantEstado = 'pruebas' | 'activo' | 'suspendido';

export interface DteTenantListItem {
  id:               number;
  nombre:           string;
  slug:             string;
  email_contacto:   string | null;
  telefono:         string | null;
  estado:           DteTenantEstado;
  fecha_pago:       string | null;
  fecha_suspension: string | null;
  plan_nombre:      string | null;
  created_at:       string;
  dias_para_vencer: number | null;
}

export interface DteTenantDetalle extends DteTenantListItem {
  notas:                      string | null;
  plan_id:                    number | null;
  max_sucursales:             number | null;
  max_sucursales_override:    number | null;
  plan_max_sucursales:        number | null;
  max_puntos_venta:           number | null;
  max_puntos_venta_override:  number | null;
  plan_max_puntos_venta:      number | null;
  max_usuarios:               number | null;
  max_usuarios_override:      number | null;
  plan_max_usuarios:          number | null;
  api_ambiente:               string | null;
  api_usuario:                string | null;
  api_token_expira:           string | null;
  firma_archivo:              string | null;
  firma_nit:                  string | null;
  firma_vence:                string | null;
  updated_at:                 string;
}

export interface DtePlan {
  id:             number;
  nombre:         string;
  max_sucursales: number;
  max_usuarios:   number;
  precio:         number;
  activo:         boolean;
}

export interface DteDashboardAlerta {
  id:               number;
  nombre:           string;
  slug:             string;
  fecha_pago:       string;
  dias_restantes?:  number;
  dias_vencido?:    number;
  plan_nombre:      string | null;
}

export interface DteDashboardStats {
  total:                  number;
  activos:                number;
  en_pruebas:             number;
  suspendidos:            number;
  por_vencer:             number;
  vencidos:               number;
  nuevos_semana:          number;
  nuevos_mes:             number;
  mrr:                    number;
  ingresos_mes:           number;
  ingresos_mes_anterior:  number;
  alertas_por_vencer:     DteDashboardAlerta[];
  alertas_vencidos:       DteDashboardAlerta[];
}

export interface DteAnalyticsSeriePunto {
  mes:          string;
  mes_label:    string;
  ingresos:     number;
  nuevos:       number;
  activaciones: number;
  suspensiones: number;
}

export interface DteAnalyticsData {
  serie:      DteAnalyticsSeriePunto[];
  por_plan:   { plan: string; total: number; activos: number; precio: number }[];
  por_estado: { estado: string; total: number }[];
  kpis: {
    crecimiento_mom:  number;
    ingreso_ytd:      number;
    nuevos_mes:       number;
    suspensiones_mes: number;
    activaciones_mes: number;
  };
}

export interface DteHealthData {
  status:    'ok' | 'degraded' | 'error';
  timestamp: string;
  database:  { status: 'ok' | 'error'; latency_ms: number; version: string; server_time: string | null; pool: { total: number; idle: number; waiting: number; max: number } };
  process:   { uptime_seconds: number; node_version: string; platform: string; arch: string; environment: string; pid: number; memory: { rss_mb: number; heap_used_mb: number; heap_total_mb: number; external_mb: number } };
  tenants:   { total: number; activos: number; suspendidos: number; en_pruebas: number };
}

export interface DteAuditItem {
  id:             number;
  actor_id:       number | null;
  actor_tipo:     'superadmin' | 'sistema';
  accion:         string;
  tenant_id:      number | null;
  detalle:        Record<string, unknown> | null;
  ip:             string | null;
  created_at:     string;
  actor_nombre:   string | null;
  actor_username: string | null;
  tenant_nombre:  string | null;
  tenant_slug:    string | null;
}

export interface DteAuditResponse {
  total: number; page: number; limit: number; pages: number; items: DteAuditItem[];
}

export interface DteMapaData {
  departamentos: { codigo: string; nombre: string; total: number; activos: number; suspendidos: number; en_pruebas: number }[];
  sin_ubicacion: number;
  total_tenants: number;
}

export interface Departamento {
  id:     number;
  codigo: string;
  nombre: string;
}

export interface Municipio {
  id:              number;
  codigo:          string;
  nombre:          string;
  departamento_id: number;
}

export type MapaDepartamento = DteMapaData['departamentos'][number];

export interface DteBackupListResponse {
  stats:   { total_backups: number; total_size_mb: string; last_backup_at: string | null; retention_days: number; backup_dir: string };
  backups: { filename: string; type: 'database' | 'uploads'; size_bytes: number; size_mb: string; created_at: string }[];
}

export interface DtePagoDTO {
  monto:                    number;
  fecha_pago?:              string;
  metodo?:                  string;
  notas?:                   string;
  nueva_fecha_vencimiento?: string;
}

export interface BackupFile {
  filename:   string;
  type:       'database' | 'uploads';
  size_bytes: number;
  size_mb:    string;
  created_at: string;
}

export interface BackupStats {
  total_backups:  number;
  total_size_mb:  string;
  last_backup_at: string | null;
  retention_days: number;
  backup_dir:     string;
}

export type DteAuditFilters = Record<string, string | number>;

export interface DteCreateTenantDTO {
  nombre:          string;
  slug:            string;
  email_contacto?: string;
  telefono?:       string;
  plan_id?:        number;
  fecha_pago?:     string;
  notas?:          string;
  admin_username?: string;
  admin_password?: string;
  admin_nombre?:   string;
}

export interface DteUpdateTenantDTO {
  nombre?:           string;
  slug?:             string;
  email_contacto?:   string;
  telefono?:         string;
  plan_id?:          number;
  estado?:           DteTenantEstado;
  fecha_pago?:       string;
  fecha_suspension?: string;
  notas?:            string;
  max_sucursales?:   number | null;
  max_puntos_venta?: number | null;
  max_usuarios?:     number | null;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const dteSvc = {
  // Auth
  login:  (username: string, password: string) =>
    api.post<DteSuperAdminUser | { requires2FA: true; tempToken: string }>('/auth/login', { username, password }).then(r => r.data),
  login2FA: (tempToken: string, code: string) =>
    api.post<DteSuperAdminUser>('/auth/2fa/login', { tempToken, code }).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  getMe:  () => api.get<DteSuperAdminUser>('/auth/me').then(r => r.data),

  // Dashboard
  getDashboard: () => api.get<DteDashboardStats>('/dashboard').then(r => r.data),

  // Analytics
  getAnalytics: () => api.get<DteAnalyticsData>('/analytics').then(r => r.data),

  // Health
  getHealth: () => api.get<DteHealthData>('/health').then(r => r.data),

  // Auditoría
  getAudit: (filters: Record<string, string | number> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)); });
    return api.get<DteAuditResponse>(`/audit?${params.toString()}`).then(r => r.data);
  },

  // Mapa
  getMapa: () => api.get<DteMapaData>('/mapa').then(r => r.data),

  // Backups
  getBackups:   () => api.get<DteBackupListResponse>('/system/backups').then(r => r.data),
  runBackup:    () => api.post<{ message: string }>('/system/backups/run').then(r => r.data),

  // Planes
  getPlanes:    ()                          => api.get<DtePlan[]>('/planes').then(r => r.data),
  createPlan:   (dto: Partial<DtePlan>)     => api.post<DtePlan>('/planes', dto).then(r => r.data),
  updatePlan:   (id: number, dto: Partial<DtePlan>) => api.put<DtePlan>(`/planes/${id}`, dto).then(r => r.data),
  deletePlan:   (id: number)                => api.delete(`/planes/${id}`).then(r => r.data),

  // Tenants
  getTenants:   ()                          => api.get<DteTenantListItem[]>('/tenants').then(r => r.data),
  getTenant:    (id: number)                => api.get<DteTenantDetalle>(`/tenants/${id}`).then(r => r.data),
  createTenant: (dto: DteCreateTenantDTO)   => api.post<{ tenant: DteTenantDetalle; admin_username: string; admin_password: string }>('/tenants', dto).then(r => r.data),
  updateTenant: (id: number, dto: DteUpdateTenantDTO) => api.put<DteTenantDetalle>(`/tenants/${id}`, dto).then(r => r.data),

  // Pagos
  getPagos:      (tenantId: number)          => api.get<unknown[]>(`/tenants/${tenantId}/pagos`).then(r => r.data),
  registrarPago: (tenantId: number, dto: unknown) => api.post(`/tenants/${tenantId}/pagos`, dto).then(r => r.data),

  // API MH
  getApiMh:    (tenantId: number)            => api.get(`/tenants/${tenantId}/api-mh`).then(r => r.data),
  updateApiMh: (tenantId: number, dto: unknown) => api.put(`/tenants/${tenantId}/api-mh`, dto).then(r => r.data),

  // Firma
  getFirma:         (tenantId: number)       => api.get(`/tenants/${tenantId}/firma`).then(r => r.data),
  updateFirma:      (tenantId: number, dto: unknown) => api.put(`/tenants/${tenantId}/firma`, dto).then(r => r.data),
  uploadCertificado:(tenantId: number, file: File) => {
    const form = new FormData(); form.append('certificado', file);
    return api.post(`/tenants/${tenantId}/firma/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },

  // Usuarios del tenant
  getUsuarios:    (tenantId: number)         => api.get<unknown[]>(`/tenants/${tenantId}/usuarios`).then(r => r.data),
  createUsuario:  (tenantId: number, dto: unknown) => api.post(`/tenants/${tenantId}/usuarios`, dto).then(r => r.data),
  updateUsuario:  (tenantId: number, userId: number, dto: unknown) => api.put(`/tenants/${tenantId}/usuarios/${userId}`, dto).then(r => r.data),
  deleteUsuario:  (tenantId: number, userId: number) => api.delete(`/tenants/${tenantId}/usuarios/${userId}`).then(r => r.data),
  resetPassword:  (tenantId: number, userId: number) => api.post<{ username: string; nueva_password: string; mensaje: string }>(`/tenants/${tenantId}/usuarios/${userId}/reset-password`).then(r => r.data),

  // DTE correlativos
  getDTE:    (tenantId: number)              => api.get<unknown[]>(`/tenants/${tenantId}/dte`).then(r => r.data),
  updateDTE: (tenantId: number, tipo: string, dto: unknown) => api.put(`/tenants/${tenantId}/dte/${tipo}`, dto).then(r => r.data),

  // Sucursales
  getSucursales:  (tenantId: number)         => api.get<unknown[]>(`/tenants/${tenantId}/sucursales`).then(r => r.data),
  createSucursal: (tenantId: number, dto: unknown) => api.post(`/tenants/${tenantId}/sucursales`, dto).then(r => r.data),
  updateSucursal: (tenantId: number, sucId: number, dto: unknown) => api.put(`/tenants/${tenantId}/sucursales/${sucId}`, dto).then(r => r.data),
  deleteSucursal: (tenantId: number, sucId: number) => api.delete(`/tenants/${tenantId}/sucursales/${sucId}`).then(r => r.data),

  // Configuración empresa/tema
  getEmpresaConfig: (tenantId: number)       => api.get(`/tenants/${tenantId}/config/empresa`).then(r => r.data),
  updateEmpresaConfig:(tenantId: number, dto: unknown) => api.put(`/tenants/${tenantId}/config/empresa`, dto).then(r => r.data),
  getTemaConfig:    (tenantId: number)        => api.get(`/tenants/${tenantId}/config/tema`).then(r => r.data),
  updateTemaConfig: (tenantId: number, dto: unknown) => api.put(`/tenants/${tenantId}/config/tema`, dto).then(r => r.data),

  // Departamentos / Municipios
  getDepartamentos: () => api.get('/departamentos').then(r => r.data),
  createDepartamento: (dto: unknown) => api.post('/departamentos', dto).then(r => r.data),
  updateDepartamento: (id: number, dto: unknown) => api.put(`/departamentos/${id}`, dto).then(r => r.data),
  deleteDepartamento: (id: number) => api.delete(`/departamentos/${id}`).then(r => r.data),
  getMunicipios: (departamentoId?: number) =>
    api.get('/municipios', { params: departamentoId ? { departamentoId } : undefined }).then(r => r.data),
  createMunicipio: (dto: unknown) => api.post('/municipios', dto).then(r => r.data),
  updateMunicipio: (id: number, dto: unknown) => api.put(`/municipios/${id}`, dto).then(r => r.data),
  deleteMunicipio: (id: number) => api.delete(`/municipios/${id}`).then(r => r.data),
};
