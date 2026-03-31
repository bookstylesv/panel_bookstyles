import { Alert, Card, Col, Row, Table } from "antd";
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
        <Col xs={24} md={12} xl={6}><MetricCard title="Total" value={formatNumber(result.dashboard.total)} accentVar="--section-erp" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="Activos" value={formatNumber(result.dashboard.activos)} accentVar="--section-erp" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="En trial" value={formatNumber(result.dashboard.en_trial)} accentVar="--section-erp" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="Suspendidos" value={formatNumber(result.dashboard.suspendidos)} accentVar="--section-erp" /></Col>
      </Row>
      <Card className="surface-card border-0">
        <Table
          rowKey="plan"
          dataSource={planRows}
          pagination={false}
          columns={[
            { title: "Plan", dataIndex: "plan" },
            { title: "Total", dataIndex: "total", render: (value: number) => formatNumber(value) },
          ]}
        />
      </Card>
    </div>
  );
}
