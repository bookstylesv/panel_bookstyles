import { NextRequest } from "next/server";
import { getPanelSession } from "@/lib/panel-route";
import { ok, fail } from "@/lib/panel-api";
import { getErrorMessage } from "@/lib/error-message";
import { updateBarberTenant, deleteBarberTenant } from "@/lib/integrations/barber";
import type { UpdateBarberTenantInput } from "@/lib/integrations/barber";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getPanelSession();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  const body = await req.json() as UpdateBarberTenantInput;

  try {
    const result = await updateBarberTenant(Number(id), body);
    return ok(result);
  } catch (cause) {
    return fail(getErrorMessage(cause), 502);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getPanelSession();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;

  try {
    const result = await deleteBarberTenant(Number(id));
    return ok(result);
  } catch (cause) {
    return fail(getErrorMessage(cause), 502);
  }
}
