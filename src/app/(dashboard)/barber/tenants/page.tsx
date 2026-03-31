import Link from "next/link";
import { Alert, Card, Col, Row, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { BarberTenantsSearch } from "@/components/barber/BarberTenantsSearch";
import { NewBarberTenantDrawer } from "@/components/barber/NewBarberTenantDrawer";
import { getErrorMessage } from "@/lib/error-message";
import { formatDateOnly } from "@/lib/formatters";
import { getBarberTenants } from "@/lib/integrations/barber";

function CompactStat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  tone: "section" | "success" | "warning" | "neutral";
  hint?: string;
}) {
  const accent =
    tone === "success"
      ? "hsl(var(--status-success))"
      : tone === "warning"
        ? "hsl(var(--status-warning))"
        : tone === "neutral"
          ? "hsl(var(--text-secondary))"
          : "hsl(var(--section-barber))";

  return (
    <Card className="surface-card border-0" styles={{ body: { padding: "0.8rem 0.9rem" } }}>
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 700 }}>
          {label}
        </div>
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

async function loadBarberTenants(search: string) {
  try {
    const params = new URLSearchParams(search ? { search } : {});
    const tenants = await getBarberTenants(params);
    return { tenants };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const result = await loadBarberTenants(search);

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <div>
          <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Barber
          </div>
          <h1 style={{ margin: "0.35rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>
            Tenants Barber Pro
          </h1>
        </div>
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  const activeCount = result.tenants.items.filter((tenant) => tenant.status === "ACTIVE").length;
  const trialCount = result.tenants.items.filter((tenant) => tenant.status === "TRIAL").length;
  const suspendedCount = result.tenants.items.filter((tenant) => tenant.status === "SUSPENDED").length;

  return (
    <div className="space-y-4">
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Barber
        </div>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>
              Tenants Barber Pro
            </h1>
            <p style={{ margin: "0.25rem 0 0", color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.45 }}>
              Listado centralizado de barberias conectadas a Barber Pro.
            </p>
          </div>
          <NewBarberTenantDrawer />
        </div>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Coincidencias" value={result.tenants.total} tone="section" hint="Total" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Visibles" value={result.tenants.items.length} tone="neutral" hint={`Pag. ${result.tenants.page}/${result.tenants.pages}`} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Activos" value={activeCount} tone="success" hint="Pagina actual" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <CompactStat label="Trial / suspendidos" value={`${trialCount} / ${suspendedCount}`} tone="warning" hint="Estado mixto" />
        </Col>
      </Row>
      <Card
        className="surface-card border-0"
        styles={{ body: { padding: "0.9rem 1rem 1rem" } }}
        title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Listado de barberias</span>}
        extra={<Tag bordered={false} color="processing">{result.tenants.total} coincidencias</Tag>}
      >
        <div style={{ marginBottom: 12 }}>
          <BarberTenantsSearch initialSearch={search} />
        </div>
        <DataTable
          caption={`Mostrando ${result.tenants.items.length} resultados en la pag. ${result.tenants.page} de ${result.tenants.pages}.`}
          columns={[
            { key: "barberia", title: "Barberia" },
            { key: "slug", title: "Slug" },
            { key: "plan", title: "Plan" },
            { key: "estado", title: "Estado" },
            { key: "pagoHasta", title: "Pago hasta" },
            { key: "ciudad", title: "Ciudad" },
          ]}
          rows={result.tenants.items.map((row) => ({
            key: String(row.id),
            cells: [
              <Link key={`link-${row.id}`} href={`/barber/tenants/${row.id}`}>{row.name}</Link>,
              row.slug,
              row.plan,
              <Tag key={`status-${row.id}`} color={row.status === "ACTIVE" ? "success" : row.status === "TRIAL" ? "processing" : "error"}>{row.status}</Tag>,
              formatDateOnly(row.paidUntil),
              row.city ?? "Sin dato",
            ],
          }))}
        />
      </Card>
    </div>
  );
}
