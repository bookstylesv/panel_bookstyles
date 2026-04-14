import { getPanelSession } from "@/lib/panel-route";
import { ok, fail } from "@/lib/panel-api";
import { getErrorMessage } from "@/lib/error-message";
import { getBarberPlanConfigs } from "@/lib/integrations/barber";

export async function GET() {
  const session = await getPanelSession();
  if (!session) return fail("No autorizado", 401);

  try {
    const plans = await getBarberPlanConfigs();
    return ok(plans);
  } catch (cause) {
    return fail(getErrorMessage(cause), 502);
  }
}
