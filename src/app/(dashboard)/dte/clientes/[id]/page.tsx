import { Alert, Card, Col, Descriptions, Row, Tag } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate } from "@/lib/formatters";
import { getDteTenant } from "@/lib/integrations/dte";

async function loadDteTenant(id: string) {
  try {
    const tenant = await getDteTenant(Number(id));
    return { tenant };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function DteClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadDteTenant(id);

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Detalle DTE" description={`No se pudo abrir el tenant ${id}.`} />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  const { tenant } = result;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title={tenant.nombre}
        description="Detalle centralizado del tenant DTE con limites, firma y configuracion principal."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card className="surface-card border-0">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Slug">{tenant.slug}</Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={tenant.estado === "activo" ? "success" : tenant.estado === "pruebas" ? "processing" : "error"}>
                  {tenant.estado}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Plan ID">{tenant.plan_id ?? "Sin plan"}</Descriptions.Item>
              <Descriptions.Item label="Email">{tenant.email_contacto ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Telefono">{tenant.telefono ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Fecha pago">{formatDate(tenant.fecha_pago)}</Descriptions.Item>
              <Descriptions.Item label="Suspension">{formatDate(tenant.fecha_suspension)}</Descriptions.Item>
              <Descriptions.Item label="Actualizado">{formatDate(tenant.updated_at)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="surface-card border-0">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Max sucursales">{tenant.max_sucursales ?? tenant.plan_max_sucursales ?? "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Max puntos venta">{tenant.max_puntos_venta ?? tenant.plan_max_puntos_venta ?? "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Max usuarios">{tenant.max_usuarios ?? tenant.plan_max_usuarios ?? "N/A"}</Descriptions.Item>
              <Descriptions.Item label="API ambiente">{tenant.api_ambiente ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="API usuario">{tenant.api_usuario ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Firma">{tenant.firma_archivo ?? "Sin archivo"}</Descriptions.Item>
              <Descriptions.Item label="Firma vence">{formatDate(tenant.firma_vence)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
