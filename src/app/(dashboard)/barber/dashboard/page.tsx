import { Alert, Card, Col, Row } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { getErrorMessage } from "@/lib/error-message";
import { formatNumber } from "@/lib/formatters";
import { getBarberDashboard } from "@/lib/integrations/barber";

function CompactStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "section" | "success" | "warning" | "danger";
}) {
  const accent =
    tone === "success"
      ? "hsl(var(--status-success))"
      : tone === "warning"
        ? "hsl(var(--status-warning))"
        : tone === "danger"
          ? "hsl(var(--status-error))"
          : "hsl(var(--section-barber))";

  return (
    <Card
      className="surface-card border-0"
      styles={{
        body: {
          padding: "0.8rem 0.9rem",
        },
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            flexShrink: 0,
            background: accent,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 700 }}>
            {label}
          </div>
          <div
            style={{
              color: "hsl(var(--text-primary))",
              fontSize: "clamp(1.25rem, 2vw, 1.55rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

async function loadBarberDashboard() {
  try {
    const dashboard = await getBarberDashboard();
    return { dashboard };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberDashboardPage() {
  const result = await loadBarberDashboard();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <div>
          <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Barber
          </div>
          <h1 style={{ margin: "0.35rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.25rem, 2vw, 1.6rem)", lineHeight: 1.1 }}>
            Dashboard Barber Pro
          </h1>
        </div>
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  const planRows = Object.entries(result.dashboard.por_plan).map(([plan, total]) => ({ plan, total }));

  return (
    <div className="space-y-4">
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Barber
        </div>
        <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.25rem, 2vw, 1.65rem)", lineHeight: 1.1 }}>
          Dashboard Barber Pro
        </h1>
        <p style={{ margin: 0, color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.45 }}>
          Monitoreo central de barberias, trials y suscripciones activas.
        </p>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12} xl={6}><CompactStat label="Total" value={formatNumber(result.dashboard.total)} tone="section" /></Col>
        <Col xs={24} md={12} xl={6}><CompactStat label="Activos" value={formatNumber(result.dashboard.activos)} tone="success" /></Col>
        <Col xs={24} md={12} xl={6}><CompactStat label="En trial" value={formatNumber(result.dashboard.en_trial)} tone="warning" /></Col>
        <Col xs={24} md={12} xl={6}><CompactStat label="Suspendidos" value={formatNumber(result.dashboard.suspendidos)} tone="danger" /></Col>
      </Row>
      <Card
        className="surface-card border-0"
        styles={{ body: { padding: "0.9rem 1rem 1rem" } }}
        title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Distribucion por plan</span>}
      >
        <DataTable
          caption="Barberias activas por plan."
          columns={[
            { key: "plan", title: "Plan" },
            { key: "total", title: "Total", align: "right" },
          ]}
          rows={planRows.map((row) => ({
            key: row.plan,
            cells: [row.plan, formatNumber(row.total)],
          }))}
        />
      </Card>
    </div>
  );
}
