"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Space, App } from "antd";
import { StopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { BarberStatus } from "@/lib/integrations/barber";

interface Props {
  tenantId: number;
  status: BarberStatus;
}

export function BarberTenantActions({ tenantId, status }: Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "suspend" | "activate") {
    setLoading(true);
    try {
      const res = await fetch(`/api/panel/barber/tenants/${tenantId}/${action}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Error al procesar la acción");
      message.success(action === "suspend" ? "Tenant suspendido" : "Tenant activado");
      router.refresh();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const isSuspended = status === "SUSPENDED";

  return (
    <Space>
      {!isSuspended && (
        <Button danger icon={<StopOutlined />} loading={loading} onClick={() => handleAction("suspend")}>
          Suspender
        </Button>
      )}
      {isSuspended && (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={loading}
          onClick={() => handleAction("activate")}
          style={{ background: "hsl(var(--state-success))", borderColor: "hsl(var(--state-success))" }}
        >
          Activar
        </Button>
      )}
    </Space>
  );
}
