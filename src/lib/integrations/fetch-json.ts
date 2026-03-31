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
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      (payload as { error?: { message?: string } } | null)?.error?.message ??
      (payload as { message?: string } | null)?.message ??
      `No se pudo completar la solicitud a ${url}`;

    throw new Error(message);
  }

  return payload as T;
}
