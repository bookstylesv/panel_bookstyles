import { NextRequest } from "next/server";
import { getPanelSession } from "@/lib/panel-route";
import { ok, fail } from "@/lib/panel-api";
import { getErrorMessage } from "@/lib/error-message";
import { updateBarberPlanConfig } from "@/lib/integrations/barber";
import type { BarberPlan, UpdateBarberPlanConfigInput } from "@/lib/integrations/barber";

const VALID_PLANS: BarberPlan[] = ["TRIAL", "BASIC", "PRO", "ENTERPRISE"];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ plan: string }> },
) {
  const session = await getPanelSession();
  if (!session) return fail("No autorizado", 401);

  const { plan } = await params;
  const upper = plan.toUpperCase() as BarberPlan;
  if (!VALID_PLANS.includes(upper)) {
    return fail("Plan inválido", 400);
  }

  try {
    const body = await req.json() as UpdateBarberPlanConfigInput;
    const result = await updateBarberPlanConfig(upper, body);
    return ok(result);
  } catch (cause) {
    return fail(getErrorMessage(cause), 502);
  }
}
