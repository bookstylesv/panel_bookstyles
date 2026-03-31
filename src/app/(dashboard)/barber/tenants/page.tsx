import Link from "next/link";
import { Alert, Card, Table, Tag } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDateOnly } from "@/lib/formatters";
import { getBarberTenants } from "@/lib/integrations/barber";

async function loadBarberTenants() {
  try {
    const tenants = await getBarberTenants();
    return { tenants };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberTenantsPage() {
  const result = await loadBarberTenants();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Barber" title="Tenants Barber Pro" description="No se pudo cargar el listado de barberias." />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Barber" title="Tenants Barber Pro" description="Listado centralizado de barberias conectadas a Barber Pro." />
      <Card className="surface-card border-0">
        <Table
          rowKey="id"
          dataSource={result.tenants.items}
          pagination={false}
          columns={[
            {
              title: "Barberia",
              dataIndex: "name",
              render: (_: string, row) => <Link href={`/barber/tenants/${row.id}`}>{row.name}</Link>,
            },
            { title: "Slug", dataIndex: "slug" },
            { title: "Plan", dataIndex: "plan" },
            {
              title: "Estado",
              dataIndex: "status",
              render: (value: string) => <Tag color={value === "ACTIVE" ? "success" : value === "TRIAL" ? "processing" : "error"}>{value}</Tag>,
            },
            { title: "Pago hasta", dataIndex: "paidUntil", render: (value: string | null) => formatDateOnly(value) },
            { title: "Ciudad", dataIndex: "city", render: (value: string | null) => value ?? "Sin dato" },
          ]}
        />
      </Card>
    </div>
  );
}
