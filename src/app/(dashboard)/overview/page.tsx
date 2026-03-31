import Link from "next/link";
import { Alert, Card, Col, Row, Tag } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { getBarberDashboard, getBarberHealth } from "@/lib/integrations/barber";
import { getDteDashboard, getDteHealth } from "@/lib/integrations/dte";
import { getErpDashboard, getErpHealth } from "@/lib/integrations/erp";

async function loadOverview() {
  const [dteDashboard, dteHealth, barberDashboard, barberHealth, erpDashboard, erpHealth] =
    await Promise.allSettled([
      getDteDashboard(),
      getDteHealth(),
      getBarberDashboard(),
      getBarberHealth(),
      getErpDashboard(),
      getErpHealth(),
    ]);

  return {
    dteDashboard,
    dteHealth,
    barberDashboard,
    barberHealth,
    erpDashboard,
    erpHealth,
  };
}

function getStatusTone(status: string) {
  if (status === "ok") return "success";
  if (status === "degraded") return "warning";
  return "error";
}

export default async function OverviewPage() {
  const state = await loadOverview();
  const services = [
    {
      name: "DTE",
      accentVar: "--section-dte",
      href: "/dte/dashboard",
      dashboard: state.dteDashboard,
      health: state.dteHealth,
      planCounts: null as Record<string, number> | null,
    },
    {
      name: "Barber Pro",
      accentVar: "--section-barber",
      href: "/barber/dashboard",
      dashboard: state.barberDashboard,
      health: state.barberHealth,
      planCounts:
        state.barberDashboard.status === "fulfilled" ? state.barberDashboard.value.por_plan : null,
    },
    {
      name: "ERP Full Pro",
      accentVar: "--section-erp",
      href: "/erp/dashboard",
      dashboard: state.erpDashboard,
      health: state.erpHealth,
      planCounts:
        state.erpDashboard.status === "fulfilled" ? state.erpDashboard.value.por_plan : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Vista global del ecosistema"
        description="Resumen ejecutivo del estado de los tres sistemas conectados al panel central."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={8}>
          <MetricCard
            title="Tenants DTE"
            value={
              state.dteDashboard.status === "fulfilled"
                ? formatNumber(state.dteDashboard.value.total)
                : "Sin conexion"
            }
            accentVar="--section-dte"
            hint={
              state.dteDashboard.status === "fulfilled"
                ? `${formatCurrency(state.dteDashboard.value.ingresos_mes)} este mes`
                : "Revisa credenciales DTE"
            }
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <MetricCard
            title="Tenants Barber"
            value={
              state.barberDashboard.status === "fulfilled"
                ? formatNumber(state.barberDashboard.value.total)
                : "Sin conexion"
            }
            accentVar="--section-barber"
            hint={
              state.barberDashboard.status === "fulfilled"
                ? `${formatNumber(state.barberDashboard.value.activos)} activos`
                : "Revisa credenciales Barber"
            }
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <MetricCard
            title="Tenants ERP"
            value={
              state.erpDashboard.status === "fulfilled"
                ? formatNumber(state.erpDashboard.value.total)
                : "Pendiente"
            }
            accentVar="--section-erp"
            hint={
              state.erpDashboard.status === "fulfilled"
                ? `${formatNumber(state.erpDashboard.value.activos)} activos`
                : "Falta API superadmin en ERP"
            }
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {services.map((service) => (
          <Col key={service.name} xs={24} xl={8}>
            <Card className="surface-card border-0 h-full">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <Tag
                    bordered={false}
                    style={{
                      background: `hsl(var(${service.accentVar}) / 0.12)`,
                      color: `hsl(var(${service.accentVar}))`,
                    }}
                  >
                    {service.name}
                  </Tag>
                  <h3
                    style={{
                      margin: "0.9rem 0 0 0",
                      fontSize: "1.25rem",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Estado del servicio
                  </h3>
                </div>
                <Link href={service.href}>Abrir modulo</Link>
              </div>

              {service.health.status === "fulfilled" ? (
                <Alert
                  type={getStatusTone(service.health.value.status)}
                  showIcon
                  message={`Health: ${service.health.value.status}`}
                  description={
                    service.health.value.latencyMs
                      ? `${formatNumber(service.health.value.latencyMs)} ms`
                      : "Sin latencia reportada"
                  }
                />
              ) : (
                <Alert
                  type="error"
                  showIcon
                  message="Sin conexion"
                  description={service.health.reason instanceof Error ? service.health.reason.message : "No disponible"}
                />
              )}

              <div className="mt-4">
                {service.dashboard.status === "fulfilled" ? (
                  Object.entries(service.planCounts ?? {}).length ? (
                    <div className="space-y-3">
                      {Object.entries(service.planCounts ?? {}).map(([plan, total]) => (
                        <div
                          key={`${service.name}-${plan}`}
                          className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border-default)/0.72)] pb-3 last:border-b-0 last:pb-0"
                        >
                          <span>{plan}</span>
                          <strong>{formatNumber(total)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[hsl(var(--border-default))] px-4 py-5 text-center text-sm text-[hsl(var(--text-muted))]">
                      Sin planes cargados
                    </div>
                  )
                ) : (
                  <Alert
                    type="warning"
                    showIcon
                    message="No se pudo cargar el dashboard"
                    description={
                      service.dashboard.reason instanceof Error
                        ? service.dashboard.reason.message
                        : "Servicio no disponible"
                    }
                  />
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
