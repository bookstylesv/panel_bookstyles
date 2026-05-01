import { Alert, Card, Col, Row, Tag } from "antd";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { BarberTenantsSearch } from "@/components/barber/BarberTenantsSearch";
import { NewBarberTenantDrawer } from "@/components/barber/NewBarberTenantDrawer";
import { BarberTenantsTable } from "@/components/barber/BarberTenantsTable";
import { getErrorMessage } from "@/lib/error-message";
import { getBarberTenants } from "@/lib/integrations/barber";

const BARBER_APP_URL = (process.env.BARBER_PANEL_URL ?? "https://barber-pro-swart.vercel.app").replace(/\/$/, "");

async function loadBarberTenants(search: string, page: number, limit: number) {
  try {
    const raw: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) raw.search = search;
    const tenants = await getBarberTenants(new URLSearchParams(raw));
    return { tenants };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
  const { search = "", page: pageStr = "1", limit: limitStr = "25" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const limit = [10, 25, 50, 100].includes(parseInt(limitStr, 10)) ? parseInt(limitStr, 10) : 25;
  const result = await loadBarberTenants(search, page, limit);

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
        actions={<NewBarberTenantDrawer barberAppUrl={BARBER_APP_URL} />}
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
        <BarberTenantsTable
          items={result.tenants.items}
          barberAppUrl={BARBER_APP_URL}
          total={result.tenants.total}
          currentPage={result.tenants.page}
          pageSize={result.tenants.limit}
        />
      </Card>
    </div>
  );
}
