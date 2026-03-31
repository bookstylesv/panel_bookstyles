import { guardEnv } from "@/lib/panel-api";
import { fetchJson } from "@/lib/integrations/fetch-json";
import type { ServiceHealth } from "@/lib/integrations/types";

export type DteTenantEstado = "pruebas" | "activo" | "suspendido";

export type DteDashboardStats = {
  total: number;
  activos: number;
  en_pruebas: number;
  suspendidos: number;
  por_vencer: number;
  vencidos: number;
  nuevos_semana: number;
  nuevos_mes: number;
  mrr: number;
  ingresos_mes: number;
  ingresos_mes_anterior: number;
  alertas_por_vencer: Array<{
    id: number;
    nombre: string;
    slug: string;
    fecha_pago: string;
    plan_nombre: string | null;
  }>;
  alertas_vencidos: Array<{
    id: number;
    nombre: string;
    slug: string;
    fecha_pago: string;
    plan_nombre: string | null;
  }>;
};

export type DteTenantListItem = {
  id: number;
  nombre: string;
  slug: string;
  email_contacto: string | null;
  telefono: string | null;
  estado: DteTenantEstado;
  fecha_pago: string | null;
  fecha_suspension: string | null;
  plan_nombre: string | null;
  created_at: string;
  dias_para_vencer: number | null;
};

export type DteTenantDetail = DteTenantListItem & {
  notas: string | null;
  plan_id: number | null;
  max_sucursales: number | null;
  max_sucursales_override: number | null;
  plan_max_sucursales: number | null;
  max_puntos_venta: number | null;
  max_puntos_venta_override: number | null;
  plan_max_puntos_venta: number | null;
  max_usuarios: number | null;
  max_usuarios_override: number | null;
  plan_max_usuarios: number | null;
  api_ambiente: string | null;
  api_usuario: string | null;
  api_token_expira: string | null;
  firma_archivo: string | null;
  firma_nit: string | null;
  firma_vence: string | null;
  updated_at: string;
};

export type DtePlan = {
  id: number;
  nombre: string;
  max_sucursales: number;
  max_usuarios: number;
  precio: number;
  activo: boolean;
};

function getBaseUrl() {
  const baseUrl = guardEnv("DTE_PANEL_URL");
  return baseUrl.replace(/\/$/, "");
}

type DteAuthHeaders =
  | { kind: "api-key"; headers: HeadersInit }
  | { kind: "cookie"; headers: HeadersInit };

async function getDteAuthHeaders(): Promise<DteAuthHeaders> {
  const apiKey = process.env.DTE_PANEL_API_KEY;
  if (apiKey) {
    return {
      kind: "api-key",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };
  }

  const username = guardEnv("DTE_SUPERADMIN_USER");
  const password = guardEnv("DTE_SUPERADMIN_PASS");

  const response = await fetch(`${getBaseUrl()}/superadmin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as { requires2FA?: boolean; message?: string }) : {};

  if (!response.ok) {
    throw new Error(payload.message ?? "No se pudo autenticar contra DTE");
  }

  if (payload.requires2FA) {
    throw new Error(
      "DTE requiere 2FA para el login superadmin. Configura DTE_PANEL_API_KEY para usar el panel v3.",
    );
  }

  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("DTE no devolvio cookie de sesion para superadmin");
  }

  const cookie = setCookie.split(",").map((chunk) => chunk.trim()).find((chunk) => chunk.startsWith("erp_superadmin_token="));
  if (!cookie) {
    throw new Error("No se pudo resolver la cookie erp_superadmin_token de DTE");
  }

  return {
    kind: "cookie",
    headers: {
      Cookie: cookie.split(";")[0],
    },
  };
}

async function dteFetch<T>(path: string): Promise<T> {
  const auth = await getDteAuthHeaders();
  return fetchJson<T>(`${getBaseUrl()}/superadmin${path}`, {
    headers: auth.headers,
  });
}

export async function getDteDashboard() {
  return dteFetch<DteDashboardStats>("/dashboard");
}

export async function getDteTenants() {
  return dteFetch<DteTenantListItem[]>("/tenants");
}

export async function getDteTenant(id: number) {
  return dteFetch<DteTenantDetail>(`/tenants/${id}`);
}

export async function getDtePlans() {
  return dteFetch<DtePlan[]>("/planes");
}

export async function getDteHealth(): Promise<ServiceHealth> {
  const data = await dteFetch<{
    status: "ok" | "degraded" | "error";
    timestamp: string;
    database?: { latency_ms?: number };
  }>("/health");

  return {
    status: data.status,
    timestamp: data.timestamp,
    latencyMs: data.database?.latency_ms,
  };
}
