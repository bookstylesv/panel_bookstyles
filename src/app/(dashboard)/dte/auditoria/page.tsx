import { Alert, Button, Card, Col, Progress, Row, Space, Tag } from "antd";
import type { ReactNode } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getDteAudit, type DteAuditFilters } from "@/lib/integrations/dte";

function toSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toInt(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function loadAudit(filters: DteAuditFilters) {
  try {
    const audit = await getDteAudit(filters);
    return { audit };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function filterButtonHref(base: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>{children}</span>;
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid hsl(var(--border-default))",
        background: "hsl(var(--bg-surface))",
        padding: "0.95rem 1rem",
      }}
    >
      <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ marginTop: 8, color: "hsl(var(--text-primary))", fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}

export default async function DteAuditoriaPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const actorTipo = toSingle(params.actor_tipo);
  const accion = toSingle(params.accion);
  const tenantId = toInt(toSingle(params.tenant_id));
  const page = toInt(toSingle(params.page)) ?? 1;
  const limit = Math.min(Math.max(toInt(toSingle(params.limit)) ?? 100, 10), 200);

  const filters: DteAuditFilters = {
    page,
    limit,
    actor_tipo: actorTipo === "superadmin" || actorTipo === "sistema" ? actorTipo : undefined,
    accion: accion || undefined,
    tenant_id: tenantId,
  };

  const result = await loadAudit(filters);

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Auditoria" description="Visor de actividad del superadmin con filtros rapidos." />
        <Alert type="error" showIcon message="No se pudo cargar la auditoria" description={result.error} />
      </div>
    );
  }

  const { audit } = result;
  const totalLoaded = audit.items.length;
  const superadmins = audit.items.filter((item) => item.actor_tipo === "superadmin").length;
  const sistema = audit.items.filter((item) => item.actor_tipo === "sistema").length;
  const tenants = new Set(audit.items.map((item) => item.tenant_slug).filter(Boolean)).size;
  const visiblePercent = audit.total > 0 ? Math.round((totalLoaded / audit.total) * 100) : 0;

  const rows = audit.items.map((item) => ({
    key: String(item.id),
    cells: [
      formatDate(item.created_at),
      <div key={`actor-${item.id}`}>
        <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>{item.actor_nombre ?? item.actor_username ?? "Sistema"}</div>
        <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>{item.actor_username ?? "system"}</div>
      </div>,
      <Tag
        key={`action-${item.id}`}
        bordered={false}
        style={{ margin: 0, borderRadius: 999, background: "hsl(var(--bg-subtle))", fontWeight: 700 }}
      >
        {item.accion}
      </Tag>,
      item.tenant_nombre ?? <span style={{ color: "hsl(var(--text-muted))" }}>Sin tenant</span>,
      item.ip ?? "Sin IP",
      <pre
        key={`detail-${item.id}`}
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, monospace)",
          color: "hsl(var(--text-muted))",
          fontSize: 12,
        }}
      >
        {JSON.stringify(item.detalle ?? {}, null, 2)}
      </pre>,
    ],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Auditoria"
        description="Eventos DTE compactos con filtros rapidos y lectura lateral."
        actions={
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 999,
              background: "hsl(var(--status-success-bg))",
              color: "hsl(var(--status-success))",
              fontWeight: 700,
            }}
          >
            {audit.total} eventos
          </Tag>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatBlock label="Eventos" value={audit.total} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatBlock label="Cargados" value={totalLoaded} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatBlock label="Superadmin" value={superadmins} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatBlock label="Tenants tocados" value={tenants} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="surface-card border-0" title={<SectionLabel>Registro de auditoria</SectionLabel>}>
            <Space wrap size={8} style={{ width: "100%", marginBottom: 12 }}>
              <Button size="small" href="/dte/auditoria" type={!actorTipo && !accion && !tenantId ? "primary" : "default"}>
                Todo
              </Button>
              <Button size="small" href={filterButtonHref("/dte/auditoria", { actor_tipo: "superadmin", accion, tenant_id: tenantId?.toString() })} type={actorTipo === "superadmin" ? "primary" : "default"}>
                Superadmin
              </Button>
              <Button size="small" href={filterButtonHref("/dte/auditoria", { actor_tipo: "sistema", accion, tenant_id: tenantId?.toString() })} type={actorTipo === "sistema" ? "primary" : "default"}>
                Sistema
              </Button>
              <Button size="small" href={filterButtonHref("/dte/auditoria", { actor_tipo: actorTipo, accion: "tenant", tenant_id: tenantId?.toString() })}>
                Tenant
              </Button>
              <Button size="small" href={filterButtonHref("/dte/auditoria", { actor_tipo: actorTipo, accion: "plan", tenant_id: tenantId?.toString() })}>
                Plan
              </Button>
              <Button size="small" href={filterButtonHref("/dte/auditoria", { actor_tipo: actorTipo, accion: "backup", tenant_id: tenantId?.toString() })}>
                Backup
              </Button>
            </Space>

            <DataTable
              caption="Registro de auditoria"
              columns={[
                { key: "fecha", title: "Fecha" },
                { key: "actor", title: "Actor" },
                { key: "accion", title: "Accion" },
                { key: "tenant", title: "Tenant" },
                { key: "ip", title: "IP" },
                { key: "detalle", title: "Detalle" },
              ]}
              rows={rows}
              emptyState="No hay eventos para este filtro."
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card className="surface-card border-0" title={<SectionLabel>Lectura del filtro</SectionLabel>}>
            <div className="space-y-4">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Cobertura</span>
                  <span style={{ color: "hsl(var(--text-primary))", fontWeight: 700 }}>{visiblePercent}%</span>
                </div>
                <Progress percent={visiblePercent} strokeColor="hsl(var(--section-dte))" showInfo={false} />
              </div>

              <div style={{ padding: "0.85rem 0.95rem", borderRadius: 14, background: "hsl(var(--bg-subtle))", border: "1px solid hsl(var(--border-default))", lineHeight: 1.55, color: "hsl(var(--text-muted))", fontSize: 13 }}>
                Filtros por actor y accion sin salir del panel.
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <StatBlock label="Superadmin" value={superadmins} />
                <StatBlock label="Sistema" value={sistema} />
                <StatBlock label="Tenants" value={tenants} />
                <StatBlock label="Pagina" value={`${audit.page}/${audit.pages}`} />
              </div>

              {audit.total > totalLoaded ? (
                <Alert
                  type="info"
                  showIcon
                  message="Vista paginada"
                  description={`Mostrando ${totalLoaded} de ${audit.total} eventos. Ajusta limit o pagina desde la query si necesitas mas contexto.`}
                />
              ) : null}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
