import { Alert, Card, Col, Descriptions, Row } from "antd";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getBarberHealth } from "@/lib/integrations/barber";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";

async function loadBarberHealth() {
  try {
    const health = await getBarberHealth();
    return { health };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberHealthPage() {
  const result = await loadBarberHealth();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Barber" title="Health Barber Pro" description="" />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Barber" title="Health Barber Pro" description="Estado de salud del backend de Barber Pro." />

      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <MetricCard
            title="Estado"
            value={result.health.status === "ok" ? "Operativo" : "Atencion"}
            accentVar="--section-barber"
            tone={result.health.status === "ok" ? "success" : "warning"}
            hint={result.health.status.toUpperCase()}
          />
        </Col>
        <Col xs={24} md={8}>
          <MetricCard
            title="Latencia"
            value={result.health.latencyMs ?? "Sin dato"}
            accentVar="--section-barber"
            tone={result.health.latencyMs && result.health.latencyMs > 300 ? "warning" : "section"}
            suffix={result.health.latencyMs ? "ms" : undefined}
            hint={result.health.latencyMs ? undefined : "Sin lectura"}
          />
        </Col>
        <Col xs={24} md={8}>
          <MetricCard
            title="Ultima lectura"
            value={formatDate(result.health.timestamp)}
            accentVar="--section-barber"
            tone="neutral"
            hint="Backend"
          />
        </Col>
      </Row>

      <Card
        className="surface-card border-0"
        size="small"
        title="Detalle tecnico"
      >
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Estado">{result.health.status}</Descriptions.Item>
          <Descriptions.Item label="Timestamp">{formatDate(result.health.timestamp)}</Descriptions.Item>
          <Descriptions.Item label="Latencia">{result.health.latencyMs ? `${formatNumber(result.health.latencyMs)} ms` : "No reportada"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
