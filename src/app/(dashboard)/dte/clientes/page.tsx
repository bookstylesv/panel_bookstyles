import Link from "next/link";
import { Alert, Button, Card, Col, Input, Row, Tag } from "antd";
import { BarChart3, Building2, CreditCard, Database, Map, Palette, ShieldCheck, Users } from "lucide-react";
import type { ReactNode } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDateOnly, formatNumber } from "@/lib/formatters";
import { getDteTenants } from "@/lib/integrations/dte";

const QUICK_LINKS = [
  { href: "/dte/dashboard", label: "Dashboard", helper: "Salud y alertas del ecosistema", icon: BarChart3 },
  { href: "/dte/planes", label: "Planes", helper: "Tarifas y limites", icon: CreditCard },
  { href: "/dte/mapa", label: "Mapa", helper: "Distribucion geografica", icon: Map },
  { href: "/dte/analytics", label: "Analytics", helper: "KPIs historicos", icon: Database },
  { href: "/dte/health", label: "Health", helper: "Estado tecnico", icon: ShieldCheck },
  { href: "/dte/auditoria", label: "Auditoria", helper: "Eventos del sistema", icon: Building2 },
  { href: "/dte/backups", label: "Backups", helper: "Retencion y descargas", icon: Database },
  { href: "/dte/tema", label: "Tema", helper: "Tokens visuales", icon: Palette },
];

type SearchParams = {
  q?: string | string[];
  estado?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function makeHref(q: string, estado: string, nextEstado?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const finalEstado = nextEstado ?? estado;
  if (finalEstado && finalEstado !== "todos") params.set("estado", finalEstado);
  const query = params.toString();
  return query ? `/dte/clientes?${query}` : "/dte/clientes";
}

async function loadDteClients() {
  try {
    const tenants = await getDteTenants();
    return { tenants };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function QuickAccessGrid() {
  return (
    <div
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
      }}
    >
      {QUICK_LINKS.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              borderRadius: 16,
              border: "1px solid hsl(var(--border-default))",
              background: "hsl(var(--bg-surface))",
              padding: "0.9rem 1rem",
              minHeight: "4.25rem",
            }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                  <div
                    style={{
                      width: "2.3rem",
                  height: "2.3rem",
                  borderRadius: "0.85rem",
                  display: "grid",
                  placeItems: "center",
                  color: "hsl(var(--section-dte))",
                  background: "hsl(var(--section-dte) / 0.12)",
                  flexShrink: 0,
                }}
              >
                <Icon size={15} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "hsl(var(--text-primary))", fontWeight: 700, lineHeight: 1.2 }}>
                  {item.label}
                </div>
                <div style={{ color: "hsl(var(--text-muted))", fontSize: "0.8rem", lineHeight: 1.35 }}>
                  {item.helper}
                </div>
              </div>
                </div>
              </Link>
        );
      })}
    </div>
  );
}

function stateStyle(estado: string) {
  if (estado === "activo") {
    return { background: "hsl(var(--status-success-bg))", color: "hsl(var(--status-success))" };
  }
  if (estado === "pruebas") {
    return { background: "hsl(var(--status-warning-bg))", color: "hsl(var(--status-warning))" };
  }
  return { background: "hsl(var(--status-error-bg))", color: "hsl(var(--status-error))" };
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>{children}</span>;
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "0.95rem",
        border: "1px solid hsl(var(--border-default))",
        background: "hsl(var(--bg-subtle))",
      }}
    >
      <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <strong style={{ display: "block", marginTop: 6, fontFamily: "var(--font-display)", fontSize: "1.35rem" }}>{value}</strong>
    </div>
  );
}

export default async function DteClientesPage({ searchParams }: { searchParams?: SearchParams }) {
  const result = await loadDteClients();
  const q = firstValue(searchParams?.q).trim();
  const estado = firstValue(searchParams?.estado) || "todos";

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="DTE"
          title="Clientes DTE"
          description="No se pudo consultar la lista de clientes."
        />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
        <Card className="surface-card border-0">
          <QuickAccessGrid />
        </Card>
      </div>
    );
  }

  const tenants = result.tenants;
  const filtered = tenants.filter((row) => {
    const search = q.toLowerCase();
    const matchesSearch =
      !search ||
      row.nombre.toLowerCase().includes(search) ||
      row.slug.toLowerCase().includes(search) ||
      (row.plan_nombre ?? "").toLowerCase().includes(search) ||
      (row.email_contacto ?? "").toLowerCase().includes(search) ||
      (row.telefono ?? "").toLowerCase().includes(search);
    const matchesEstado = estado === "todos" || row.estado === estado;
    return matchesSearch && matchesEstado;
  });

  const activos = tenants.filter((row) => row.estado === "activo").length;
  const pruebas = tenants.filter((row) => row.estado === "pruebas").length;
  const suspendidos = tenants.filter((row) => row.estado === "suspendido").length;
  const porVencer = tenants.filter(
    (row) => row.dias_para_vencer !== null && row.dias_para_vencer >= 0 && row.dias_para_vencer <= 7,
  ).length;
  const vencidos = tenants.filter((row) => row.dias_para_vencer !== null && row.dias_para_vencer < 0).length;

  const emptyState = q || estado !== "todos"
    ? (
      <div style={{ display: "grid", gap: "0.75rem", placeItems: "center" }}>
        <div style={{ color: "hsl(var(--text-muted))" }}>No hay clientes que coincidan con los filtros.</div>
        <Link href="/dte/clientes" style={{ color: "hsl(var(--section-dte))", fontWeight: 700 }}>
          Limpiar filtros
        </Link>
      </div>
    )
    : "Aun no hay clientes registrados.";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Clientes DTE"
        description="Listado compacto de tenants DTE con búsqueda, estado, plan y vencimiento."
        actions={
          <>
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.85rem", background: "hsl(var(--bg-subtle))", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>
              {formatNumber(tenants.length)} registros
            </Tag>
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.85rem", background: "hsl(var(--status-success-bg))", color: "hsl(var(--status-success))", fontWeight: 700 }}>
              {formatNumber(filtered.filter((row) => row.estado === "activo").length)} visibles activos
            </Tag>
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.85rem", background: "hsl(var(--status-error-bg))", color: "hsl(var(--status-error))", fontWeight: 700 }}>
              {formatNumber(vencidos)} vencidos
            </Tag>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} xl={6}>
          <MiniStat label="Total" value={formatNumber(tenants.length)} />
        </Col>
        <Col xs={12} sm={12} xl={6}>
          <MiniStat label="Activos" value={formatNumber(activos)} />
        </Col>
        <Col xs={12} sm={12} xl={6}>
          <MiniStat label="Por vencer" value={formatNumber(porVencer)} />
        </Col>
        <Col xs={12} sm={12} xl={6}>
          <MiniStat label="Vencidos" value={formatNumber(vencidos)} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="surface-card border-0" title={<SectionLabel>Buscar y filtrar</SectionLabel>} styles={{ body: { display: "grid", gap: "0.75rem", padding: "1rem" } }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.82rem", color: "hsl(var(--text-muted))" }}>
                  {formatNumber(filtered.length)} resultados visibles de {formatNumber(tenants.length)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[
                  { key: "todos", label: "Todos" },
                  { key: "activo", label: "Activos" },
                  { key: "pruebas", label: "Pruebas" },
                  { key: "suspendido", label: "Suspendidos" },
                ].map((item) => (
                  <Link
                    key={item.key}
                    href={makeHref(q, estado, item.key)}
                    style={{
                      borderRadius: 999,
                      padding: "0.45rem 0.8rem",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      background: item.key === estado ? "hsl(var(--status-info-bg))" : "hsl(var(--bg-subtle))",
                      color: item.key === estado ? "hsl(var(--status-info))" : "hsl(var(--text-secondary))",
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <form method="get" action="/dte/clientes" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input type="hidden" name="estado" value={estado === "todos" ? "" : estado} />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Buscar por nombre, slug, plan, correo o telefono..."
                allowClear
                style={{ flex: "1 1 20rem" }}
              />
              <Button htmlType="submit" type="default">
                Buscar
              </Button>
              {(q || estado !== "todos") ? (
                <Button href="/dte/clientes" type="text">
                  Limpiar
                </Button>
              ) : null}
              </form>
          </Card>

          <Card className="surface-card border-0" title={<SectionLabel>Listado de clientes</SectionLabel>} style={{ marginTop: 16 }}>
            <DataTable
              caption="Listado maestro de clientes DTE"
              columns={[
                { key: "cliente", title: "Cliente" },
                { key: "slug", title: "Slug" },
                { key: "contacto", title: "Contacto" },
                { key: "plan", title: "Plan" },
                { key: "estado", title: "Estado" },
                { key: "vence", title: "Vence" },
                { key: "dias", title: "Dias", align: "right" },
                { key: "accion", title: "Accion", align: "right" },
              ]}
              rows={filtered.map((row) => ({
                key: String(row.id),
                cells: [
                  <Link key={`link-${row.id}`} href={`/dte/clientes/${row.id}`}>
                    {row.nombre}
                  </Link>,
                  row.slug,
                  row.email_contacto ?? row.telefono ?? "Sin dato",
                  row.plan_nombre ?? "Sin plan",
                  <Tag key={`status-${row.id}`} bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.7rem", fontWeight: 700, ...stateStyle(row.estado) }}>
                    {row.estado}
                  </Tag>,
                  formatDateOnly(row.fecha_pago),
                  row.dias_para_vencer ?? "N/A",
                  <Link key={`detail-${row.id}`} href={`/dte/clientes/${row.id}`} style={{ color: "hsl(var(--section-dte))", fontWeight: 700 }}>
                    Abrir
                  </Link>,
                ],
              }))}
              emptyState={emptyState}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card className="surface-card border-0" title={<SectionLabel>Accesos rapidos</SectionLabel>} styles={{ body: { display: "grid", gap: "0.75rem", padding: "1rem" } }}>
            <div style={{ fontSize: "0.82rem", color: "hsl(var(--text-muted))" }}>
              Entra directo a los modulos que mas se usan.
            </div>
            <QuickAccessGrid />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
