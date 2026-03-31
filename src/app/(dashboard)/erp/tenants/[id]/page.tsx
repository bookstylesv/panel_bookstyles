import { Alert, Card, Col, Descriptions, Row, Tag } from "antd";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getErpTenant } from "@/lib/integrations/erp";

async function loadErpTenant(id: string) {
  try {
    const tenant = await getErpTenant(id);
    return { tenant };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function getStatusLabel(status: string) {
  if (status === "ACTIVE") return "Activo";
  if (status === "TRIAL") return "Trial";
  return "Suspendido";
}

function getStatusStyles(status: string) {
  if (status === "ACTIVE") {
    return {
      background: "hsl(var(--status-success-bg))",
      color: "hsl(var(--status-success))",
    };
  }

  if (status === "TRIAL") {
    return {
      background: "hsl(var(--status-warning-bg))",
      color: "hsl(var(--status-warning))",
    };
  }

  return {
    background: "hsl(var(--status-error-bg))",
    color: "hsl(var(--status-error))",
  };
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
      <div className="space-y-4">
        <Card className="surface-card border-0" styles={{ body: { padding: 14 } }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Tag bordered={false} style={{ margin: 0, width: "fit-content", borderRadius: 999, paddingInline: "0.75rem", background: "hsl(var(--section-erp) / 0.12)", color: "hsl(var(--section-erp))", fontWeight: 700 }}>
              ERP
            </Tag>
            <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.5rem, 2.3vw, 1.9rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              Detalle ERP Full Pro
            </h1>
            <p style={{ margin: 0, maxWidth: 640, color: "hsl(var(--text-muted))", fontSize: 13.5, lineHeight: 1.45 }}>
              Vista compacta del tenant solicitada.
            </p>
          </div>
        </Card>
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const { tenant } = result;
  const statusStyles = getStatusStyles(tenant.status);

  return (
    <div className="space-y-4">
      <Card className="surface-card border-0" styles={{ body: { padding: 14 } }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <Tag bordered={false} style={{ margin: 0, width: "fit-content", borderRadius: 999, paddingInline: "0.75rem", background: "hsl(var(--section-erp) / 0.12)", color: "hsl(var(--section-erp))", fontWeight: 700 }}>
              ERP
            </Tag>
            <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.5rem, 2.3vw, 1.9rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              {tenant.name}
            </h1>
            <p style={{ margin: 0, maxWidth: 640, color: "hsl(var(--text-muted))", fontSize: 13.5, lineHeight: 1.45 }}>
              Detalle operativo del tenant ERP Full Pro.
            </p>
          </div>
          <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.75rem", ...statusStyles, fontWeight: 700 }}>
            {getStatusLabel(tenant.status)}
          </Tag>
        </div>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="surface-card border-0" styles={{ body: { padding: 12, minHeight: 96 } }}>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Usuarios</div>
            <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1, marginTop: 6 }}>{formatNumber(tenant._count.users)}</div>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, marginTop: 6 }}>Usuarios creados</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="surface-card border-0" styles={{ body: { padding: 12, minHeight: 96 } }}>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Productos</div>
            <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1, marginTop: 6 }}>{formatNumber(tenant._count.products)}</div>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, marginTop: 6 }}>Productos registrados</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="surface-card border-0" styles={{ body: { padding: 12, minHeight: 96 } }}>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Límite usuarios</div>
            <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1, marginTop: 6 }}>{formatNumber(tenant.maxUsers)}</div>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, marginTop: 6 }}>Capacidad por plan</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="surface-card border-0" styles={{ body: { padding: 12, minHeight: 96 } }}>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Facturas / mes</div>
            <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1, marginTop: 6 }}>{formatNumber(tenant.maxInvoicesPerMonth)}</div>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, marginTop: 6 }}>Tope mensual</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={14}>
          <Card className="surface-card border-0" title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Ficha del tenant</span>} styles={{ body: { padding: 12 } }}>
            <Descriptions bordered={false} column={1} size="small">
              <Descriptions.Item label="Slug">{tenant.slug}</Descriptions.Item>
              <Descriptions.Item label="Plan">{tenant.plan}</Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...statusStyles, fontWeight: 700 }}>
                  {tenant.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trial">{formatDate(tenant.trialEndsAt)}</Descriptions.Item>
              <Descriptions.Item label="Creado">{formatDate(tenant.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Actualizado">{formatDate(tenant.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="surface-card border-0" title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Capacidad y uso</span>} styles={{ body: { display: "grid", gap: 8, padding: 12 } }}>
            <Descriptions bordered={false} column={1} size="small">
              <Descriptions.Item label="Max usuarios">{tenant.maxUsers}</Descriptions.Item>
              <Descriptions.Item label="Max productos">{tenant.maxProducts}</Descriptions.Item>
              <Descriptions.Item label="Max facturas mes">{tenant.maxInvoicesPerMonth}</Descriptions.Item>
              <Descriptions.Item label="Usuarios">{tenant._count.users}</Descriptions.Item>
              <Descriptions.Item label="Productos">{tenant._count.products}</Descriptions.Item>
            </Descriptions>
            <div style={{ display: "grid", gap: 8, padding: 12, borderRadius: 16, border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-surface))" }}>
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>Lectura operativa</div>
              <div style={{ color: "hsl(var(--text-primary))", fontSize: 20, fontWeight: 800 }}>{getStatusLabel(tenant.status)}</div>
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, lineHeight: 1.4 }}>
                La ficha conserva la misma informacion de contrato, pero la presenta con menos altura y menos copia.
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
