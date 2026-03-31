import { Alert, Card, Col, Row } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatNumber } from "@/lib/formatters";
import { getErpDashboard } from "@/lib/integrations/erp";

async function loadErpDashboard() {
  try {
    const dashboard = await getErpDashboard();
    return { dashboard };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function ErpDashboardPage() {
  const result = await loadErpDashboard();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="ERP"
          title="Dashboard ERP Full Pro"
          description="La UI de ERP ya esta lista en el panel, pero la API superadmin aun debe habilitarse en Erp-full-web."
        />
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const planRows = Object.entries(result.dashboard.por_plan).map(([plan, total]) => ({ plan, total }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ERP" title="Dashboard ERP Full Pro" description="Resumen central del estado multi-tenant del ERP." />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}><MetricCard title="Total" value={formatNumber(result.dashboard.total)} accentVar="--section-erp" tone="section" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="Activos" value={formatNumber(result.dashboard.activos)} accentVar="--section-erp" tone="success" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="En trial" value={formatNumber(result.dashboard.en_trial)} accentVar="--section-erp" tone="warning" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="Suspendidos" value={formatNumber(result.dashboard.suspendidos)} accentVar="--section-erp" tone="danger" /></Col>
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
