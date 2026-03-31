import { cookies } from "next/headers";
import { ok } from "@/lib/panel-api";
import { PANEL_SESSION_COOKIE } from "@/lib/panel-session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(PANEL_SESSION_COOKIE);

  return ok({ success: true });
}
