import { Alert, Button, Card, Col, Descriptions, Row, Tag } from "antd";
import { LinkOutlined, UserOutlined, ShopOutlined, ImportOutlined } from "@ant-design/icons";
import Link from "next/link";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate } from "@/lib/formatters";
import {
  getBarberTenant, getBarberTenantOwner,
  getBarberTenantTeam, getBarberTenantBranches,
} from "@/lib/integrations/barber";
import { BarberTenantActions } from "@/components/barber/BarberTenantActions";
import { BarberTenantTeam }    from "@/components/barber/BarberTenantTeam";
import { CopyButton } from "@/components/ui/CopyButton";

const BARBER_APP_URL = (process.env.BARBER_PANEL_URL ?? "https://speeddan-barberia.vercel.app").replace(/\/$/, "");

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

async function loadData(id: string) {
  try {
    const [tenant, owner, team, branches] = await Promise.allSettled([
      getBarberTenant(Number(id)),
      getBarberTenantOwner(Number(id)),
      getBarberTenantTeam(Number(id)),
      getBarberTenantBranches(Number(id)),
    ]);

    if (tenant.status === "rejected") throw new Error(getErrorMessage(tenant.reason));

    return {
      tenant:   tenant.value,
      owner:    owner.status    === "fulfilled" ? owner.value    : null,
      team:     team.status     === "fulfilled" ? team.value     : [],
      branches: branches.status === "fulfilled" ? branches.value : [],
    };
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
  const result = await loadData(id);

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <div>
          <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Barber</div>
          <h1 style={{ margin: "0.35rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>Detalle Barber Pro</h1>
          <p style={{ margin: "0.25rem 0 0", color: "hsl(var(--text-muted))", fontSize: 13 }}>No se pudo abrir el tenant {id}.</p>
        </div>
        <Alert type="error" showIcon message="Fallo la integración" description={result.error} />
      </div>
    );
  }

  const { tenant, owner, team, branches } = result;
  const loginUrl = `${BARBER_APP_URL}/login/${tenant.slug}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Barber</div>
          <h1 style={{ margin: "0.35rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>{tenant.name}</h1>
          <p style={{ margin: "0.25rem 0 0", color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.45 }}>
            <Tag color={tenant.businessType === "SALON" ? "magenta" : "blue"} style={{ marginRight: 6 }}>
              {tenant.businessType === "SALON" ? "Salón de Belleza" : "Barbería"}
            </Tag>
            Detalle operativo del tenant Barber Pro.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href={`/barber/tenants/${tenant.id}/import`}>
            <Button icon={<ImportOutlined />} style={{ borderColor: "hsl(var(--section-barber))", color: "hsl(var(--section-barber))" }}>
              Importar datos
            </Button>
          </Link>
          <BarberTenantActions tenantId={tenant.id} status={tenant.status} />
        </div>
      </div>

      {/* URL de acceso — tarjeta destacada */}
      <Card
        className="surface-card border-0"
        styles={{
          body: {
            padding: "1rem 1.1rem",
            background: "hsl(172 78% 28% / 0.05)",
            borderRadius: 12,
            border: "1px solid hsl(172 78% 28% / 0.20)",
          },
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <LinkOutlined style={{ color: "hsl(172 78% 28%)", fontSize: 18, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(var(--text-muted))", marginBottom: 2 }}>
                URL de acceso del cliente
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "hsl(172 78% 28%)", wordBreak: "break-all" }}>
                {loginUrl}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <CopyButton text={loginUrl} label="Copiar URL" />
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Estado" value={tenant.status} tone={tenant.status === "ACTIVE" ? "success" : tenant.status === "TRIAL" ? "warning" : "danger"} hint="Operativo" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Plan" value={tenant.plan} tone="section" hint="Suscripción" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Máx. barberos" value={tenant.maxBarbers} tone="neutral" hint="Capacidad" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat
            label="Actividad"
            value={(tenant._count?.users ?? 0) + (tenant._count?.barbers ?? 0) + (tenant._count?.appointments ?? 0)}
            tone="section"
            hint={`${tenant._count?.users ?? 0} usuarios · ${tenant._count?.barbers ?? 0} barberos · ${tenant._count?.appointments ?? 0} citas`}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        {/* Perfil operativo */}
        <Col xs={24} xl={14}>
          <Card
            className="surface-card border-0"
            styles={{ body: { padding: "0.9rem 1rem 1rem" } }}
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                <ShopOutlined /> Perfil operativo
              </span>
            }
          >
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Nombre">{tenant.name}</Descriptions.Item>
              <Descriptions.Item label="Slug">{tenant.slug}</Descriptions.Item>
              <Descriptions.Item label="Tipo">
                <Tag color={tenant.businessType === "SALON" ? "magenta" : "blue"}>
                  {tenant.businessType === "SALON" ? "Salón de Belleza" : "Barbería"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Plan">{tenant.plan}</Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={tenant.status === "ACTIVE" ? "success" : tenant.status === "TRIAL" ? "processing" : "error"}>{tenant.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Email de contacto">{tenant.email ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Teléfono">{tenant.phone ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Ciudad">{tenant.city ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="País">{tenant.country ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Pago hasta">{formatDate(tenant.paidUntil)}</Descriptions.Item>
              <Descriptions.Item label="Trial hasta">{formatDate(tenant.trialEndsAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Columna derecha: owner + consumo */}
        <Col xs={24} xl={10}>
          <div className="space-y-3" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Credenciales del propietario */}
            <Card
              className="surface-card border-0"
              styles={{ body: { padding: "0.9rem 1rem 1rem" } }}
              title={
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                  <UserOutlined /> Propietario (Owner)
                </span>
              }
            >
              {owner ? (
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Nombre">{owner.fullName}</Descriptions.Item>
                  <Descriptions.Item label="Email / Usuario">
                    <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600 }}>{owner.email}</span>
                      <CopyButton text={owner.email} label="Copiar" />
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Contraseña">
                    <span style={{ color: "hsl(var(--text-muted))", fontSize: 12, fontStyle: "italic" }}>
                      Configurada al crear — no recuperable
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Rol">{owner.role}</Descriptions.Item>
                  <Descriptions.Item label="Creado">{formatDate(owner.createdAt)}</Descriptions.Item>
                </Descriptions>
              ) : (
                <p style={{ margin: 0, color: "hsl(var(--text-muted))", fontSize: 13 }}>
                  Sin propietario registrado.
                </p>
              )}
            </Card>

            {/* Consumo */}
            <Card
              className="surface-card border-0"
              styles={{ body: { padding: "0.9rem 1rem 1rem" } }}
              title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Consumo y sistema</span>}
            >
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Máx. barberos">{tenant.maxBarbers}</Descriptions.Item>
                <Descriptions.Item label="Usuarios">{tenant._count.users}</Descriptions.Item>
                <Descriptions.Item label="Barberos">{tenant._count.barbers}</Descriptions.Item>
                <Descriptions.Item label="Citas">{tenant._count.appointments}</Descriptions.Item>
                <Descriptions.Item label="Creado">{formatDate(tenant.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Actualizado">{formatDate(tenant.updatedAt)}</Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </Col>
      </Row>

      {/* ── Equipo del sistema ── */}
      <BarberTenantTeam
        tenantId={tenant.id}
        owner={owner}
        team={team}
        branches={branches}
      />
    </div>
  );
}
