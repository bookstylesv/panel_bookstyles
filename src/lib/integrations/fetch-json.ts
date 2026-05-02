type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function fetchJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      const preview = text.replace(/\s+/g, " ").slice(0, 120);
      throw new Error(`Respuesta invalida del servidor (${response.status}): ${preview}`);
    }
  }

  if (!response.ok) {
    const p = payload as Record<string, unknown> | null;
    const errField = p?.error;
    const message =
      (typeof errField === "object" && errField !== null
        ? (errField as { message?: string }).message
        : typeof errField === "string" ? errField : undefined) ??
      (p?.message as string | undefined) ??
      `HTTP ${response.status} — ${url}`;

    throw new Error(message);
  }

  return payload as T;
}
