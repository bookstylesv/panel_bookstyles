import Link from "next/link";
import { Alert, Card, Col, Row, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { BarberTenantsSearch } from "@/components/barber/BarberTenantsSearch";
import { NewBarberTenantDrawer } from "@/components/barber/NewBarberTenantDrawer";
import { getErrorMessage } from "@/lib/error-message";
import { formatDateOnly } from "@/lib/formatters";
import { getBarberTenants } from "@/lib/integrations/barber";

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
        <PageHeader eyebrow="Barber" title="Tenants Barber Pro" description="" />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  const activeCount = result.tenants.items.filter((tenant) => tenant.status === "ACTIVE").length;
  const trialCount = result.tenants.items.filter((tenant) => tenant.status === "TRIAL").length;
  const suspendedCount = result.tenants.items.filter((tenant) => tenant.status === "SUSPENDED").length;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Barber"
        title="Tenants Barber Pro"
        description="Listado centralizado de barberías conectadas a Barber Pro."
        actions={<NewBarberTenantDrawer />}
      />

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12} xl={6}>
          <MetricCard title="Coincidencias" value={result.tenants.total} accentVar="--section-barber" tone="section" hint="Total" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard title="Visibles" value={result.tenants.items.length} accentVar="--section-barber" tone="neutral" hint={`Pág. ${result.tenants.page}/${result.tenants.pages}`} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard title="Activos" value={activeCount} accentVar="--section-barber" tone="success" hint="Página actual" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard title="Trial / suspendidos" value={`${trialCount} / ${suspendedCount}`} accentVar="--section-barber" tone="warning" hint="Estado mixto" />
        </Col>
      </Row>

      <Card
        className="surface-card border-0"
        size="small"
        title="Listado de barberías"
        extra={<Tag bordered={false} color="processing">{result.tenants.total} coincidencias</Tag>}
      >
        <div style={{ marginBottom: 12 }}>
          <BarberTenantsSearch initialSearch={search} />
        </div>
        <DataTable
          caption={`Mostrando ${result.tenants.items.length} de ${result.tenants.total} — pág. ${result.tenants.page}/${result.tenants.pages}`}
          columns={[
            { key: "barberia", title: "Negocio" },
            { key: "tipo", title: "Tipo" },
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
              <Tag key={`type-${row.id}`} color={row.businessType === "SALON" ? "magenta" : "blue"}>{row.businessType === "SALON" ? "Salón" : "Barbería"}</Tag>,
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
