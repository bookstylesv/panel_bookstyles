import { Alert, Card, Descriptions } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getBarberHealth } from "@/lib/integrations/barber";

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
      <div className="space-y-6">
        <PageHeader eyebrow="Barber" title="Health Barber Pro" description="No se pudo consultar el estado del servicio." />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Barber" title="Health Barber Pro" description="Estado de salud del backend de Barber Pro." />
      <Card className="surface-card border-0">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Estado">{result.health.status}</Descriptions.Item>
          <Descriptions.Item label="Timestamp">{formatDate(result.health.timestamp)}</Descriptions.Item>
          <Descriptions.Item label="Latencia">{result.health.latencyMs ? `${formatNumber(result.health.latencyMs)} ms` : "No reportada"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
