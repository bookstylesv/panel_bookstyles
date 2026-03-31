import Link from "next/link";
import { Alert, Card, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
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
        <DataTable
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
