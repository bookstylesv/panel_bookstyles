import { NextRequest } from "next/server";
import { getPanelSession } from "@/lib/panel-route";
import { ok, fail } from "@/lib/panel-api";
import { getErrorMessage } from "@/lib/error-message";
import { suspendBarberTenant } from "@/lib/integrations/barber";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getPanelSession();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  const tenantId = Number(id);
  if (isNaN(tenantId)) return fail("ID inválido", 400);

  try {
    const result = await suspendBarberTenant(tenantId);
    return ok(result);
  } catch (cause) {
    return fail(getErrorMessage(cause), 502);
  }
}
