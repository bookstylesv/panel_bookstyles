import Link from "next/link";
import { Alert, Card, Table, Tag } from "antd";
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
        <Table
          rowKey="id"
          dataSource={result.tenants.items}
          pagination={false}
          columns={[
            {
              title: "Empresa",
              dataIndex: "name",
              render: (_: string, row) => <Link href={`/erp/tenants/${row.id}`}>{row.name}</Link>,
            },
            { title: "Slug", dataIndex: "slug" },
            { title: "Plan", dataIndex: "plan" },
            {
              title: "Estado",
              dataIndex: "status",
              render: (value: string) => <Tag color={value === "ACTIVE" ? "success" : value === "TRIAL" ? "processing" : "error"}>{value}</Tag>,
            },
            { title: "Trial", dataIndex: "trialEndsAt", render: (value: string | null) => formatDateOnly(value) },
          ]}
        />
      </Card>
    </div>
  );
}
