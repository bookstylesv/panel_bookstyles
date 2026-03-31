import { Alert, Card, Col, Row, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
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
            <DataTable
              columns={[
                { key: "tenant", title: "Tenant" },
                { key: "plan", title: "Plan" },
                { key: "estado", title: "Estado" },
                { key: "fechaPago", title: "Fecha pago" },
              ]}
              rows={alertas.map((item) => ({
                key: `${item.tipo}-${item.id}`,
                cells: [
                  item.nombre,
                  item.plan_nombre ?? "Sin plan",
                  <Tag key={`tag-${item.id}`} color={item.tipo === "Vencido" ? "error" : "warning"}>
                    {item.tipo}
                  </Tag>,
                  formatDateOnly(item.fecha_pago),
                ],
              }))}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card className="surface-card border-0">
            <DataTable
              columns={[
                { key: "indicador", title: "Indicador" },
                { key: "valor", title: "Valor", align: "right" },
              ]}
              rows={[
                { key: "suspendidos", cells: ["Suspendidos", dashboard.suspendidos] },
                { key: "por-vencer", cells: ["Por vencer", dashboard.por_vencer] },
                { key: "vencidos", cells: ["Vencidos", dashboard.vencidos] },
                { key: "nuevos-semana", cells: ["Nuevos semana", dashboard.nuevos_semana] },
                { key: "nuevos-mes", cells: ["Nuevos mes", dashboard.nuevos_mes] },
                { key: "ingreso-mes", cells: ["Ingreso mes", formatCurrency(dashboard.ingresos_mes)] },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
