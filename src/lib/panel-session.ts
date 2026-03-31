import { createHmac, timingSafeEqual } from "node:crypto";

export const PANEL_SESSION_COOKIE = "speeddan_control_v3_session";
const PANEL_SESSION_TTL_SECONDS = 60 * 60 * 12;

export type PanelSession = {
  username: string;
  expiresAt: string;
};

function getSessionSecret() {
  const secret = process.env.CONTROL_SESSION_SECRET;
  if (!secret) {
    throw new Error("CONTROL_SESSION_SECRET no esta configurada");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function toBase64Url(payload: PanelSession) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function createPanelSession(username: string): PanelSession {
  return {
    username,
    expiresAt: new Date(Date.now() + PANEL_SESSION_TTL_SECONDS * 1000).toISOString(),
  };
}

export function encodePanelSession(session: PanelSession) {
  const payload = toBase64Url(session);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyPanelSessionToken(token: string): PanelSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as PanelSession;

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function readPanelSessionCookie(cookie?: { value?: string }) {
  if (!cookie?.value) {
    return null;
  }

  return verifyPanelSessionToken(cookie.value);
}

export function getPanelSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: PANEL_SESSION_TTL_SECONDS,
  };
}
