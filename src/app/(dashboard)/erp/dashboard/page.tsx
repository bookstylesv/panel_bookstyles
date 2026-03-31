import { Alert, Card, Col, Descriptions, Row, Tag } from "antd";
import type { ReactNode } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { formatNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getErpDashboard } from "@/lib/integrations/erp";

async function loadErpDashboard() {
  try {
    const dashboard = await getErpDashboard();
    return { dashboard };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function MiniStatCard({
  title,
  value,
  hint,
  accent,
}: {
  title: string;
  value: string | number;
  hint: string;
  accent: string;
}) {
  return (
    <Card
      className="surface-card border-0"
      styles={{
        body: {
          display: "grid",
          gap: 8,
          padding: 12,
          minHeight: 100,
          borderTop: `3px solid ${accent}`,
        },
      }}
    >
      <div style={{ color: "hsl(var(--text-secondary))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {title}
      </div>
      <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, lineHeight: 1.35 }}>{hint}</div>
    </Card>
  );
}

export default async function ErpDashboardPage() {
  const result = await loadErpDashboard();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <Card className="surface-card border-0" styles={{ body: { padding: 14 } }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Tag
              bordered={false}
              style={{
                margin: 0,
                width: "fit-content",
                borderRadius: 999,
                paddingInline: "0.75rem",
                background: "hsl(var(--section-erp) / 0.12)",
                color: "hsl(var(--section-erp))",
                fontWeight: 700,
              }}
            >
              ERP
            </Tag>
            <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.5rem, 2.3vw, 1.9rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              Dashboard ERP Full Pro
            </h1>
            <p style={{ margin: 0, maxWidth: 640, color: "hsl(var(--text-muted))", fontSize: 13.5, lineHeight: 1.45 }}>
              Vista compacta para revisar cobertura y estado sin meter una portada grande antes de los datos.
            </p>
          </div>
        </Card>
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const total = result.dashboard.total;
  const activos = result.dashboard.activos;
  const enTrial = result.dashboard.en_trial;
  const suspendidos = result.dashboard.suspendidos;
  const coverage = total > 0 ? Math.round((activos / total) * 100) : 0;
  const planRows = Object.entries(result.dashboard.por_plan).map(([plan, total]) => ({ plan, total }));

  return (
    <div className="space-y-4">
      <Card
        className="surface-card border-0"
        styles={{
          body: {
            display: "grid",
            gap: 10,
            padding: 14,
          },
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(280px, 0.75fr)",
            alignItems: "center",
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <Tag
              bordered={false}
              style={{
                margin: 0,
                width: "fit-content",
                borderRadius: 999,
                paddingInline: "0.75rem",
                background: "hsl(var(--section-erp) / 0.12)",
                color: "hsl(var(--section-erp))",
                fontWeight: 700,
              }}
            >
              ERP
            </Tag>
            <h1
              style={{
                margin: 0,
                color: "hsl(var(--text-primary))",
                fontSize: "clamp(1.5rem, 2.3vw, 1.95rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              Cobertura operativa y estado del ERP en una sola lectura.
            </h1>
            <p style={{ margin: 0, maxWidth: 650, color: "hsl(var(--text-muted))", fontSize: 13.5, lineHeight: 1.45 }}>
              Resumen compacto para ver capacidad, actividad y salud del contrato superadmin sin espacios sobrantes.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
              padding: 12,
              borderRadius: 18,
              border: "1px solid hsl(var(--border-default))",
              background: "hsl(var(--bg-surface))",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>Cobertura</div>
                <div style={{ color: "hsl(var(--text-primary))", fontSize: 20, fontWeight: 800 }}>{coverage}%</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>Activos</div>
                <div style={{ color: "hsl(var(--text-primary))", fontSize: 20, fontWeight: 800 }}>{formatNumber(activos)}</div>
              </div>
            </div>
            <Descriptions bordered={false} column={1} size="small">
              <Descriptions.Item label="Total">{formatNumber(total)}</Descriptions.Item>
              <Descriptions.Item label="En trial">{formatNumber(enTrial)}</Descriptions.Item>
              <Descriptions.Item label="Suspendidos">{formatNumber(suspendidos)}</Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <MiniStatCard title="Total" value={formatNumber(total)} hint="Tenants registrados" accent="hsl(var(--section-erp))" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MiniStatCard title="Activos" value={formatNumber(activos)} hint="Con servicio disponible" accent="hsl(var(--status-success))" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MiniStatCard title="En trial" value={formatNumber(enTrial)} hint="Cuentas en periodo de prueba" accent="hsl(var(--status-warning))" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MiniStatCard title="Suspendidos" value={formatNumber(suspendidos)} hint="Requieren revision" accent="hsl(var(--status-error))" />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={15}>
          <Card
            className="surface-card border-0"
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Distribucion por plan</span>}
            styles={{ body: { padding: 12 } }}
          >
            <DataTable
              caption="Planes activos por segmento ERP"
              columns={[
                { key: "plan", title: "Plan" },
                { key: "total", title: "Total", align: "right" },
              ]}
              rows={planRows.map((row) => ({
                key: row.plan,
                cells: [row.plan, formatNumber(row.total)],
              }))}
              emptyState="No hay planes reportados por el ERP."
            />
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card
            className="surface-card border-0"
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Lectura operativa</span>}
            styles={{ body: { display: "grid", gap: 8, padding: 12 } }}
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
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>Cobertura activa</div>
              <div style={{ color: "hsl(var(--text-primary))", fontSize: 20, fontWeight: 800 }}>{coverage}%</div>
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, lineHeight: 1.4 }}>
                {formatNumber(activos)} activos sobre {formatNumber(total)} totales.
              </div>
            </div>

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
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>Segmentacion</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--status-success-bg))", color: "hsl(var(--status-success))", fontWeight: 700 }}>
                  {formatNumber(activos)} activos
                </Tag>
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--status-warning-bg))", color: "hsl(var(--status-warning))", fontWeight: 700 }}>
                  {formatNumber(enTrial)} trial
                </Tag>
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--status-error-bg))", color: "hsl(var(--status-error))", fontWeight: 700 }}>
                  {formatNumber(suspendidos)} suspendidos
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
