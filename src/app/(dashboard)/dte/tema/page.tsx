import { Card, Col, Row, Tag } from "antd";
import { Palette, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

const TOKENS = [
  { name: "bg-sidebar", value: "hsl(var(--bg-sidebar))", description: "Sidebar oscuro operativo" },
  { name: "bg-page", value: "hsl(var(--bg-page))", description: "Fondo claro del workspace" },
  { name: "accent", value: "hsl(var(--accent))", description: "Accion primaria y estados del panel" },
  { name: "section-dte", value: "hsl(var(--section-dte))", description: "Identidad visual del dominio DTE" },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>{children}</span>;
}

export default function DteTemaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Tema"
        description="Tema global por variables CSS y aislamiento por tenant."
        actions={<Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--accent-soft))", color: "hsl(var(--accent-strong))", fontWeight: 700 }}>Sistema compartido</Tag>}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card className="surface-card border-0" title={<SectionLabel>Tema del panel central</SectionLabel>}>
            <div style={{ display: "grid", gap: 14 }}>
              <div
                style={{
                  borderRadius: 20,
                  border: "1px solid hsl(var(--border-default))",
                  background: "linear-gradient(135deg, hsl(var(--bg-surface)) 0%, hsl(var(--bg-subtle)) 100%)",
                  padding: "1.1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 16, display: "grid", placeItems: "center", background: "hsl(var(--accent-soft))", color: "hsl(var(--accent-strong))" }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "hsl(var(--text-primary))", fontSize: 16 }}>Variables globales</div>
                    <div style={{ color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.5 }}>
                      CSS vars y tokens Ant Design sostienen el panel.
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {TOKENS.map((token) => (
                    <div key={token.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "0.95rem 1rem", borderRadius: 16, border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-surface))" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>{token.name}</div>
                        <div style={{ color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.6 }}>{token.description}</div>
                      </div>
                      <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--bg-subtle))", fontWeight: 700 }}>
                        {token.value}
                      </Tag>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className="surface-card border-0" title={<SectionLabel>Tema por tenant</SectionLabel>}>
            <div style={{ display: "grid", gap: 14 }}>
              <div
                style={{
                  borderRadius: 20,
                  border: "1px solid hsl(var(--border-default))",
                  background: "hsl(var(--bg-subtle))",
                  padding: "1.1rem",
                }}
              >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 16, display: "grid", placeItems: "center", background: "hsl(var(--section-dte) / 0.12)", color: "hsl(var(--section-dte))" }}>
                    <Palette size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "hsl(var(--text-primary))", fontSize: 16 }}>Aislamiento por cliente</div>
                    <div style={{ color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.5 }}>
                      La paleta por tenant vive en el workspace del cliente.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
                    gap: 10,
                  }}
                >
                  {[
                    { label: "Accion", color: "hsl(var(--accent))" },
                    { label: "Barber", color: "hsl(var(--section-barber))" },
                    { label: "DTE", color: "hsl(var(--section-dte))" },
                    { label: "ERP", color: "hsl(var(--section-erp))" },
                  ].map((item) => (
                    <div key={item.label} style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-surface))" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 10, background: item.color, marginBottom: 10 }} />
                      <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>{item.label}</div>
                      <div style={{ color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.5 }}>Token de color semantico</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.5, padding: "0.85rem 0.95rem", borderRadius: 14, background: "hsl(var(--bg-surface))", border: "1px solid hsl(var(--border-default))" }}>
                Tema global y tema por tenant, sin capas extra.
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
