export function getErrorMessage(cause: unknown, fallback = "Error desconocido") {
  return cause instanceof Error ? cause.message : fallback;
}
