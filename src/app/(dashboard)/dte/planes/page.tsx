import { Alert, Card, Table, Tag } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatCurrency } from "@/lib/formatters";
import { getDtePlans } from "@/lib/integrations/dte";

async function loadDtePlans() {
  try {
    const plans = await getDtePlans();
    return { plans };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function DtePlanesPage() {
  const result = await loadDtePlans();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Planes DTE" description="No se pudo cargar el catalogo de planes." />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Planes DTE"
        description="Consulta server-side del catalogo de planes de factura-dte."
      />
      <Card className="surface-card border-0">
        <Table
          rowKey="id"
          dataSource={result.plans}
          columns={[
            { title: "Plan", dataIndex: "nombre" },
            { title: "Sucursales", dataIndex: "max_sucursales" },
            { title: "Usuarios", dataIndex: "max_usuarios" },
            { title: "Precio", dataIndex: "precio", render: (value: number) => formatCurrency(value) },
            {
              title: "Activo",
              dataIndex: "activo",
              render: (value: boolean) => <Tag color={value ? "success" : "default"}>{value ? "Activo" : "Inactivo"}</Tag>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
