import { guardEnv } from "@/lib/panel-api";
import { fetchJson } from "@/lib/integrations/fetch-json";
import type { PaginatedResult, ServiceHealth } from "@/lib/integrations/types";

export type BarberPlan = "TRIAL" | "BASIC" | "PRO" | "ENTERPRISE";
export type BarberStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
export type BarberBusinessType = "BARBERIA" | "SALON";

export type BarberTenantListItem = {
  id: number;
  slug: string;
  name: string;
  plan: BarberPlan;
  status: BarberStatus;
  trialEndsAt: string | null;
  paidUntil: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  maxBarbers: number;
  businessType: BarberBusinessType;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    barbers: number;
    appointments: number;
  };
  users?: { id: number; fullName: string; email: string }[];
};

export type BarberDashboardStats = {
  total: number;
  activos: number;
  en_trial: number;
  suspendidos: number;
  cancelados: number;
  por_plan: Record<string, number>;
};

function getBaseUrl() {
  const baseUrl = guardEnv("BARBER_PANEL_URL");
  return `${baseUrl.replace(/\/$/, "")}/api/superadmin`;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${guardEnv("BARBER_SUPERADMIN_API_KEY")}`,
  };
}

export async function getBarberDashboard() {
  return fetchJson<BarberDashboardStats>(`${getBaseUrl()}/dashboard`, {
    headers: getHeaders(),
  });
}

export async function getBarberTenants(searchParams?: URLSearchParams) {
  const suffix = searchParams?.toString() ? `?${searchParams.toString()}` : "";
  return fetchJson<PaginatedResult<BarberTenantListItem>>(`${getBaseUrl()}/tenants${suffix}`, {
    headers: getHeaders(),
  });
}

export async function getBarberTenant(id: number) {
  return fetchJson<BarberTenantListItem>(`${getBaseUrl()}/tenants/${id}`, {
    headers: getHeaders(),
  });
}

// ── Plan Config ───────────────────────────────────────

// Claves de módulo — deben coincidir exactamente con MODULE_KEYS en module-guard.ts de BarberPro
export type BarberModules = {
  pos:          boolean; // POS
  pos_turnos:   boolean; // Turnos de Caja
  pos_dte:      boolean; // Documentos / Facturación DTE
  appointments: boolean; // Citas / Agenda
  billing:      boolean; // Caja de Citas / Agenda
  clients:      boolean; // Clientes
  loyalty:      boolean; // Fidelización (Puntos y Tarjetas)
  barbers:      boolean; // Barberos / Estilistas
  services:     boolean; // Servicios / Tratamientos
  compras:      boolean; // Compras
  proveedores:  boolean; // Proveedores
  productos:    boolean; // Productos
  inventario:   boolean; // Inventario
  gastos:       boolean; // Gastos
  cxp:          boolean; // Cuentas por Pagar
  payroll:      boolean; // Planilla
  branches:     boolean; // Sucursales
  settings:     boolean; // Configuración del sistema
};

export type BarberPlanConfigItem = {
  id: number;
  slug: string;
  plan: BarberPlan | null;   // null para planes custom
  displayName: string;
  description: string | null;
  maxBarbers: number;
  maxBranches: number;
  modules: BarberModules;
  price: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateBarberPlanConfigInput = {
  slug: string;
  displayName: string;
  description?: string;
  maxBarbers?: number;
  maxBranches?: number;
  modules?: Partial<BarberModules>;
  price?: number | null;
  active?: boolean;
};

export type UpdateBarberPlanConfigInput = {
  displayName?: string;
  description?: string;
  maxBarbers?: number;
  maxBranches?: number;
  modules?: Partial<BarberModules>;
  price?: number | null;
  active?: boolean;
};

export async function getBarberPlanConfigs() {
  return fetchJson<BarberPlanConfigItem[]>(`${getBaseUrl()}/plans`, {
    headers: getHeaders(),
  });
}

export async function createBarberPlanConfig(data: CreateBarberPlanConfigInput) {
  return fetchJson<BarberPlanConfigItem>(`${getBaseUrl()}/plans`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: data,
  });
}

export async function updateBarberPlanConfig(slug: string, data: UpdateBarberPlanConfigInput) {
  return fetchJson<BarberPlanConfigItem>(`${getBaseUrl()}/plans/${slug}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: data,
  });
}

export async function deleteBarberPlanConfig(slug: string) {
  return fetchJson<{ message: string }>(`${getBaseUrl()}/plans/${slug}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
}

// ── Barber Config ─────────────────────────────────────

export type BarberConfig = {
  brandName: string;
  tagline: string;
  features: { title: string; description: string }[];
};

export async function getBarberConfig() {
  return fetchJson<BarberConfig>(`${getBaseUrl()}/config`, {
    headers: getHeaders(),
  });
}

export async function updateBarberConfig(data: Partial<BarberConfig>) {
  return fetchJson<BarberConfig>(`${getBaseUrl()}/config`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: data,
  });
}

export type CreateBarberTenantInput = {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  city?: string;
  plan?: BarberPlan;
  businessType?: BarberBusinessType;
  maxBarbers?: number;
  owner?: { fullName: string; email: string; password: string };
};

export type CreateBarberTenantResult = BarberTenantListItem & { ownerCreated: boolean };

export async function createBarberTenant(data: CreateBarberTenantInput) {
  return fetchJson<CreateBarberTenantResult>(`${getBaseUrl()}/tenants`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: data,
  });
}

export type UpdateBarberTenantInput = Partial<Omit<CreateBarberTenantInput, 'owner'>> & {
  status?: BarberStatus;
  paidUntil?: string | null;
  trialEndsAt?: string | null;
};

export async function updateBarberTenant(id: number, data: UpdateBarberTenantInput) {
  return fetchJson<BarberTenantListItem>(`${getBaseUrl()}/tenants/${id}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: data,
  });
}

export async function resetBarberTenantPassword(id: number) {
  return fetchJson<{ ownerEmail: string; ownerName: string; newPassword: string }>(
    `${getBaseUrl()}/tenants/${id}/reset-password`,
    { method: "POST", headers: getHeaders() },
  );
}

export async function deleteBarberTenant(id: number) {
  return fetchJson<{ message: string }>(`${getBaseUrl()}/tenants/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
}

export async function suspendBarberTenant(id: number) {
  return fetchJson<{ message: string }>(`${getBaseUrl()}/tenants/${id}/suspend`, {
    method: "POST",
    headers: getHeaders(),
  });
}

export type BarberOwner = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

export async function getBarberTenantOwner(id: number) {
  return fetchJson<BarberOwner>(`${getBaseUrl()}/tenants/${id}/owner`, {
    headers: getHeaders(),
  });
}

export async function activateBarberTenant(id: number) {
  return fetchJson<{ message: string }>(`${getBaseUrl()}/tenants/${id}/activate`, {
    method: "POST",
    headers: getHeaders(),
  });
}

// ── Branches ──────────────────────────────────────────

export type BarberBranchItem = {
  id: number;
  name: string;
  slug: string;
  city: string | null;
  status: "ACTIVE" | "INACTIVE";
  isHeadquarters: boolean;
  createdAt: string;
  _count: { barberAssignments: number; appointments: number };
};

export async function getBarberTenantBranches(tenantId: number) {
  return fetchJson<BarberBranchItem[]>(
    `${getBaseUrl()}/tenants/${tenantId}/branches`,
    { headers: getHeaders() },
  );
}

// ── Equipo del tenant (SUPERADMIN, GERENTE, USERS) ─────────────────────────

export type BarberTeamRole = "SUPERADMIN" | "GERENTE" | "USERS";

export type BarberTeamUser = {
  id:           number;
  fullName:     string;
  email:        string;
  role:         BarberTeamRole;
  active:       boolean;
  moduleAccess: string[] | null;
  createdAt:    string;
  branchId:     number | null;
  branch: {
    id:             number;
    name:           string;
    slug:           string;
    isHeadquarters: boolean;
  } | null;
};

export type CreateBarberTeamUserInput = {
  role:      BarberTeamRole;
  fullName:  string;
  email:     string;
  password:  string;
  branchId?: number;
};

export async function getBarberTenantTeam(tenantId: number) {
  return fetchJson<BarberTeamUser[]>(
    `${getBaseUrl()}/tenants/${tenantId}/users`,
    { headers: getHeaders() },
  );
}

export async function createBarberTenantUser(tenantId: number, data: CreateBarberTeamUserInput) {
  return fetchJson<BarberTeamUser>(
    `${getBaseUrl()}/tenants/${tenantId}/users`,
    {
      method:  "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body:    data,
    },
  );
}

export type ResetBarberUserPasswordResult = {
  userId:      number;
  userEmail:   string;
  userName:    string;
  role:        "OWNER" | BarberTeamRole;
  newPassword: string;
};

export async function resetBarberTenantUserPassword(
  tenantId: number,
  userId: number,
  password?: string,
) {
  return fetchJson<ResetBarberUserPasswordResult>(
    `${getBaseUrl()}/tenants/${tenantId}/users/${userId}/reset-password`,
    {
      method:  "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body:    password ? { password } : {},
    },
  );
}

export type BarberHealthDetail = {
  status: "ok" | "error";
  timestamp: string;
  database: {
    latency_ms: number;
    version: string;
    server_time: string | null;
  };
  process: {
    uptime_seconds: number;
    node_version: string;
    platform: string;
    arch: string;
    environment: string;
    pid: number;
    memory: {
      rss_mb: number;
      heap_used_mb: number;
      heap_total_mb: number;
      external_mb: number;
    };
  };
  tenants: {
    total: number;
    activos: number;
    en_trial: number;
    suspendidos: number;
    cancelados: number;
  };
};

export async function getBarberHealthDetail(): Promise<BarberHealthDetail> {
  return fetchJson<BarberHealthDetail>(`${getBaseUrl()}/health`, {
    headers: getHeaders(),
  });
}

export async function getBarberHealth(): Promise<ServiceHealth> {
  const data = await fetchJson<BarberHealthDetail & { db_latency_ms?: number }>(`${getBaseUrl()}/health`, {
    headers: getHeaders(),
  });
  return {
    status: data.status,
    timestamp: data.timestamp,
    // Soporta formato nuevo (data.database) y formato antiguo (data.db_latency_ms)
    latencyMs: data.database?.latency_ms ?? data.db_latency_ms ?? 0,
  };
}
