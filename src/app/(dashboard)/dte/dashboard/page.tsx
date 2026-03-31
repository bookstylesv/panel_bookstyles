import Link from "next/link";
import { Alert, Button, Card, Col, Row, Tag } from "antd";
import { Activity, ArrowRight, BarChart3, BookOpen, Building2, CreditCard, Database, Map, Palette, ShieldCheck, Users } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatCurrency, formatDateOnly, formatNumber } from "@/lib/formatters";
import { getDteDashboard, getDteHealthDetail } from "@/lib/integrations/dte";

const QUICK_LINKS = [
  { href: "/dte/clientes", label: "Clientes", helper: "Listado maestro y detalle operativo", icon: Users },
  { href: "/dte/planes", label: "Planes", helper: "Tarifas, limites y activacion", icon: CreditCard },
  { href: "/dte/departamentos", label: "Departamentos", helper: "Catalogo territorial", icon: Building2 },
  { href: "/dte/municipios", label: "Municipios", helper: "Relacion territorial", icon: Map },
  { href: "/dte/mapa", label: "Mapa", helper: "Distribucion geografica", icon: BarChart3 },
  { href: "/dte/analytics", label: "Analytics", helper: "KPIs e historico", icon: Activity },
  { href: "/dte/auditoria", label: "Auditoria", helper: "Eventos y acciones", icon: ShieldCheck },
  { href: "/dte/health", label: "Health", helper: "Salud, latencia y proceso", icon: Database },
  { href: "/dte/backups", label: "Backups", helper: "Retencion y descargas", icon: BookOpen },
  { href: "/dte/tema", label: "Tema", helper: "Tokens y apariencia", icon: Palette },
];

async function loadDteDashboard() {
  const [dashboardResult, healthResult] = await Promise.allSettled([
    getDteDashboard(),
    getDteHealthDetail(),
  ]);

  return { dashboardResult, healthResult };
}

function getHealthTone(status: string) {
  if (status === "ok") return "success";
  if (status === "degraded") return "warning";
  return "error";
}

function getHealthLabel(status: string) {
  if (status === "ok") return "Operativo";
  if (status === "degraded") return "Con degradacion";
  return "Sin conexion";
}

function QuickAccessGrid() {
  return (
    <div
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
      }}
    >
      {QUICK_LINKS.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.9rem",
              borderRadius: "1rem",
              border: "1px solid hsl(var(--border-default))",
              background: "hsl(var(--bg-surface))",
              padding: "0.9rem 1rem",
              minHeight: "4.4rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", minWidth: 0 }}>
              <div
                style={{
                  width: "2.4rem",
                  height: "2.4rem",
                  borderRadius: "0.85rem",
                  display: "grid",
                  placeItems: "center",
                  color: "hsl(var(--section-dte))",
                  background: "hsl(var(--section-dte) / 0.12)",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: "hsl(var(--text-primary))",
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    color: "hsl(var(--text-muted))",
                    fontSize: "0.82rem",
                    lineHeight: 1.35,
                  }}
                >
                  {item.helper}
                </div>
              </div>
            </div>
            <ArrowRight size={15} color="hsl(var(--section-dte))" />
          </Link>
        );
      })}
    </div>
  );
}

export default async function DteDashboardPage() {
  const result = await loadDteDashboard();

  if (result.dashboardResult.status === "rejected") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="DTE"
          title="Dashboard DTE"
          description="No se pudo cargar el dashboard de DTE desde el servidor."
        />
        <Alert
          type="error"
          showIcon
          message="Fallo la integracion DTE"
          description={getErrorMessage(result.dashboardResult.reason)}
        />
        <Card className="surface-card border-0">
          <QuickAccessGrid />
        </Card>
      </div>
    );
  }

  const dashboard = result.dashboardResult.value;
  const health = result.healthResult.status === "fulfilled" ? result.healthResult.value : null;
  const healthError = result.healthResult.status === "rejected" ? result.healthResult.reason : null;

  const alertas = [
    ...dashboard.alertas_por_vencer.map((item) => ({ ...item, tipo: "Por vencer" as const })),
    ...dashboard.alertas_vencidos.map((item) => ({ ...item, tipo: "Vencido" as const })),
  ];
  const monthlyDelta = dashboard.ingresos_mes - dashboard.ingresos_mes_anterior;
  const monthlyDeltaPct = dashboard.ingresos_mes_anterior
    ? Math.round((monthlyDelta / dashboard.ingresos_mes_anterior) * 100)
    : null;

  const healthRows = health
    ? [
        { key: "status", cells: ["Estado", <Tag key="status" color={getHealthTone(health.status)}>{getHealthLabel(health.status)}</Tag>] },
        { key: "latency", cells: ["Latencia DB", `${formatNumber(health.database.latency_ms)} ms`] },
        { key: "db-version", cells: ["Version DB", health.database.version] },
        { key: "db-pool", cells: ["Pool", `${health.database.pool.idle}/${health.database.pool.total}`] },
        { key: "uptime", cells: ["Uptime", `${formatNumber(Math.round(health.process.uptime_seconds / 60))} min`] },
        { key: "memory", cells: ["Memoria", `${formatNumber(Math.round(health.process.memory.heap_used_mb))} / ${formatNumber(Math.round(health.process.memory.heap_total_mb))} MB`] },
        { key: "tenants", cells: ["Tenants", `${formatNumber(health.tenants.activos)} activos / ${formatNumber(health.tenants.suspendidos)} suspendidos`] },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Superadmin DTE"
        description="Vista operativa con foco en ingresos, renovaciones, salud del servicio y acceso directo a los modulos clave."
        actions={
          <>
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.85rem", background: "hsl(var(--status-success-bg))", color: "hsl(var(--status-success))", fontWeight: 700 }}>
              {formatNumber(dashboard.activos)} activos
            </Tag>
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.85rem", background: "hsl(var(--bg-subtle))", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>
              {formatNumber(dashboard.total)} tenants
            </Tag>
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.85rem", background: health ? "hsl(var(--status-info-bg))" : "hsl(var(--status-error-bg))", color: health ? "hsl(var(--status-info))" : "hsl(var(--status-error))", fontWeight: 700 }}>
              {health ? getHealthLabel(health.status) : "Health pendiente"}
            </Tag>
          </>
        }
      />

      <Card
        className="surface-card border-0"
        styles={{
          body: {
            display: "grid",
            gap: "1.25rem",
            padding: "1.4rem",
          },
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
            alignItems: "center",
          }}
        >
          <div>
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--accent-soft) / 0.72)", color: "hsl(var(--accent-strong))", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Centro DTE
            </Tag>
            <h3
              style={{
                margin: "0.9rem 0 0.45rem 0",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 2.2vw, 2rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              Control operativo para cartera, renovaciones y modulos administrativos.
            </h3>
            <p style={{ margin: 0, maxWidth: 720, color: "hsl(var(--text-muted))", lineHeight: 1.6 }}>
              Esta vista concentra el estado del negocio, la lectura financiera del mes y el acceso
              directo a clientes, planes, geografia, auditoria, salud, tema y backups.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
            }}
          >
            <div style={{ borderRadius: "1rem", padding: "0.95rem", border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-subtle))" }}>
              <div style={{ fontSize: "0.78rem", color: "hsl(var(--text-muted))" }}>MRR</div>
              <strong style={{ display: "block", marginTop: "0.35rem", fontFamily: "var(--font-display)", fontSize: "1.35rem" }}>
                {formatCurrency(dashboard.mrr)}
              </strong>
            </div>
            <div style={{ borderRadius: "1rem", padding: "0.95rem", border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-subtle))" }}>
              <div style={{ fontSize: "0.78rem", color: "hsl(var(--text-muted))" }}>Cobrado mes</div>
              <strong style={{ display: "block", marginTop: "0.35rem", fontFamily: "var(--font-display)", fontSize: "1.35rem" }}>
                {formatCurrency(dashboard.ingresos_mes)}
              </strong>
            </div>
            <div style={{ borderRadius: "1rem", padding: "0.95rem", border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-subtle))" }}>
              <div style={{ fontSize: "0.78rem", color: "hsl(var(--text-muted))" }}>Alertas</div>
              <strong style={{ display: "block", marginTop: "0.35rem", fontFamily: "var(--font-display)", fontSize: "1.35rem" }}>
                {formatNumber(dashboard.por_vencer + dashboard.vencidos)}
              </strong>
            </div>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            title="MRR"
            value={formatCurrency(dashboard.mrr)}
            accentVar="--section-dte"
            hint="Ingreso recurrente mensual proyectado"
            icon={<CreditCard size={18} />}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            title="Cobrado este mes"
            value={formatCurrency(dashboard.ingresos_mes)}
            accentVar="--section-dte"
            hint={
              monthlyDeltaPct === null
                ? "Sin comparativa previa"
                : `${monthlyDeltaPct >= 0 ? "+" : ""}${monthlyDeltaPct}% vs mes anterior`
            }
            icon={<ShieldCheck size={18} />}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            title="Activos"
            value={dashboard.activos}
            accentVar="--section-dte"
            hint={`${formatNumber(dashboard.en_pruebas)} en pruebas`}
            icon={<Users size={18} />}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            title="Vencimientos"
            value={dashboard.por_vencer + dashboard.vencidos}
            accentVar="--section-dte"
            hint={`${formatNumber(dashboard.vencidos)} vencidos y ${formatNumber(dashboard.por_vencer)} por vencer`}
            icon={<Activity size={18} />}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card className="surface-card border-0">
            <DataTable
              caption="Alertas de renovacion"
              columns={[
                { key: "tenant", title: "Tenant" },
                { key: "plan", title: "Plan" },
                { key: "estado", title: "Estado" },
                { key: "fechaPago", title: "Fecha pago" },
              ]}
              rows={alertas.map((item) => ({
                key: `${item.tipo}-${item.id}`,
                cells: [
                  <Link key={`tenant-${item.id}`} href={`/dte/clientes/${item.id}`}>
                    {item.nombre}
                  </Link>,
                  item.plan_nombre ?? "Sin plan",
                  <Tag key={`tag-${item.id}`} color={item.tipo === "Vencido" ? "error" : "warning"}>
                    {item.tipo}
                  </Tag>,
                  formatDateOnly(item.fecha_pago),
                ],
              }))}
              emptyState="No hay alertas de renovacion activas."
            />
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card className="surface-card border-0" styles={{ body: { display: "grid", gap: "0.9rem" } }}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-primary))" }}>
                    Salud del servicio
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "hsl(var(--text-muted))" }}>
                    Estado de la plataforma DTE y latencia real
                  </div>
                </div>
                {health ? (
                  <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: `hsl(var(--status-${getHealthTone(health.status)}-bg))`, color: `hsl(var(--status-${getHealthTone(health.status)}))`, fontWeight: 700 }}>
                    {getHealthLabel(health.status)}
                  </Tag>
                ) : (
                  <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--status-error-bg))", color: "hsl(var(--status-error))", fontWeight: 700 }}>
                    Sin health
                  </Tag>
                )}
              </div>

              {health ? (
                <div style={{ marginTop: "0.9rem" }}>
                  <DataTable
                    caption="Salud tecnica"
                    columns={[
                      { key: "indicador", title: "Indicador" },
                      { key: "valor", title: "Valor", align: "right" },
                    ]}
                    rows={healthRows}
                  />
                </div>
              ) : (
                <Alert
                  type="error"
                  showIcon
                  message="No se pudo cargar el health detail"
                  description={healthError instanceof Error ? healthError.message : "No disponible"}
                  style={{ borderRadius: "1rem", marginTop: "0.9rem" }}
                />
              )}
            </div>

            <div style={{ borderTop: "1px solid hsl(var(--border-default))", paddingTop: "0.9rem" }}>
              <QuickAccessGrid />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card className="surface-card border-0">
            <DataTable
              caption="Resumen de cartera"
              columns={[
                { key: "indicador", title: "Indicador" },
                { key: "valor", title: "Valor", align: "right" },
              ]}
              rows={[
                { key: "total", cells: ["Total", formatNumber(dashboard.total)] },
                { key: "pruebas", cells: ["En pruebas", formatNumber(dashboard.en_pruebas)] },
                { key: "suspendidos", cells: ["Suspendidos", formatNumber(dashboard.suspendidos)] },
                { key: "por-vencer", cells: ["Por vencer", formatNumber(dashboard.por_vencer)] },
                { key: "vencidos", cells: ["Vencidos", formatNumber(dashboard.vencidos)] },
                { key: "nuevos-semana", cells: ["Nuevos semana", formatNumber(dashboard.nuevos_semana)] },
                { key: "nuevos-mes", cells: ["Nuevos mes", formatNumber(dashboard.nuevos_mes)] },
                { key: "ingreso-mes", cells: ["Ingreso mes", formatCurrency(dashboard.ingresos_mes)] },
                {
                  key: "delta-mes",
                  cells: [
                    "Delta mensual",
                    `${monthlyDelta >= 0 ? "+" : ""}${formatCurrency(monthlyDelta)}`,
                  ],
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className="surface-card border-0" styles={{ body: { display: "grid", gap: "0.85rem" } }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(var(--text-primary))" }}>
                  Lectura operativa
                </div>
                <div style={{ fontSize: "0.82rem", color: "hsl(var(--text-muted))" }}>
                  Acciones sugeridas desde la posicion actual
                </div>
              </div>
              <Button href="/dte/clientes" type="default">
                Abrir clientes
              </Button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "0.75rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
              }}
            >
              <div style={{ borderRadius: "1rem", padding: "0.95rem", border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-subtle))" }}>
                <div style={{ fontSize: "0.78rem", color: "hsl(var(--text-muted))" }}>Renovacion activa</div>
                <strong style={{ display: "block", marginTop: "0.35rem", fontFamily: "var(--font-display)", fontSize: "1.35rem" }}>
                  {formatNumber(dashboard.total - dashboard.suspendidos)}
                </strong>
              </div>
              <div style={{ borderRadius: "1rem", padding: "0.95rem", border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-subtle))" }}>
                <div style={{ fontSize: "0.78rem", color: "hsl(var(--text-muted))" }}>Alertas abiertas</div>
                <strong style={{ display: "block", marginTop: "0.35rem", fontFamily: "var(--font-display)", fontSize: "1.35rem" }}>
                  {formatNumber(alertas.length)}
                </strong>
              </div>
            </div>

            <Alert
              type={dashboard.vencidos > 0 ? "warning" : "success"}
              showIcon
              message={
                dashboard.vencidos > 0
                  ? "Hay cuentas DTE vencidas que requieren seguimiento"
                  : "No hay cuentas vencidas al corte actual"
              }
              description={
                dashboard.vencidos > 0
                  ? `${formatNumber(dashboard.vencidos)} tenants vencidos y ${formatNumber(dashboard.por_vencer)} por vencer.`
                  : "La cartera actual se mantiene operativa."
              }
              style={{ borderRadius: "1rem" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
