import { Alert } from "antd";
import { getErrorMessage } from "@/lib/error-message";
import { getBarberTenant } from "@/lib/integrations/barber";
import { PageHeader } from "@/components/ui/PageHeader";
import { BarberImportModule } from "@/components/barber/BarberImportModule";

async function loadTenant(id: string) {
  try {
    const tenant = await getBarberTenant(Number(id));
    return { tenant };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadTenant(id);

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Barber · Importación" title="Importación de datos" description="" />
        <Alert type="error" showIcon message="No se pudo cargar el tenant" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Barber · Importación"
        title={`Importar datos — ${result.tenant.name}`}
        description="Carga masiva de clientes, productos, empleados y más desde plantillas Excel."
      />
      <BarberImportModule tenantId={Number(id)} tenantName={result.tenant.name} plan={result.tenant.plan} />
    </div>
  );
}
