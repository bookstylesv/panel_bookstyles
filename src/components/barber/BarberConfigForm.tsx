"use client";

import { useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import type { BarberConfig } from "@/lib/integrations/barber";

export function BarberConfigForm({ initialConfig }: { initialConfig: BarberConfig }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  async function handleSave(values: {
    brandName: string;
    tagline: string;
    feature0title: string; feature0desc: string;
    feature1title: string; feature1desc: string;
    feature2title: string; feature2desc: string;
  }) {
    setLoading(true);
    try {
      const res = await fetch("/api/panel/barber/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: values.brandName,
          tagline: values.tagline,
          features: [
            { title: values.feature0title, description: values.feature0desc },
            { title: values.feature1title, description: values.feature1desc },
            { title: values.feature2title, description: values.feature2desc },
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: { message?: string } | string };
        const errMsg = typeof data?.error === "string" ? data.error : data?.error?.message ?? "Error al guardar";
        messageApi.error(errMsg);
        return;
      }

      messageApi.success("Configuración guardada — el login reflejará los cambios en segundos");
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const features = initialConfig.features ?? [];

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          brandName: initialConfig.brandName,
          tagline: initialConfig.tagline,
          feature0title: features[0]?.title ?? "",
          feature0desc: features[0]?.description ?? "",
          feature1title: features[1]?.title ?? "",
          feature1desc: features[1]?.description ?? "",
          feature2title: features[2]?.title ?? "",
          feature2desc: features[2]?.description ?? "",
        }}
      >
        <Card
          className="surface-card border-0"
          styles={{ body: { padding: "1.2rem" } }}
          title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Branding principal</span>}
          style={{ marginBottom: 12 }}
        >
          <Form.Item
            label="Nombre del producto"
            name="brandName"
            rules={[{ required: true, message: "Requerido" }]}
          >
            <Input placeholder="BookStyles" />
          </Form.Item>
          <Form.Item
            label="Subtítulo"
            name="tagline"
            rules={[{ required: true, message: "Requerido" }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="Sistema de gestión para barberías" />
          </Form.Item>
        </Card>

        <Card
          className="surface-card border-0"
          styles={{ body: { padding: "1.2rem" } }}
          title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Features del login (3 tarjetas)</span>}
          style={{ marginBottom: 12 }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
              <Form.Item
                label={`Feature ${i + 1} — Título`}
                name={`feature${i}title`}
                style={{ flex: 1, marginBottom: 0 }}
                rules={[{ required: true, message: "Requerido" }]}
              >
                <Input placeholder="Gestión de Citas" />
              </Form.Item>
              <Form.Item
                label="Descripción"
                name={`feature${i}desc`}
                style={{ flex: 1, marginBottom: 0 }}
                rules={[{ required: true, message: "Requerido" }]}
              >
                <Input placeholder="Agenda online en tiempo real" />
              </Form.Item>
            </div>
          ))}
        </Card>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ background: "hsl(var(--section-barber))", borderColor: "hsl(var(--section-barber))" }}
          >
            Guardar cambios
          </Button>
        </div>
      </Form>
    </>
  );
}
