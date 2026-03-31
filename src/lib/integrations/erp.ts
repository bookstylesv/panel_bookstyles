import { guardEnv } from "@/lib/panel-api";
import { fetchJson } from "@/lib/integrations/fetch-json";
import type { PaginatedResult, ServiceHealth } from "@/lib/integrations/types";

export type ErpPlan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
export type ErpStatus = "ACTIVE" | "TRIAL" | "SUSPENDED" | "CANCELLED" | "PENDING_DELETION";

export type ErpTenantListItem = {
  id: string;
  name: string;
  slug: string;
  plan: ErpPlan;
  status: ErpStatus;
  maxUsers: number;
  maxProducts: number;
  maxInvoicesPerMonth: number;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    products: number;
  };
};

export type ErpDashboardStats = {
  total: number;
  activos: number;
  en_trial: number;
  suspendidos: number;
  cancelados: number;
  por_plan: Record<string, number>;
};

function getBaseUrl() {
  const baseUrl = guardEnv("ERP_PANEL_URL");
  return `${baseUrl.replace(/\/$/, "")}/api/superadmin`;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${guardEnv("ERP_SUPERADMIN_API_KEY")}`,
  };
}

export async function getErpDashboard() {
  return fetchJson<ErpDashboardStats>(`${getBaseUrl()}/dashboard`, {
    headers: getHeaders(),
  });
}

export async function getErpTenants(searchParams?: URLSearchParams) {
  const suffix = searchParams?.toString() ? `?${searchParams.toString()}` : "";
  return fetchJson<PaginatedResult<ErpTenantListItem>>(`${getBaseUrl()}/tenants${suffix}`, {
    headers: getHeaders(),
  });
}

export async function getErpTenant(id: string) {
  return fetchJson<ErpTenantListItem>(`${getBaseUrl()}/tenants/${id}`, {
    headers: getHeaders(),
  });
}

export async function getErpHealth(): Promise<ServiceHealth> {
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
