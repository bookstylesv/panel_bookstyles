import { Alert } from "antd";
import { getErrorMessage } from "@/lib/error-message";
import { getBarberPlanConfigs } from "@/lib/integrations/barber";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlanConfigList } from "@/components/barber/PlanConfigList";

async function loadPlans() {
  try {
    const plans = await getBarberPlanConfigs();
    return { plans };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberPlansPage() {
  const result = await loadPlans();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Barber"
        title="Configuración de planes"
        description="Define los módulos, límites de barberos y sucursales para cada plan."
      />

      {"error" in result ? (
        <Alert type="error" showIcon message="No se pudo cargar los planes" description={result.error} />
      ) : (
        <PlanConfigList initialPlans={result.plans} />
      )}
    </div>
  );
}
