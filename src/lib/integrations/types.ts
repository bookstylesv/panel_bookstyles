export type ServiceSection = "overview" | "dte" | "barber" | "erp";

export type PanelMetric = {
  key: string;
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "danger";
};

export type ServiceHealth = {
  status: "ok" | "degraded" | "error" | "unknown";
  timestamp: string;
  latencyMs?: number;
  detail?: string;
};

export type OverviewServiceCard = {
  key: Exclude<ServiceSection, "overview">;
  label: string;
  accentVar: string;
  status: ServiceHealth["status"];
  metrics: PanelMetric[];
  href: string;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};
