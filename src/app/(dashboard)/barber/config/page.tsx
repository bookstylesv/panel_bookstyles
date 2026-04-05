import { Alert } from "antd";
import { getErrorMessage } from "@/lib/error-message";
import { getBarberConfig } from "@/lib/integrations/barber";
import { BarberConfigForm } from "@/components/barber/BarberConfigForm";
import { PageHeader } from "@/components/ui/PageHeader";

async function loadConfig() {
  try {
    const config = await getBarberConfig();
    return { config };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberConfigPage() {
  const result = await loadConfig();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Barber"
        title="Configuración de Barber Pro"
        description="Edita el branding que aparece en el panel izquierdo del login."
      />

      {"error" in result ? (
        <Alert type="error" showIcon message="No se pudo cargar la configuración" description={result.error} />
      ) : (
        <BarberConfigForm initialConfig={result.config} />
      )}
    </div>
  );
}
