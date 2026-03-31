import { getPanelSession } from "@/lib/panel-route";
import { ok } from "@/lib/panel-api";

export async function GET() {
  const session = await getPanelSession();
  return ok({ session });
}
