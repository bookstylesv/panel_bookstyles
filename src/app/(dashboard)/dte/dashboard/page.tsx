import Link from "next/link";
import { Alert, Card, Col, Descriptions, Row, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  CreditCard,
  Database,
  Map,
  Palette,
  ShieldCheck,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatCurrency, formatDateOnly, formatNumber } from "@/lib/formatters";
import { getDteDashboard, getDteHealthDetail } from "@/lib/integrations/dte";

const { Text } = Typography;

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
    <Row gutter={[12, 12]}>
      {QUICK_LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <Col xs={12} sm={8} md={6} xl={4} key={item.href}>
            <Link href={item.href} style={{ display: "block" }}>
              <Card
                hoverable
                size="small"
                style={{ height: "100%", cursor: "pointer" }}
                styles={{
                  body: {
                    padding: "14px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    textAlign: "center",
                  },
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    color: "hsl(var(--section-dte))",
                    background: "hsl(var(--section-dte) / 0.1)",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "hsl(var(--text-primary))",
                      lineHeight: 1.25,
                    }}
                  >
                    {item.label}
                  </div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, lineHeight: 1.35, display: "block", marginTop: 2 }}
                  >
                    {item.helper}
                  </Text>
                </div>
              </Card>
            </Link>
          </Col>
        );
      })}
    </Row>
  );
}

type AlertRow = {
  id: number;
  nombre: string;
  plan_nombre: string | null;
  fecha_pago: string;
  tipo: "Por vencer" | "Vencido";
};

const ALERT_COLUMNS: ColumnsType<AlertRow> = [
  {
    title: "Tenant",
    dataIndex: "nombre",
    render: (nombre: string, row) => (
      <Link href={`/dte/clientes/${row.id}`} style={{ color: "hsl(var(--section-dte))", fontWeight: 600 }}>
        {nombre}
      </Link>
    ),
  },
  {
    title: "Plan",
    dataIndex: "plan_nombre",
    render: (v: string | null) => v ?? <Text type="secondary">Sin plan</Text>,
  },
  {
    title: "Estado",
    render: (_: unknown, row) => (
      <Tag color={row.tipo === "Vencido" ? "error" : "warning"}>{row.tipo}</Tag>
    ),
  },
  {
    title: "Fecha pago",
    dataIndex: "fecha_pago",
    render: formatDateOnly,
    align: "right" as const,
  },
];

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

  const alertas: AlertRow[] = [
    ...dashboard.alertas_por_vencer.map((item) => ({ ...item, tipo: "Por vencer" as const })),
    ...dashboard.alertas_vencidos.map((item) => ({ ...item, tipo: "Vencido" as const })),
  ];

  const monthlyDelta = dashboard.ingresos_mes - dashboard.ingresos_mes_anterior;
  const monthlyDeltaPct = dashboard.ingresos_mes_anterior
    ? Math.round((monthlyDelta / dashboard.ingresos_mes_anterior) * 100)
    : null;

  const healthDescItems = health
    ? [
        {
          key: "status",
          label: "Estado",
          children: (
            <Tag color={getHealthTone(health.status)}>{getHealthLabel(health.status)}</Tag>
          ),
        },
        { key: "latency", label: "Latencia DB", children: `${formatNumber(health.database.latency_ms)} ms` },
        { key: "db-version", label: "Version DB", children: health.database.version },
        {
          key: "db-pool",
          label: "Pool conexiones",
          children: `${health.database.pool.idle} idle / ${health.database.pool.total} total`,
        },
        {
          key: "uptime",
          label: "Uptime",
          children: `${formatNumber(Math.round(health.process.uptime_seconds / 60))} min`,
        },
        {
          key: "memory",
          label: "Memoria heap",
          children: `${formatNumber(Math.round(health.process.memory.heap_used_mb))} / ${formatNumber(Math.round(health.process.memory.heap_total_mb))} MB`,
        },
        {
          key: "tenants",
          label: "Tenants",
          children: `${formatNumber(health.tenants.activos)} activos / ${formatNumber(health.tenants.suspendidos)} suspendidos`,
        },
      ]
    : [];

  const resumenItems = [
    { key: "total", label: "Total tenants", children: formatNumber(dashboard.total) },
    { key: "pruebas", label: "En pruebas", children: formatNumber(dashboard.en_pruebas) },
    { key: "suspendidos", label: "Suspendidos", children: formatNumber(dashboard.suspendidos) },
    { key: "por-vencer", label: "Por vencer", children: formatNumber(dashboard.por_vencer) },
    { key: "vencidos", label: "Vencidos", children: formatNumber(dashboard.vencidos) },
    { key: "nuevos-semana", label: "Nuevos esta semana", children: formatNumber(dashboard.nuevos_semana) },
    { key: "nuevos-mes", label: "Nuevos este mes", children: formatNumber(dashboard.nuevos_mes) },
    { key: "ingreso-mes", label: "Ingreso del mes", children: formatCurrency(dashboard.ingresos_mes) },
    {
      key: "delta-mes",
      label: "Delta mensual",
      children: `${monthlyDelta >= 0 ? "+" : ""}${formatCurrency(monthlyDelta)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="DTE"
        title="Superadmin DTE"
        description="Vista operativa con foco en ingresos, renovaciones, salud del servicio y acceso directo a los modulos clave."
        actions={
          <>
            <Tag
              bordered={false}
              style={{
                margin: 0,
                borderRadius: 999,
                paddingInline: "0.85rem",
                background: "hsl(var(--status-success-bg))",
                color: "hsl(var(--status-success))",
                fontWeight: 700,
              }}
            >
              {formatNumber(dashboard.activos)} activos
            </Tag>
            <Tag
              bordered={false}
              style={{
                margin: 0,
                borderRadius: 999,
                paddingInline: "0.85rem",
                background: "hsl(var(--bg-subtle))",
                color: "hsl(var(--text-secondary))",
                fontWeight: 700,
              }}
            >
              {formatNumber(dashboard.total)} tenants
            </Tag>
            <Tag
              bordered={false}
              style={{
                margin: 0,
                borderRadius: 999,
                paddingInline: "0.85rem",
                background: health ? "hsl(var(--status-success-bg))" : "hsl(var(--status-error-bg))",
                color: health ? "hsl(var(--status-success))" : "hsl(var(--status-error))",
                fontWeight: 700,
              }}
            >
              {health ? getHealthLabel(health.status) : "Health pendiente"}
            </Tag>
          </>
        }
      />

      {/* Metric cards */}
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

      {/* Quick access */}
      <Card
        className="surface-card border-0"
        title={
          <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
            Acceso rapido — modulos DTE
          </span>
        }
        size="small"
      >
        <QuickAccessGrid />
      </Card>

      {/* Alerts + Health */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card
            className="surface-card border-0"
            title={
              <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                Alertas de renovacion
              </span>
            }
            size="small"
            extra={
              <Tag bordered={false} color={alertas.length > 0 ? "warning" : "success"}>
                {alertas.length} alerta{alertas.length !== 1 ? "s" : ""}
              </Tag>
            }
          >
            <Table<AlertRow>
              size="small"
              dataSource={alertas}
              columns={ALERT_COLUMNS}
              rowKey={(row) => `${row.tipo}-${row.id}`}
              pagination={false}
              locale={{ emptyText: "No hay alertas de renovacion activas." }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card
            className="surface-card border-0"
            title={
              <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                Salud del servicio
              </span>
            }
            size="small"
            extra={
              health ? (
                <Tag
                  color={getHealthTone(health.status)}
                  bordered={false}
                  style={{ borderRadius: 999 }}
                >
                  {getHealthLabel(health.status)}
                </Tag>
              ) : (
                <Tag color="error" bordered={false} style={{ borderRadius: 999 }}>
                  Sin health
                </Tag>
              )
            }
          >
            {health ? (
              <Descriptions
                size="small"
                column={1}
                bordered
                items={healthDescItems}
                style={{ borderRadius: 10, overflow: "hidden" }}
              />
            ) : (
              <Alert
                type="error"
                showIcon
                message="No se pudo cargar el health detail"
                description={healthError instanceof Error ? healthError.message : "No disponible"}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Resumen + Lectura operativa */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            className="surface-card border-0"
            title={
              <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                Resumen de cartera
              </span>
            }
            size="small"
          >
            <Descriptions
              size="small"
              column={1}
              bordered
              items={resumenItems}
              style={{ borderRadius: 10, overflow: "hidden" }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            className="surface-card border-0"
            title={
              <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                Lectura operativa
              </span>
            }
            size="small"
            extra={
              <a href="/dte/clientes" style={{ fontSize: 12, color: "hsl(var(--section-dte))", fontWeight: 600 }}>
                Abrir clientes →
              </a>
            }
          >
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
              <Col xs={12}>
                <div
                  style={{
                    borderRadius: 12,
                    padding: "14px",
                    border: "1px solid hsl(var(--border-default))",
                    background: "hsl(var(--bg-subtle))",
                  }}
                >
                  <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginBottom: 6 }}>
                    Renovacion activa
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      color: "hsl(var(--section-dte))",
                    }}
                  >
                    {formatNumber(dashboard.total - dashboard.suspendidos)}
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div
                  style={{
                    borderRadius: 12,
                    padding: "14px",
                    border: "1px solid hsl(var(--border-default))",
                    background: "hsl(var(--bg-subtle))",
                  }}
                >
                  <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginBottom: 6 }}>
                    Alertas abiertas
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      color: alertas.length > 0 ? "hsl(var(--state-warning))" : "hsl(var(--state-success))",
                    }}
                  >
                    {formatNumber(alertas.length)}
                  </div>
                </div>
              </Col>
            </Row>

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
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
