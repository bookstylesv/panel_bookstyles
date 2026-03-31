import { Alert, Card, Col, Progress, Row, Tag } from "antd";
import { BarChart3, Coins, ShieldCheck, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getDteAnalytics } from "@/lib/integrations/dte";

async function loadAnalytics() {
  try {
    const analytics = await getDteAnalytics();
    return { analytics };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function formatSignedPercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatNumber(Math.abs(value))}%`;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>{children}</span>;
}

function InfoBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid hsl(var(--border-default))",
        background: "hsl(var(--bg-surface))",
        padding: "0.95rem 1rem",
      }}
    >
      <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ marginTop: 8, color: "hsl(var(--text-primary))", fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}

export default async function DteAnalyticsPage() {
  const result = await loadAnalytics();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Analytics" description="Lectura historica del ecosistema DTE." />
        <Alert type="error" showIcon message="No se pudieron cargar los datos analiticos" description={result.error} />
      </div>
    );
  }

  const { analytics } = result;
  const totalStates = analytics.por_estado.reduce((sum, item) => sum + item.total, 0);
  const activeState = analytics.por_estado.find((item) => item.estado === "activo")?.total ?? 0;
  const activeRate = totalStates > 0 ? Math.round((activeState / totalStates) * 100) : 0;
  const topPlan = analytics.por_plan[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Analytics"
        description="KPIs compactos de ingreso, activaciones y distribucion DTE."
        actions={
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 999,
              background: "hsl(var(--accent-soft))",
              color: "hsl(var(--accent-strong))",
              fontWeight: 700,
            }}
          >
            MoM {formatSignedPercent(analytics.kpis.crecimiento_mom)}
          </Tag>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <InfoBlock label="Ingreso YTD" value={formatCurrency(analytics.kpis.ingreso_ytd)} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <InfoBlock label="Nuevos mes" value={formatNumber(analytics.kpis.nuevos_mes)} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <InfoBlock label="Activaciones" value={formatNumber(analytics.kpis.activaciones_mes)} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <InfoBlock label="Suspensiones" value={formatNumber(analytics.kpis.suspensiones_mes)} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card className="surface-card border-0" title={<SectionLabel>Serie mensual</SectionLabel>}>
            <DataTable
              caption="Comportamiento economico"
              columns={[
                { key: "mes", title: "Mes" },
                { key: "ingresos", title: "Ingresos", align: "right" },
                { key: "nuevos", title: "Nuevos", align: "right" },
                { key: "altas", title: "Altas", align: "right" },
                { key: "bajas", title: "Bajas", align: "right" },
              ]}
              rows={analytics.serie.map((item) => ({
                key: item.mes,
                cells: [
                  item.mes_label,
                  formatCurrency(item.ingresos),
                  formatNumber(item.nuevos),
                  formatNumber(item.activaciones),
                  formatNumber(item.suspensiones),
                ],
              }))}
              emptyState="No hay serie historica disponible."
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card className="surface-card border-0" title={<SectionLabel>Lectura del negocio</SectionLabel>}>
            <div className="space-y-4">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Activos</span>
                  <span style={{ color: "hsl(var(--text-primary))", fontWeight: 700 }}>{activeRate}%</span>
                </div>
                <Progress percent={activeRate} strokeColor="hsl(var(--section-dte))" showInfo={false} />
              </div>

              <div style={{ padding: "0.85rem 0.95rem", borderRadius: 14, background: "hsl(var(--bg-subtle))", border: "1px solid hsl(var(--border-default))", lineHeight: 1.55, color: "hsl(var(--text-muted))", fontSize: 13 }}>
                Movimiento MoM y plan dominante, sin texto de relleno.
              </div>

              <Alert
                type={analytics.kpis.crecimiento_mom >= 0 ? "success" : "warning"}
                showIcon
                message={analytics.kpis.crecimiento_mom >= 0 ? "Crecimiento positivo" : "Crecimiento bajo"}
                description={`Movimiento MoM: ${formatSignedPercent(analytics.kpis.crecimiento_mom)}`}
              />

              {topPlan ? (
                <InfoBlock
                  label="Plan dominante"
                  value={`${topPlan.plan} - ${formatNumber(topPlan.total)} tenants`}
                />
              ) : null}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card className="surface-card border-0" title={<SectionLabel>Distribucion por plan</SectionLabel>}>
            <DataTable
              caption="Mix comercial"
              columns={[
                { key: "plan", title: "Plan" },
                { key: "total", title: "Total", align: "right" },
                { key: "activos", title: "Activos", align: "right" },
                { key: "precio", title: "Precio", align: "right" },
              ]}
              rows={analytics.por_plan.map((item) => ({
                key: item.plan,
                cells: [
                  item.plan,
                  formatNumber(item.total),
                  formatNumber(item.activos),
                  formatCurrency(item.precio),
                ],
              }))}
              emptyState="No hay distribucion por plan."
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className="surface-card border-0" title={<SectionLabel>Estados del portafolio</SectionLabel>}>
            <DataTable
              caption="Salud de cartera"
              columns={[
                { key: "estado", title: "Estado" },
                { key: "total", title: "Total", align: "right" },
                { key: "share", title: "Participacion", align: "right" },
              ]}
              rows={analytics.por_estado.map((item) => {
                const share = totalStates > 0 ? Math.round((item.total / totalStates) * 100) : 0;

                return {
                  key: item.estado,
                  cells: [
                    <Tag key={`${item.estado}-tag`} bordered={false} color={item.estado === "activo" ? "success" : item.estado === "pruebas" ? "warning" : "error"}>
                      {item.estado}
                    </Tag>,
                    formatNumber(item.total),
                    `${share}%`,
                  ],
                };
              })}
              emptyState="No hay estados disponibles."
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
