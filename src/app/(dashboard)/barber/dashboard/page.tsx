import { Alert, Card, Col, Row } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatNumber } from "@/lib/formatters";
import { getBarberDashboard } from "@/lib/integrations/barber";

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
      <div className="space-y-6">
        <PageHeader eyebrow="Barber" title="Dashboard Barber Pro" description="No se pudo cargar el dashboard de Barber Pro." />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  const planRows = Object.entries(result.dashboard.por_plan).map(([plan, total]) => ({ plan, total }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Barber"
        title="Dashboard Barber Pro"
        description="Monitoreo central de barberias, trials y suscripciones activas."
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}><MetricCard title="Total" value={formatNumber(result.dashboard.total)} accentVar="--section-barber" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="Activos" value={formatNumber(result.dashboard.activos)} accentVar="--section-barber" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="En trial" value={formatNumber(result.dashboard.en_trial)} accentVar="--section-barber" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="Suspendidos" value={formatNumber(result.dashboard.suspendidos)} accentVar="--section-barber" /></Col>
      </Row>
      <Card className="surface-card border-0">
        <DataTable
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
