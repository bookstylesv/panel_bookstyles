import { Alert, Card, Col, Descriptions, Row, Tag } from "antd";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate } from "@/lib/formatters";
import { getBarberTenant } from "@/lib/integrations/barber";
import { BarberTenantActions } from "@/components/barber/BarberTenantActions";

function CompactStat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  tone: "section" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
}) {
  const accent =
    tone === "success"
      ? "hsl(var(--status-success))"
      : tone === "warning"
        ? "hsl(var(--status-warning))"
        : tone === "danger"
          ? "hsl(var(--status-error))"
          : tone === "neutral"
            ? "hsl(var(--text-secondary))"
            : "hsl(var(--section-barber))";

  return (
    <Card className="surface-card border-0" styles={{ body: { padding: "0.8rem 0.9rem" } }}>
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 700 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <div style={{ color: accent, fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)", fontWeight: 800, lineHeight: 1 }}>
            {value}
          </div>
          {hint ? <span style={{ color: "hsl(var(--text-muted))", fontSize: 11.5 }}>{hint}</span> : null}
        </div>
      </div>
    </Card>
  );
}

async function loadBarberTenant(id: string) {
  try {
    const tenant = await getBarberTenant(Number(id));
    return { tenant };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadBarberTenant(id);

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <div>
          <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Barber
          </div>
          <h1 style={{ margin: "0.35rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>
            Detalle Barber Pro
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "hsl(var(--text-muted))", fontSize: 13 }}>
            No se pudo abrir el tenant {id}.
          </p>
        </div>
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  const { tenant } = result;

  return (
    <div className="space-y-4">
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Barber
          </div>
          <h1 style={{ margin: "0.35rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>
            {tenant.name}
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.45 }}>
            Detalle operativo del tenant Barber Pro.
          </p>
        </div>
        <BarberTenantActions tenantId={tenant.id} status={tenant.status} />
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Estado" value={tenant.status} tone={tenant.status === "ACTIVE" ? "success" : tenant.status === "TRIAL" ? "warning" : "danger"} hint="Operativo" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Plan" value={tenant.plan} tone="section" hint="Suscripcion" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Max barberos" value={tenant.maxBarbers} tone="neutral" hint="Capacidad" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat
            label="Actividad"
            value={tenant._count.users + tenant._count.barbers + tenant._count.appointments}
            tone="section"
            hint={`${tenant._count.users} usuarios, ${tenant._count.barbers} barberos, ${tenant._count.appointments} citas`}
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} xl={14}>
          <Card
            className="surface-card border-0"
            styles={{ body: { padding: "0.9rem 1rem 1rem" } }}
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Perfil operativo</span>}
          >
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Slug">{tenant.slug}</Descriptions.Item>
              <Descriptions.Item label="Tipo de negocio">
                <Tag color={tenant.businessType === "SALON" ? "magenta" : "blue"}>{tenant.businessType === "SALON" ? "Salón de Belleza" : "Barbería"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Plan">{tenant.plan}</Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={tenant.status === "ACTIVE" ? "success" : tenant.status === "TRIAL" ? "processing" : "error"}>{tenant.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Email">{tenant.email ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Telefono">{tenant.phone ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Ciudad">{tenant.city ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Pais">{tenant.country ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Pago hasta">{formatDate(tenant.paidUntil)}</Descriptions.Item>
              <Descriptions.Item label="Trial hasta">{formatDate(tenant.trialEndsAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            className="surface-card border-0"
            styles={{ body: { padding: "0.9rem 1rem 1rem" } }}
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Consumo y sistema</span>}
          >
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Max barberos">{tenant.maxBarbers}</Descriptions.Item>
              <Descriptions.Item label="Usuarios">{tenant._count.users}</Descriptions.Item>
              <Descriptions.Item label="Barberos">{tenant._count.barbers}</Descriptions.Item>
              <Descriptions.Item label="Citas">{tenant._count.appointments}</Descriptions.Item>
              <Descriptions.Item label="Creado">{formatDate(tenant.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Actualizado">{formatDate(tenant.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
