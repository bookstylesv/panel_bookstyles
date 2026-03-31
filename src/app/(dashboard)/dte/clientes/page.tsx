import Link from "next/link";
import { Alert, Card, Table, Tag } from "antd";
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
        <Table
          rowKey="id"
          dataSource={result.tenants}
          columns={[
            {
              title: "Cliente",
              dataIndex: "nombre",
              render: (_: string, row) => <Link href={`/dte/clientes/${row.id}`}>{row.nombre}</Link>,
            },
            { title: "Slug", dataIndex: "slug" },
            { title: "Plan", dataIndex: "plan_nombre", render: (value: string | null) => value ?? "Sin plan" },
            {
              title: "Estado",
              dataIndex: "estado",
              render: (value: string) => (
                <Tag color={value === "activo" ? "success" : value === "pruebas" ? "processing" : "error"}>
                  {value}
                </Tag>
              ),
            },
            { title: "Vence", dataIndex: "fecha_pago", render: (value: string | null) => formatDateOnly(value) },
            { title: "Dias", dataIndex: "dias_para_vencer", render: (value: number | null) => value ?? "N/A" },
          ]}
        />
      </Card>
    </div>
  );
}
