"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { PlusOutlined, CopyOutlined, KeyOutlined } from "@ant-design/icons";

const { Text } = Typography;

type FormValues = {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  city?: string;
  plan: string;
  maxBarbers: number;
  ownerFullName: string;
  ownerEmail: string;
  ownerPassword: string;
};

type Credentials = {
  slug: string;
  ownerEmail: string;
  ownerPassword: string;
};

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewBarberTenantDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slug = slugify(e.target.value);
    form.setFieldValue("slug", slug);
  }

  async function handleSubmit(values: FormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/panel/barber/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          slug: values.slug,
          email: values.email || undefined,
          phone: values.phone || undefined,
          city: values.city || undefined,
          plan: values.plan,
          maxBarbers: values.maxBarbers,
          owner: {
            fullName: values.ownerFullName,
            email: values.ownerEmail,
            password: values.ownerPassword,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        messageApi.error(data?.error ?? "Error al crear la barbería");
        return;
      }

      setOpen(false);
      form.resetFields();
      setCredentials({
        slug: values.slug,
        ownerEmail: values.ownerEmail,
        ownerPassword: values.ownerPassword,
      });
      router.refresh();
    } catch {
      messageApi.error("Error de conexión, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  }

  function copyCredentials(creds: Credentials) {
    const text = `Código de empresa: ${creds.slug}\nEmail: ${creds.ownerEmail}\nContraseña: ${creds.ownerPassword}`;
    navigator.clipboard.writeText(text);
    messageApi.success("Credenciales copiadas");
  }

  return (
    <>
      {contextHolder}

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
        style={{ background: "hsl(var(--section-barber))", borderColor: "hsl(var(--section-barber))" }}
      >
        Nueva barbería
      </Button>

      <Drawer
        title="Nueva barbería"
        width={520}
        open={open}
        onClose={() => { setOpen(false); form.resetFields(); }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => { setOpen(false); form.resetFields(); }}>Cancelar</Button>
            <Button type="primary" loading={loading} onClick={() => form.submit()}
              style={{ background: "hsl(var(--section-barber))", borderColor: "hsl(var(--section-barber))" }}
            >
              Crear barbería
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ plan: "TRIAL", maxBarbers: 3 }}
        >
          <Divider orientation="left" orientationMargin={0} style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Datos de la barbería
          </Divider>

          <Form.Item label="Nombre" name="name" rules={[{ required: true, message: "El nombre es requerido" }]}>
            <Input placeholder="Ej: Barbería Central" onChange={handleNameChange} />
          </Form.Item>

          <Form.Item
            label="Slug / Código de empresa"
            name="slug"
            extra="Este es el código que el cliente ingresará al iniciar sesión"
            rules={[
              { required: true, message: "El slug es requerido" },
              { pattern: /^[a-z0-9-]+$/, message: "Solo minúsculas, números y guiones" },
            ]}
          >
            <Input prefix="/" placeholder="barberia-central" />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Plan" name="plan" style={{ flex: 1, minWidth: 160 }}>
              <Select options={[
                { value: "TRIAL", label: "Trial (30 días gratis)" },
                { value: "BASIC", label: "Basic" },
                { value: "PRO", label: "Pro" },
                { value: "ENTERPRISE", label: "Enterprise" },
              ]} />
            </Form.Item>
            <Form.Item label="Máx. barberos" name="maxBarbers" style={{ flex: 1 }}>
              <InputNumber min={1} max={50} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Email de contacto" name="email" style={{ flex: 1 }}>
              <Input placeholder="contacto@barberia.com" />
            </Form.Item>
            <Form.Item label="Ciudad" name="city" style={{ flex: 1 }}>
              <Input placeholder="San Salvador" />
            </Form.Item>
          </Space>

          <Form.Item label="Teléfono" name="phone">
            <Input placeholder="7700-0000" />
          </Form.Item>

          <Divider orientation="left" orientationMargin={0} style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Usuario propietario (Owner)
          </Divider>

          <Form.Item label="Nombre completo" name="ownerFullName" rules={[{ required: true, message: "El nombre del owner es requerido" }]}>
            <Input placeholder="Ej: Carlos Martínez" />
          </Form.Item>

          <Form.Item label="Email de acceso" name="ownerEmail" rules={[
            { required: true, message: "El email es requerido" },
            { type: "email", message: "Email inválido" },
          ]}>
            <Input placeholder="carlos@barberia.com" />
          </Form.Item>

          <Form.Item label="Contraseña inicial" name="ownerPassword" rules={[
            { required: true, message: "La contraseña es requerida" },
            { min: 8, message: "Mínimo 8 caracteres" },
          ]}>
            <Input.Password
              placeholder="Mínimo 8 caracteres"
              addonAfter={
                <Button
                  type="link"
                  size="small"
                  icon={<KeyOutlined />}
                  style={{ padding: 0, height: "auto" }}
                  onClick={() => form.setFieldValue("ownerPassword", generatePassword())}
                >
                  Generar
                </Button>
              }
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        open={!!credentials}
        title="Barbería creada exitosamente"
        onCancel={() => setCredentials(null)}
        footer={
          <Button type="primary" onClick={() => setCredentials(null)}>Listo</Button>
        }
      >
        {credentials && (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                background: "hsl(var(--bg-subtle, 220 13% 96%))",
                border: "1px solid hsl(var(--border-default))",
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 12,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Código de empresa</Text>
                <div><Text strong style={{ fontSize: 16 }}>{credentials.slug}</Text></div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Email</Text>
                <div><Text strong>{credentials.ownerEmail}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Contraseña</Text>
                <div><Text strong code>{credentials.ownerPassword}</Text></div>
              </div>
            </div>

            <Button
              block
              icon={<CopyOutlined />}
              onClick={() => copyCredentials(credentials)}
            >
              Copiar credenciales
            </Button>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <Text type="warning" style={{ fontSize: 12 }}>
                Guarda estas credenciales — no se mostrarán de nuevo
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
