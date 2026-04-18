import Link from "next/link";
import type { ReactNode } from "react";
import { Alert, Button, Card, Col, Row, Tag } from "antd";
import { Building2, FileText, Scissors, ShieldCheck, TriangleAlert, Users } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { HealthBar } from "@/components/ui/HealthBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { MomChart } from "@/components/ui/MomChart";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { getBarberDashboard, getBarberHealth } from "@/lib/integrations/barber";
import { getDteAnalytics, getDteAudit, getDteDashboard, getDteHealth } from "@/lib/integrations/dte";
import { getErpDashboard, getErpHealth } from "@/lib/integrations/erp";

async function loadOverview() {
  const [dteDashboard, dteHealth, barberDashboard, barberHealth, erpDashboard, erpHealth, dteAnalytics, dteAudit] =
    await Promise.allSettled([
      getDteDashboard(),
      getDteHealth(),
      getBarberDashboard(),
      getBarberHealth(),
      getErpDashboard(),
      getErpHealth(),
      getDteAnalytics(),
      getDteAudit({ limit: 20 }),
    ]);

  return {
    dteDashboard,
    dteHealth,
    barberDashboard,
    barberHealth,
    erpDashboard,
    erpHealth,
    dteAnalytics,
    dteAudit,
  };
}

function getStatusLabel(status: string) {
  if (status === "ok") return "Operativo";
  if (status === "degraded") return "Con alerta";
  return "Sin conexion";
}

function getStatusStyles(status: string) {
  if (status === "ok") {
    return {
      background: "hsl(var(--status-success-bg))",
      color: "hsl(var(--status-success))",
    };
  }

  if (status === "degraded") {
    return {
      background: "hsl(var(--status-warning-bg))",
      color: "hsl(var(--status-warning))",
    };
  }

  return {
    background: "hsl(var(--status-error-bg))",
    color: "hsl(var(--status-error))",
  };
}

function getAccentStyles(accentVar: string) {
  return {
    color: `hsl(var(${accentVar}))`,
    background: `hsl(var(${accentVar}) / 0.12)`,
  };
}


export default async function OverviewV2() {
  const state = await loadOverview();
  const services = [
    {
      name: "DTE",
      label: "DTE",
      accentVar: "--section-dte",
      href: "/dte/dashboard",
      detailHref: "/dte/clientes",
      description: "Facturacion, clientes y vencimientos",
      dashboard: state.dteDashboard,
      health: state.dteHealth,
      planCounts: null as Record<string, number> | null,
      icon: <FileText size={16} />,
    },
    {
      name: "Barber Pro",
      label: "Barber Pro",
      accentVar: "--section-barber",
      href: "/barber/dashboard",
      detailHref: "/barber/tenants",
      description: "Operacion de barberias y tenants",
      dashboard: state.barberDashboard,
      health: state.barberHealth,
      planCounts:
        state.barberDashboard.status === "fulfilled" ? state.barberDashboard.value.por_plan : null,
      icon: <Scissors size={16} />,
    },
    {
      name: "ERP Full Pro",
      label: "ERP Full Pro",
      accentVar: "--section-erp",
      href: "/erp/dashboard",
      detailHref: "/erp/tenants",
      description: "Administracion, health y tenants",
      dashboard: state.erpDashboard,
      health: state.erpHealth,
      planCounts: state.erpDashboard.status === "fulfilled" ? state.erpDashboard.value.por_plan : null,
      icon: <Building2 size={16} />,
    },
  ].map((service) => {
    const dashboard = service.dashboard.status === "fulfilled" ? service.dashboard.value : null;
    const health = service.health.status === "fulfilled" ? service.health.value : null;

    return {
      ...service,
      dashboardError: service.dashboard.status === "rejected" ? service.dashboard.reason : null,
      healthError: service.health.status === "rejected" ? service.health.reason : null,
      dashboard,
      health,
      planRows:
        dashboard && service.planCounts
          ? Object.entries(service.planCounts)
              .filter(([, total]) => total > 0)
              .map(([plan, total]) => ({
                key: `${service.name}-${plan}`,
                cells: [
                  <span key={`${service.name}-${plan}-label`}>{plan}</span>,
                  <strong key={`${service.name}-${plan}-total`}>{formatNumber(total)}</strong>,
                ],
              }))
          : [],
    };
  });

  const healthyCount = services.filter((service) => service.health?.status === "ok").length;
  const degradedCount = services.filter((service) => service.health?.status === "degraded").length;
  const offlineCount = services.length - healthyCount - degradedCount;
  const connectedCount = services.filter((service) => service.dashboard).length;
  const totalTenants = services.reduce((sum, service) => sum + (service.dashboard?.total ?? 0), 0);
  const activeTenants = services.reduce((sum, service) => sum + (service.dashboard?.activos ?? 0), 0);

  const dteAlerts =
    state.dteDashboard.status === "fulfilled"
      ? [
          ...state.dteDashboard.value.alertas_por_vencer.map((tenant) => ({
            key: `due-${tenant.id}`,
            cells: [
              <span key={`tenant-${tenant.id}`}>{tenant.nombre}</span>,
              <span key={`plan-${tenant.id}`}>{tenant.plan_nombre ?? "Sin plan"}</span>,
              <span key={`date-${tenant.id}`}>{tenant.fecha_pago}</span>,
              <Tag
                key={`status-${tenant.id}`}
                bordered={false}
                style={{
                  margin: 0,
                  borderRadius: 999,
                  background: "hsl(var(--status-warning-bg))",
                  color: "hsl(var(--status-warning))",
                  fontWeight: 700,
                }}
              >
                Por vencer
              </Tag>,
            ],
          })),
          ...state.dteDashboard.value.alertas_vencidos.map((tenant) => ({
            key: `overdue-${tenant.id}`,
            cells: [
              <span key={`tenant-overdue-${tenant.id}`}>{tenant.nombre}</span>,
              <span key={`plan-overdue-${tenant.id}`}>{tenant.plan_nombre ?? "Sin plan"}</span>,
              <span key={`date-overdue-${tenant.id}`}>{tenant.fecha_pago}</span>,
              <Tag
                key={`status-overdue-${tenant.id}`}
                bordered={false}
                style={{
                  margin: 0,
                  borderRadius: 999,
                  background: "hsl(var(--status-error-bg))",
                  color: "hsl(var(--status-error))",
                  fontWeight: 700,
                }}
              >
                Vencido
              </Tag>,
            ],
          })),
        ].slice(0, 6)
      : [];

  const planRows = services.flatMap((service) =>
    service.planRows.map((row) => ({
      key: row.key,
      cells: [
        <span key={`${row.key}-service`} style={{ color: `hsl(var(${service.accentVar}))`, fontWeight: 700 }}>
          {service.label}
        </span>,
        row.cells[0],
        row.cells[1],
      ],
    })),
  );

  const hasErrors = services.some((service) => service.dashboardError || service.healthError);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Vista global"
        title="Panel central BookStyles"
        description={`${healthyCount}/3 servicios operativos · ${formatNumber(activeTenants)} tenants activos · ${formatNumber(totalTenants)} en total`}
        actions={
          <>
            <Button href="/dte/dashboard" size="small" style={{ borderColor: "hsl(var(--section-dte))", color: "hsl(var(--section-dte))" }}>
              Abrir DTE
            </Button>
            <Button href="/barber/dashboard" size="small" style={{ borderColor: "hsl(var(--section-barber))", color: "hsl(var(--section-barber))" }}>
              Abrir Barber Pro
            </Button>
            <Button href="/erp/dashboard" size="small" style={{ borderColor: "hsl(var(--section-erp))", color: "hsl(var(--section-erp))" }}>
              Abrir ERP
            </Button>
          </>
        }
      />

      <HealthBar />

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={8}>
          <MetricCard
            title="Servicios operativos"
            value={`${healthyCount}/3`}
            hint={`${degradedCount} con alerta y ${offlineCount} sin conexion`}
            accentVar="--section-overview"
            icon={<ShieldCheck size={16} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <MetricCard
            title="Tenants DTE"
            value={state.dteDashboard.status === "fulfilled" ? state.dteDashboard.value.total : "Sin conexion"}
            hint={
              state.dteDashboard.status === "fulfilled"
                ? `${formatCurrency(state.dteDashboard.value.ingresos_mes)} este mes`
                : "Revisa la conexion DTE"
            }
            accentVar="--section-dte"
            icon={<FileText size={16} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <MetricCard
            title="Tenants Barber"
            value={state.barberDashboard.status === "fulfilled" ? state.barberDashboard.value.total : "Sin conexion"}
            hint={
              state.barberDashboard.status === "fulfilled"
                ? `${formatNumber(state.barberDashboard.value.activos)} activos`
                : "Revisa la conexion Barber"
            }
            accentVar="--section-barber"
            icon={<Scissors size={16} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <MetricCard
            title="Tenants ERP"
            value={state.erpDashboard.status === "fulfilled" ? state.erpDashboard.value.total : "Pendiente"}
            hint={
              state.erpDashboard.status === "fulfilled"
                ? `${formatNumber(state.erpDashboard.value.activos)} activos`
                : "Valida la API superadmin"
            }
            accentVar="--section-erp"
            icon={<Building2 size={16} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <MetricCard
            title="Tenants activos"
            value={activeTenants}
            hint={`${formatNumber(totalTenants)} tenants totales en el ecosistema`}
            accentVar="--section-overview"
            icon={<Users size={16} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <MetricCard
            title="Alertas DTE"
            value={dteAlerts.length}
            hint={
              state.dteDashboard.status === "fulfilled"
                ? `${formatNumber(state.dteDashboard.value.por_vencer)} por vencer y ${formatNumber(state.dteDashboard.value.vencidos)} vencidos`
                : "Sin datos de alertas"
            }
            accentVar="--section-erp"
            icon={<TriangleAlert size={16} />}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={16}>
          <Card
            className="surface-card border-0"
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Estado de servicios</span>}
            styles={{
              body: {
                display: "grid",
                gap: 8,
                padding: 12,
              },
            }}
          >
            {services.map((service) => (
              <div
                key={service.name}
                style={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.9fr) auto",
                  alignItems: "center",
                  padding: "0.75rem 0.85rem",
                  borderRadius: 16,
                  border: "1px solid hsl(var(--border-default))",
                  background: "hsl(var(--bg-surface))",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      ...getAccentStyles(service.accentVar),
                      flexShrink: 0,
                    }}
                  >
                    {service.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "hsl(var(--text-primary))", fontWeight: 700, fontSize: 13.5 }}>
                      {service.label}
                    </div>
                    <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, lineHeight: 1.35 }}>
                      {service.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <Tag
                    bordered={false}
                    style={{
                      margin: 0,
                      borderRadius: 999,
                      ...getStatusStyles(service.health?.status ?? "error"),
                      fontWeight: 700,
                    }}
                  >
                    {getStatusLabel(service.health?.status ?? "error")}
                  </Tag>
                  <span style={{ color: "hsl(var(--text-secondary))", fontSize: 12 }}>
                    {service.health?.latencyMs ? `${formatNumber(service.health.latencyMs)} ms` : "Sin latencia"}
                  </span>
                  <span style={{ color: "hsl(var(--text-secondary))", fontSize: 12 }}>
                    {formatNumber(service.dashboard?.activos ?? 0)} activos
                  </span>
                </div>

                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <Button href={service.detailHref} size="small">
                    Detalle
                  </Button>
                  <Button href={service.href} type="primary" size="small">
                    Abrir
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            className="surface-card border-0"
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Cobertura</span>}
            styles={{
              body: {
                display: "grid",
                gap: 8,
                padding: 12,
              },
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 8,
                padding: 12,
                borderRadius: 16,
                border: "1px solid hsl(var(--border-default))",
                background: "hsl(var(--bg-surface))",
              }}
            >
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>Integraciones activas</div>
              <div style={{ color: "hsl(var(--text-primary))", fontSize: 20, fontWeight: 800 }}>
                {connectedCount}/3
              </div>
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, lineHeight: 1.4 }}>
                El panel central solo resume y enruta. Cada sistema mantiene su propia base y su propio contrato.
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {services.map((service) => (
                <Link
                  key={`${service.name}-quick`}
                  href={service.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "0.75rem 0.85rem",
                    borderRadius: 16,
                    border: "1px solid hsl(var(--border-default))",
                    background: "hsl(var(--bg-surface))",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                        ...getAccentStyles(service.accentVar),
                      }}
                    >
                      {service.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "hsl(var(--text-primary))", fontWeight: 700, fontSize: 13 }}>
                        {service.label}
                      </div>
                      <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>
                        {service.dashboard ? "Listo" : "Pendiente"}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: `hsl(var(${service.accentVar}))`, fontSize: 16 }}>›</span>
                </Link>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={14}>
          <Card
            className="surface-card border-0"
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Distribucion por plan</span>}
          >
            <DataTable
              caption="Planes activos por sistema"
              columns={[
                { key: "service", title: "Sistema" },
                { key: "plan", title: "Plan" },
                { key: "total", title: "Total", align: "right" },
              ]}
              rows={planRows}
              emptyState="No hay planes reportados por las integraciones."
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            className="surface-card border-0"
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Alertas DTE prioritarias</span>}
          >
            {state.dteDashboard.status === "fulfilled" ? (
              <DataTable
                columns={[
                  { key: "tenant", title: "Tenant" },
                  { key: "plan", title: "Plan" },
                  { key: "date", title: "Pago" },
                  { key: "status", title: "Estado", align: "right" },
                ]}
                rows={dteAlerts}
                emptyState="No hay alertas DTE pendientes."
              />
            ) : (
              <Alert
                type="warning"
                showIcon
                message="No se pudieron cargar alertas DTE"
                description="Revisa la conexion del servicio para ver vencimientos y cuentas por vencer."
                style={{ borderRadius: 16 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── MoM + Activity log ───────────────────────── */}
      <Row gutter={[12, 12]}>
        <Col xs={24} xl={14}>
          <Card
            className="surface-card border-0"
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                  Evolución mensual — DTE
                </span>
                <Tag bordered={false} style={{ borderRadius: 999, fontSize: 11, background: "hsl(var(--section-dte) / 0.12)", color: "hsl(var(--section-dte))" }}>
                  Últimos 6 meses
                </Tag>
              </div>
            }
            styles={{ body: { padding: "12px 12px 8px" } }}
          >
            {state.dteAnalytics.status === "fulfilled" ? (
              <>
                <MomChart serie={state.dteAnalytics.value.serie} />
                <div style={{ display: "flex", gap: 16, marginTop: 8, paddingLeft: 4 }}>
                  {[
                    { color: "hsl(var(--section-dte))", label: "Nuevos" },
                    { color: "#22c55e", label: "Activaciones" },
                    { color: "#ef4444", label: "Suspensiones" },
                  ].map(({ color, label }) => (
                    <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "hsl(var(--text-muted))" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                      {label}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: "hsl(var(--text-muted))" }}>
                  Barber Pro y ERP Full Pro: endpoint analytics pendiente
                </div>
              </>
            ) : (
              <Alert type="warning" showIcon message="No se pudo cargar la serie mensual de DTE" style={{ borderRadius: 12 }} />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            className="surface-card border-0"
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Actividad reciente — DTE</span>}
            styles={{ body: { padding: 0 } }}
          >
            {state.dteAudit.status === "fulfilled" && state.dteAudit.value.items.length > 0 ? (
              <div style={{ maxHeight: 290, overflowY: "auto" }}>
                {state.dteAudit.value.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "8px 14px",
                      borderBottom: "1px solid hsl(var(--border-default))",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: item.actor_tipo === "sistema"
                          ? "hsl(var(--section-dte) / 0.12)"
                          : "hsl(var(--section-barber) / 0.12)",
                        color: item.actor_tipo === "sistema"
                          ? "hsl(var(--section-dte))"
                          : "hsl(var(--section-barber))",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {item.actor_tipo === "sistema" ? "SYS" : "SA"}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-primary))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.accion}
                      </div>
                      <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>
                        {item.tenant_nombre ? `${item.tenant_nombre} · ` : ""}
                        {item.actor_nombre ?? item.actor_username ?? item.actor_tipo}
                        {" · "}
                        {new Date(item.created_at).toLocaleString("es-SV", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert
                type="info"
                showIcon
                message="Sin actividad reciente o servicio no disponible"
                style={{ borderRadius: 12, margin: 12 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {hasErrors ? (
        <Alert
          type="warning"
          showIcon
          message="Hay integraciones con respuesta incompleta"
          description="El panel sigue operativo, pero conviene revisar health y credenciales de los servicios que no devolvieron datos."
          style={{ borderRadius: 16 }}
        />
      ) : null}
    </div>
  );
}
