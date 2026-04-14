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

export type BarberModules = {
  appointments: boolean;
  pos: boolean;
  clients: boolean;
  products: boolean;
  expenses: boolean;
  reports_basic: boolean;
  accounts_receivable: boolean;
  payroll: boolean;
  billing_dte: boolean;
  reports_advanced: boolean;
  branches: boolean;
  api_integrations: boolean;
  loyalty: boolean;
};

export type BarberPlanConfigItem = {
  id: number;
  plan: BarberPlan;
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

export type UpdateBarberPlanConfigInput = {
  displayName?: string;
  description?: string;
  maxBarbers?: number;
  maxBranches?: number;
  modules?: BarberModules;
  price?: number | null;
  active?: boolean;
};

export async function getBarberPlanConfigs() {
  return fetchJson<BarberPlanConfigItem[]>(`${getBaseUrl()}/plans`, {
    headers: getHeaders(),
  });
}

export async function updateBarberPlanConfig(plan: BarberPlan, data: UpdateBarberPlanConfigInput) {
  return fetchJson<BarberPlanConfigItem>(`${getBaseUrl()}/plans/${plan}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: data,
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

export async function getBarberHealth(): Promise<ServiceHealth> {
  const data = await fetchJson<{
    status: "ok" | "error";
    timestamp: string;
    db_latency_ms: number;
  }>(`${getBaseUrl()}/health`, {
    headers: getHeaders(),
  });

  return {
    status: data.status,
    timestamp: data.timestamp,
    latencyMs: data.db_latency_ms,
  };
}
