import Link from "next/link";
import { Alert, Card, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDateOnly } from "@/lib/formatters";
import { getDteTenants } from "@/lib/integrations/dte";

async function loadDteTenantsPage() {
  try {
    const tenants = await getDteTenants();
    return { tenants };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function DteClientesPage() {
  const result = await loadDteTenantsPage();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Clientes DTE" description="No se pudo consultar la lista de clientes." />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Clientes DTE"
        description="Listado de tenants de factura-dte desde el panel central."
      />
      <Card className="surface-card border-0">
        <DataTable
          columns={[
            { key: "cliente", title: "Cliente" },
            { key: "slug", title: "Slug" },
            { key: "plan", title: "Plan" },
            { key: "estado", title: "Estado" },
            { key: "vence", title: "Vence" },
            { key: "dias", title: "Dias", align: "right" },
          ]}
          rows={result.tenants.map((row) => ({
            key: String(row.id),
            cells: [
              <Link key={`link-${row.id}`} href={`/dte/clientes/${row.id}`}>{row.nombre}</Link>,
              row.slug,
              row.plan_nombre ?? "Sin plan",
              <Tag key={`status-${row.id}`} color={row.estado === "activo" ? "success" : row.estado === "pruebas" ? "processing" : "error"}>
                {row.estado}
              </Tag>,
              formatDateOnly(row.fecha_pago),
              row.dias_para_vencer ?? "N/A",
            ],
          }))}
        />
      </Card>
    </div>
  );
}
