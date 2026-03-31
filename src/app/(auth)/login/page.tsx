"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { LockKeyhole, User2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-card relative overflow-hidden p-8 lg:p-12">
          <div
            aria-hidden
            className="absolute inset-y-0 right-[-8rem] w-[20rem] rounded-full blur-3xl"
            style={{ background: "hsl(var(--accent-soft))" }}
          />
          <span className="section-badge bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-strong))]">
            Speeddan Control V3
          </span>
          <Typography.Title
            level={1}
            style={{
              marginTop: "1.25rem",
              maxWidth: 620,
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              lineHeight: 1,
            }}
          >
            Unifica Barber Pro, DTE y ERP Full Pro en un solo panel.
          </Typography.Title>
          <Typography.Paragraph
            style={{ maxWidth: 620, fontSize: "1.05rem", color: "hsl(var(--text-muted))" }}
          >
            Panel central con Next.js, integraciones server-side y Ant Design alineado con tu
            estructura de trabajo, listo para operar desde Vercel con Neon.
          </Typography.Paragraph>
        </section>

        <Card className="surface-card border-0" styles={{ body: { padding: 32 } }}>
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            Iniciar sesion
          </Typography.Title>
          <Typography.Paragraph style={{ color: "hsl(var(--text-muted))" }}>
            El acceso del panel vive en el servidor y genera una cookie segura para el dashboard.
          </Typography.Paragraph>

          {error ? (
            <Alert
              type="error"
              message={error}
              showIcon
              className="mb-4"
            />
          ) : null}

          <Form
            layout="vertical"
            onFinish={(values: { username: string; password: string }) => {
              setError(null);
              startTransition(async () => {
                try {
                  await login(values);
                  router.replace("/overview");
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesion");
                }
              });
            }}
          >
            <Form.Item
              label="Usuario"
              name="username"
              rules={[{ required: true, message: "Ingresa el usuario" }]}
            >
              <Input prefix={<User2 size={16} />} size="large" />
            </Form.Item>
            <Form.Item
              label="Clave"
              name="password"
              rules={[{ required: true, message: "Ingresa la clave" }]}
            >
              <Input.Password prefix={<LockKeyhole size={16} />} size="large" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isPending}
              block
            >
              Entrar al panel
            </Button>
          </Form>
        </Card>
      </div>
    </main>
  );
}
