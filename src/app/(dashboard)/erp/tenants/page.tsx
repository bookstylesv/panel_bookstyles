import Link from "next/link";
import { Alert, Card, Col, Row, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDateOnly, formatNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getErpTenants } from "@/lib/integrations/erp";

async function loadErpTenants() {
  try {
    const tenants = await getErpTenants();
    return { tenants };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function ErpTenantsPage() {
  const result = await loadErpTenants();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="ERP" title="Tenants ERP Full Pro" description="" />
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const total = result.tenants.items.length;
  const active = result.tenants.items.filter((row) => row.status === "ACTIVE").length;
  const trial = result.tenants.items.filter((row) => row.status === "TRIAL").length;
  const suspended = result.tenants.items.filter((row) => row.status !== "ACTIVE" && row.status !== "TRIAL").length;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="ERP"
        title="Tenants ERP Full Pro"
        description="Listado centralizado del ERP con estado y vencimiento."
      />

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard title="Total" value={formatNumber(total)} accentVar="--section-erp" tone="section" hint="Tenants registrados" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard title="Activos" value={formatNumber(active)} accentVar="--section-erp" tone="success" hint="Con servicio disponible" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard title="Trial" value={formatNumber(trial)} accentVar="--section-erp" tone="warning" hint="En periodo de prueba" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard title="Suspendidos" value={formatNumber(suspended)} accentVar="--section-erp" tone="danger" hint="Requieren revision" />
        </Col>
      </Row>

      <Card className="surface-card border-0" size="small" title="Registro multi-tenant ERP">
        <DataTable
          columns={[
            { key: "empresa", title: "Empresa" },
            { key: "slug", title: "Slug" },
            { key: "plan", title: "Plan" },
            { key: "estado", title: "Estado" },
            { key: "trial", title: "Trial" },
          ]}
          rows={result.tenants.items.map((row) => ({
            key: String(row.id),
            cells: [
              <Link key={`link-${row.id}`} href={`/erp/tenants/${row.id}`} style={{ color: "hsl(var(--section-erp))", fontWeight: 700 }}>
                {row.name}
              </Link>,
              row.slug,
              row.plan,
              <Tag key={`status-${row.id}`} color={row.status === "ACTIVE" ? "success" : row.status === "TRIAL" ? "warning" : "error"}>
                {row.status}
              </Tag>,
              formatDateOnly(row.trialEndsAt),
            ],
          }))}
        />
      </Card>
    </div>
  );
}
