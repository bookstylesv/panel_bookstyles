"use client";

import { Alert, Button } from "antd";
import { useEffect } from "react";

export default function TenantDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[barber/tenants/[id]]", error);
  }, [error]);

  return (
    <div className="space-y-4">
      <div>
        <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Barber
        </div>
        <h1 style={{ margin: "0.35rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>
          Error al cargar el tenant
        </h1>
      </div>

      <Alert
        type="error"
        showIcon
        message="No se pudo cargar la página"
        description={error.message || "Error inesperado al renderizar el detalle del tenant."}
        action={
          <Button size="small" danger onClick={reset}>
            Reintentar
          </Button>
        }
      />
    </div>
  );
}
