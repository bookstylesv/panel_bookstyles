"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Divider, Form, Input, Tag, Typography } from "antd";
import {
  ArrowRight,
  Building2,
  Database,
  FileText,
  LockKeyhole,
  Scissors,
  Server,
  ShieldCheck,
  Sparkles,
  User2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FEATURE_CARDS = [
  {
    title: "Barber Pro",
    copy: "Citas, caja y clientes con separacion operativa.",
    status: "Conectado",
    icon: <Scissors size={18} />,
    accentVar: "--section-barber",
  },
  {
    title: "DTE",
    copy: "Tenants, planes y seguimiento del servicio.",
    status: "Conectado",
    icon: <FileText size={18} />,
    accentVar: "--section-dte",
  },
  {
    title: "ERP Full Pro",
    copy: "Salud del backend y monitoreo administrativo.",
    status: "Conectado",
    icon: <Building2 size={18} />,
    accentVar: "--section-erp",
  },
];

const OPERATING_POINTS = [
  "Auth server-side",
  "Bases separadas por sistema",
  "Vista global para superadmin",
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    router.prefetch("/overview");
  }, [router]);

  return (
    <main className="login-shell">
      <div className="login-grid">
        <section className="login-stage surface-card">
          <div
            aria-hidden
            className="login-stage__orb"
            style={{
              top: -120,
              right: -100,
              width: 360,
              height: 360,
              background: "radial-gradient(circle, hsl(var(--section-dte) / 0.34) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="login-stage__orb"
            style={{
              left: -120,
              bottom: -130,
              width: 320,
              height: 320,
              background: "radial-gradient(circle, hsl(var(--section-barber) / 0.24) 0%, transparent 72%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100%", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Tag
                bordered={false}
                style={{
                  margin: 0,
                  borderRadius: 999,
                  paddingInline: 12,
                  background: "hsl(var(--text-inverse) / 0.08)",
                  border: "1px solid hsl(var(--text-inverse) / 0.12)",
                  color: "hsl(var(--text-inverse))",
                  fontWeight: 700,
                }}
              >
                Speeddan Control V3
              </Tag>
              <span className="login-stage__chip">
                <Sparkles size={14} />
                Preview estable
              </span>
            </div>

            <Typography.Title level={1} className="login-stage__eyebrow" style={{ margin: "1rem 0 0" }}>
              Unifica Barber Pro, DTE y ERP en un solo panel.
            </Typography.Title>

            <Typography.Paragraph className="login-stage__copy">
              Acceso central con auth server-side, datos aislados por sistema y una vista global
              para operar sin mezclar credenciales.
            </Typography.Paragraph>

            <div className="login-stage__chips">
              <span className="login-stage__chip">
                <ShieldCheck size={14} />
                Sesion httpOnly
              </span>
              <span className="login-stage__chip">
                <Server size={14} />
                Servicios separados
              </span>
              <span className="login-stage__chip">
                <Database size={14} />
                Bases por sistema
              </span>
            </div>

            <div className="login-stage__metrics">
              {FEATURE_CARDS.map((item) => (
                <div
                  key={item.title}
                  className="login-stage__stat"
                  style={{ borderLeft: `4px solid hsl(var(${item.accentVar}))` }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: "hsl(var(--text-inverse) / 0.08)",
                        color: "hsl(var(--text-inverse))",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "hsl(var(--text-inverse))", fontWeight: 700, fontSize: 15 }}>
                        {item.title}
                      </div>
                      <div style={{ marginTop: 3, color: "hsl(var(--text-inverse) / 0.68)", fontSize: 13, lineHeight: 1.45 }}>
                        {item.copy}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      display: "inline-flex",
                      width: "fit-content",
                      borderRadius: 999,
                      padding: "5px 10px",
                      background: `hsl(var(${item.accentVar}) / 0.18)`,
                      border: `1px solid hsl(var(${item.accentVar}) / 0.28)`,
                      color: `hsl(var(${item.accentVar}))`,
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.status}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "auto", paddingTop: "1.25rem", display: "flex", flexWrap: "wrap", gap: 10 }}>
              {OPERATING_POINTS.map((item) => (
                <span key={item} className="login-stage__chip" style={{ paddingInline: "0.85rem" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Card className="login-card" bordered={false}>
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <Tag
                bordered={false}
                style={{
                  margin: 0,
                  borderRadius: 999,
                  paddingInline: 12,
                  background: "hsl(var(--accent-soft))",
                  color: "hsl(var(--accent-strong))",
                  fontWeight: 700,
                }}
              >
                Panel central
              </Tag>

              <Typography.Title level={2} className="login-card__title">
                Iniciar sesion
              </Typography.Title>
              <Typography.Paragraph className="login-card__copy">
                La autenticacion se resuelve en servidor y te abre el overview unificado.
              </Typography.Paragraph>
            </div>

            <div className="login-card__panel">
              <div className="login-card__panel-title">
                <ShieldCheck size={18} />
                Acceso del superadmin
              </div>
              <div className="login-card__panel-copy">
                Una sola cuenta para el panel, con cookie firmada y salto directo al overview.
              </div>
            </div>

            {error ? (
              <Alert type="error" showIcon message={error} style={{ marginBottom: 0 }} />
            ) : null}

            <Form
              layout="vertical"
              requiredMark={false}
              onFinish={(values: { username: string; password: string }) => {
                setError(null);
                startTransition(async () => {
                  try {
                    await login(values);
                    router.replace("/overview");
                    router.refresh();
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
                <Input
                  prefix={<User2 size={16} />}
                  size="large"
                  autoComplete="username"
                  placeholder="admin"
                />
              </Form.Item>
              <Form.Item
                label="Clave"
                name="password"
                rules={[{ required: true, message: "Ingresa la clave" }]}
              >
                <Input.Password
                  prefix={<LockKeyhole size={16} />}
                  size="large"
                  autoComplete="current-password"
                  placeholder="Tu clave del panel"
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isPending}
                block
                icon={<ArrowRight size={16} />}
                style={{
                  height: 54,
                  marginTop: 6,
                  borderRadius: 14,
                  fontWeight: 700,
                }}
              >
                Continuar al panel
              </Button>
            </Form>

            <Divider style={{ margin: "6px 0 0", borderColor: "hsl(var(--border-default))" }} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="login-card__footnote">
                <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>Seguridad</div>
                <div style={{ marginTop: 4, lineHeight: 1.5 }}>
                  Cookie firmada, validacion server-side y sin exponer credenciales de sistemas.
                </div>
              </div>
              <div className="login-card__footnote">
                <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>Operativa</div>
                <div style={{ marginTop: 4, lineHeight: 1.5 }}>
                  Vista global, monitoreo de servicios y acceso rapido a cada modulo.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
