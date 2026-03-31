import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PANEL_SESSION_COOKIE,
  readPanelSessionCookie,
  type PanelSession,
} from "@/lib/panel-session";

type RequiredSessionOptions = {
  redirectTo?: string;
};

export async function getPanelSession(): Promise<PanelSession | null> {
  const cookieStore = await cookies();
  return readPanelSessionCookie(cookieStore.get(PANEL_SESSION_COOKIE));
}

export async function getRequiredPanelSession(
  options: RequiredSessionOptions = {},
): Promise<PanelSession> {
  const session = await getPanelSession();

  if (!session) {
    redirect(options.redirectTo ?? "/login");
  }

  return session;
}
