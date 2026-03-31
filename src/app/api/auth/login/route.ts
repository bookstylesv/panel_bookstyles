import { cookies } from "next/headers";
import { fail, ok } from "@/lib/panel-api";
import {
  PANEL_SESSION_COOKIE,
  createPanelSession,
  encodePanelSession,
  getPanelSessionCookieOptions,
} from "@/lib/panel-session";

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return fail("Usuario y clave son requeridos", 422);
    }

    const expectedUser = process.env.CONTROL_ADMIN_USER;
    const expectedPass = process.env.CONTROL_ADMIN_PASS;

    if (!expectedUser || !expectedPass) {
      return fail("Las credenciales del panel no estan configuradas", 500);
    }

    if (username !== expectedUser || password !== expectedPass) {
      return fail("Credenciales invalidas", 401);
    }

    const session = createPanelSession(username);
    const token = encodePanelSession(session);
    const cookieStore = await cookies();

    cookieStore.set(PANEL_SESSION_COOKIE, token, getPanelSessionCookieOptions());

    return ok({ session });
  } catch {
    return fail("No se pudo iniciar sesion", 500);
  }
}
