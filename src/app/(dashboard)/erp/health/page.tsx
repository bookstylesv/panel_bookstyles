import { Alert, Card, Descriptions } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getErpHealth } from "@/lib/integrations/erp";

async function loadErpHealth() {
  try {
    const health = await getErpHealth();
    return { health };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function ErpHealthPage() {
  const result = await loadErpHealth();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="ERP" title="Health ERP Full Pro" description="La vista esta lista, pero la API superadmin del ERP aun no responde." />
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ERP" title="Health ERP Full Pro" description="Estado operativo del backend ERP." />
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
