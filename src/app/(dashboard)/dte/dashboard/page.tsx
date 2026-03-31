import { Alert, Card, Col, Row, Table, Tag } from "antd";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatCurrency, formatDateOnly, formatNumber } from "@/lib/formatters";
import { getDteDashboard } from "@/lib/integrations/dte";

async function loadDteDashboard() {
  try {
    const dashboard = await getDteDashboard();
    return { dashboard };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function DteDashboardPage() {
  const result = await loadDteDashboard();

  if ("error" in result) {
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
          description={result.error}
        />
      </div>
    );
  }

  const { dashboard } = result;
  const alertas = [
    ...dashboard.alertas_por_vencer.map((item) => ({ ...item, tipo: "Por vencer" })),
    ...dashboard.alertas_vencidos.map((item) => ({ ...item, tipo: "Vencido" })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Dashboard DTE"
        description="Seguimiento central de tenants, renovaciones e ingresos del sistema de facturacion electronica."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}><MetricCard title="Total" value={formatNumber(dashboard.total)} accentVar="--section-dte" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="Activos" value={formatNumber(dashboard.activos)} accentVar="--section-dte" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="En pruebas" value={formatNumber(dashboard.en_pruebas)} accentVar="--section-dte" /></Col>
        <Col xs={24} md={12} xl={6}><MetricCard title="MRR" value={formatCurrency(dashboard.mrr)} accentVar="--section-dte" /></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card className="surface-card border-0">
            <Table
              rowKey={(row) => `${row.tipo}-${row.id}`}
              pagination={false}
              dataSource={alertas}
              columns={[
                { title: "Tenant", dataIndex: "nombre" },
                { title: "Plan", dataIndex: "plan_nombre", render: (value: string | null) => value ?? "Sin plan" },
                {
                  title: "Estado",
                  dataIndex: "tipo",
                  render: (value: string) => (
                    <Tag color={value === "Vencido" ? "error" : "warning"}>{value}</Tag>
                  ),
                },
                {
                  title: "Fecha pago",
                  dataIndex: "fecha_pago",
                  render: (value: string) => formatDateOnly(value),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card className="surface-card border-0">
            <Table
              pagination={false}
              dataSource={[
                { label: "Suspendidos", value: dashboard.suspendidos },
                { label: "Por vencer", value: dashboard.por_vencer },
                { label: "Vencidos", value: dashboard.vencidos },
                { label: "Nuevos semana", value: dashboard.nuevos_semana },
                { label: "Nuevos mes", value: dashboard.nuevos_mes },
                { label: "Ingreso mes", value: formatCurrency(dashboard.ingresos_mes) },
              ]}
              columns={[
                { title: "Indicador", dataIndex: "label" },
                { title: "Valor", dataIndex: "value" },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
