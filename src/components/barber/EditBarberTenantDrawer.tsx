"use client";

import { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  message,
} from "antd";
import dayjs from "dayjs";
import type { BarberTenantListItem } from "@/lib/integrations/barber";

type FormValues = {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  businessType: "BARBERIA" | "SALON";
  plan: string;
  status: string;
  maxBarbers: number;
  paidUntil?: dayjs.Dayjs | null;
  trialEndsAt?: dayjs.Dayjs | null;
};

export function EditBarberTenantDrawer({
  tenant,
  open,
  onClose,
  onSaved,
}: {
  tenant: BarberTenantListItem;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email ?? undefined,
        phone: tenant.phone ?? undefined,
        city: tenant.city ?? undefined,
        country: tenant.country ?? undefined,
        businessType: tenant.businessType,
        plan: tenant.plan,
        status: tenant.status,
        maxBarbers: tenant.maxBarbers,
        paidUntil: tenant.paidUntil ? dayjs(tenant.paidUntil) : null,
        trialEndsAt: tenant.trialEndsAt ? dayjs(tenant.trialEndsAt) : null,
      });
    }
  }, [open, tenant, form]);

  async function handleSubmit(values: FormValues) {
    setLoading(true);
    try {
      const res = await fetch(`/api/panel/barber/tenants/${tenant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          slug: values.slug,
          email: values.email || undefined,
          phone: values.phone || undefined,
          city: values.city || undefined,
          country: values.country || undefined,
          businessType: values.businessType,
          plan: values.plan,
          status: values.status,
          maxBarbers: values.maxBarbers,
          paidUntil: values.paidUntil ? values.paidUntil.toISOString() : null,
          trialEndsAt: values.trialEndsAt ? values.trialEndsAt.toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        messageApi.error(data?.error ?? "Error al guardar");
        return;
      }

      messageApi.success("Tenant actualizado");
      onSaved();
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {contextHolder}
      <Drawer
        title={`Editar: ${tenant.name}`}
        width={520}
        open={open}
        onClose={onClose}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => form.submit()}
              style={{ background: "hsl(var(--section-barber))", borderColor: "hsl(var(--section-barber))" }}
            >
              Guardar cambios
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[
              { required: true },
              { pattern: /^[a-z0-9-]+$/, message: "Solo minúsculas, números y guiones" },
            ]}
          >
            <Input prefix="/" />
          </Form.Item>

          <Form.Item label="Tipo de negocio" name="businessType">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="BARBERIA">Barbería</Radio.Button>
              <Radio.Button value="SALON">Salón de Belleza</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Plan" name="plan" style={{ flex: 1 }}>
              <Select options={[
                { value: "TRIAL", label: "Trial" },
                { value: "BASIC", label: "Basic" },
                { value: "PRO", label: "Pro" },
                { value: "ENTERPRISE", label: "Enterprise" },
              ]} />
            </Form.Item>
            <Form.Item label="Estado" name="status" style={{ flex: 1 }}>
              <Select options={[
                { value: "TRIAL", label: "Trial" },
                { value: "ACTIVE", label: "Activo" },
                { value: "SUSPENDED", label: "Suspendido" },
                { value: "CANCELLED", label: "Cancelado" },
              ]} />
            </Form.Item>
          </Space>

          <Form.Item label="Máx. barberos" name="maxBarbers">
            <InputNumber min={1} max={50} style={{ width: "100%" }} />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Email" name="email" style={{ flex: 1 }}>
              <Input placeholder="contacto@barberia.com" />
            </Form.Item>
            <Form.Item label="Teléfono" name="phone" style={{ flex: 1 }}>
              <Input placeholder="7700-0000" />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Ciudad" name="city" style={{ flex: 1 }}>
              <Input placeholder="San Salvador" />
            </Form.Item>
            <Form.Item label="País" name="country" style={{ flex: 1 }}>
              <Input placeholder="SV" maxLength={2} />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Pago hasta" name="paidUntil" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="Trial hasta" name="trialEndsAt" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
