import Link from "next/link";
import { Alert, Card, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDateOnly } from "@/lib/formatters";
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
      <div className="space-y-6">
        <PageHeader eyebrow="ERP" title="Tenants ERP Full Pro" description="El listado quedara disponible cuando ERP exponga `/api/superadmin/tenants`." />
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ERP" title="Tenants ERP Full Pro" description="Listado multi-tenant centralizado del ERP." />
      <Card className="surface-card border-0">
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
              <Link key={`link-${row.id}`} href={`/erp/tenants/${row.id}`}>{row.name}</Link>,
              row.slug,
              row.plan,
              <Tag key={`status-${row.id}`} color={row.status === "ACTIVE" ? "success" : row.status === "TRIAL" ? "processing" : "error"}>{row.status}</Tag>,
              formatDateOnly(row.trialEndsAt),
            ],
          }))}
        />
      </Card>
    </div>
  );
}
