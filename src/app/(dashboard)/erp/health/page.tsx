import { Alert, Card, Col, Descriptions, Row, Tag } from "antd";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getErpHealth } from "@/lib/integrations/erp";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";

async function loadErpHealth() {
  try {
    const health = await getErpHealth();
    return { health };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function getStatusLabel(status: string) {
  if (status === "ok") return "Operativo";
  if (status === "degraded") return "Con alerta";
  return "Sin conexion";
}

function getStatusTone(status: string): "success" | "warning" | "danger" {
  if (status === "ok") return "success";
  if (status === "degraded") return "warning";
  return "danger";
}

function getStatusStyles(status: string) {
  if (status === "ok") return { background: "hsl(var(--status-success-bg))", color: "hsl(var(--status-success))" };
  if (status === "degraded") return { background: "hsl(var(--status-warning-bg))", color: "hsl(var(--status-warning))" };
  return { background: "hsl(var(--status-error-bg))", color: "hsl(var(--status-error))" };
}

export default async function ErpHealthPage() {
  const result = await loadErpHealth();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="ERP" title="Health ERP Full Pro" description="" />
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const statusLabel = getStatusLabel(result.health.status);
  const statusStyles = getStatusStyles(result.health.status);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="ERP"
        title="Health ERP Full Pro"
        description="Estado operativo del backend ERP con latencia y timestamp."
        actions={
          <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.75rem", ...statusStyles, fontWeight: 700 }}>
            {statusLabel}
          </Tag>
        }
      />

      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <MetricCard
            title="Estado"
            value={statusLabel}
            accentVar="--section-erp"
            tone={getStatusTone(result.health.status)}
            hint={`Servicio: ${result.health.status}`}
          />
        </Col>
        <Col xs={24} md={8}>
          <MetricCard
            title="Latencia"
            value={result.health.latencyMs ?? "No reportada"}
            accentVar="--section-erp"
            tone={result.health.latencyMs && result.health.latencyMs > 300 ? "warning" : "section"}
            suffix={result.health.latencyMs ? "ms" : undefined}
            hint="Última consulta"
          />
        </Col>
        <Col xs={24} md={8}>
          <MetricCard
            title="Timestamp"
            value={formatDate(result.health.timestamp)}
            accentVar="--section-erp"
            tone="neutral"
            hint="Marca temporal"
          />
        </Col>
      </Row>

      <Card className="surface-card border-0" size="small" title="Detalle de health">
        <Descriptions bordered={false} column={1} size="small">
          <Descriptions.Item label="Estado">
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...statusStyles, fontWeight: 700 }}>
              {result.health.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Timestamp">{formatDate(result.health.timestamp)}</Descriptions.Item>
          <Descriptions.Item label="Latencia">
            {result.health.latencyMs ? `${formatNumber(result.health.latencyMs)} ms` : "No reportada"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
