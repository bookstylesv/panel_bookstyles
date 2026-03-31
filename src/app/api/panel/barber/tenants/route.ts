import { NextRequest } from "next/server";
import { getPanelSession } from "@/lib/panel-route";
import { ok, fail } from "@/lib/panel-api";
import { getErrorMessage } from "@/lib/error-message";
import { createBarberTenant } from "@/lib/integrations/barber";
import type { CreateBarberTenantInput } from "@/lib/integrations/barber";

export async function POST(req: NextRequest) {
  const session = await getPanelSession();
  if (!session) return fail("No autorizado", 401);

  const body = await req.json() as CreateBarberTenantInput;

  if (!body.name?.trim() || !body.slug?.trim()) {
    return fail("name y slug son requeridos", 422);
  }

  try {
    const result = await createBarberTenant(body);
    return ok(result, { status: 201 });
  } catch (cause) {
    return fail(getErrorMessage(cause), 502);
  }
}
