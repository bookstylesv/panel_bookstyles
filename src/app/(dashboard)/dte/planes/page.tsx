import { Alert, Card, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
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
        <DataTable
          columns={[
            { key: "plan", title: "Plan" },
            { key: "sucursales", title: "Sucursales", align: "right" },
            { key: "usuarios", title: "Usuarios", align: "right" },
            { key: "precio", title: "Precio", align: "right" },
            { key: "activo", title: "Activo", align: "center" },
          ]}
          rows={result.plans.map((row) => ({
            key: String(row.id),
            cells: [
              row.nombre,
              row.max_sucursales,
              row.max_usuarios,
              formatCurrency(row.precio),
              <Tag key={`activo-${row.id}`} color={row.activo ? "success" : "default"}>{row.activo ? "Activo" : "Inactivo"}</Tag>,
            ],
          }))}
        />
      </Card>
    </div>
  );
}
