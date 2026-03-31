import { Alert, Card, Col, Descriptions, Row, Tag } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate } from "@/lib/formatters";
import { getErpTenant } from "@/lib/integrations/erp";

async function loadErpTenant(id: string) {
  try {
    const tenant = await getErpTenant(id);
    return { tenant };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function ErpTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadErpTenant(id);

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="ERP" title="Detalle ERP Full Pro" description={`No se pudo abrir el tenant ${id}.`} />
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const { tenant } = result;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ERP" title={tenant.name} description="Detalle operativo del tenant ERP Full Pro." />
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card className="surface-card border-0">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Slug">{tenant.slug}</Descriptions.Item>
              <Descriptions.Item label="Plan">{tenant.plan}</Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={tenant.status === "ACTIVE" ? "success" : tenant.status === "TRIAL" ? "processing" : "error"}>{tenant.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trial">{formatDate(tenant.trialEndsAt)}</Descriptions.Item>
              <Descriptions.Item label="Creado">{formatDate(tenant.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Actualizado">{formatDate(tenant.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="surface-card border-0">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Max usuarios">{tenant.maxUsers}</Descriptions.Item>
              <Descriptions.Item label="Max productos">{tenant.maxProducts}</Descriptions.Item>
              <Descriptions.Item label="Max facturas mes">{tenant.maxInvoicesPerMonth}</Descriptions.Item>
              <Descriptions.Item label="Usuarios">{tenant._count.users}</Descriptions.Item>
              <Descriptions.Item label="Productos">{tenant._count.products}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
