import { NextRequest } from "next/server";
import { getPanelSession } from "@/lib/panel-route";
import { ok, fail } from "@/lib/panel-api";
import { getErrorMessage } from "@/lib/error-message";
import { resetBarberTenantUserPassword } from "@/lib/integrations/barber";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getPanelSession();
  if (!session) return fail("No autorizado", 401);

  const { id, userId } = await params;
  const body = await req.json().catch(() => ({})) as { password?: string };

  try {
    const result = await resetBarberTenantUserPassword(Number(id), Number(userId), body.password);
    return ok(result);
  } catch (cause) {
    return fail(getErrorMessage(cause), 502);
  }
}
