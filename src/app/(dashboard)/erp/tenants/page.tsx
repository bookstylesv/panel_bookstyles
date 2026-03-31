import Link from "next/link";
import { Alert, Card, Col, Row, Tag } from "antd";
import { DataTable } from "@/components/ui/DataTable";
import { formatDateOnly, formatNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getErpTenants } from "@/lib/integrations/erp";

async function loadErpTenants() {
  try {
    const tenants = await getErpTenants();
    return { tenants };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function MiniStatCard({ title, value, hint, accent }: { title: string; value: string | number; hint: string; accent: string }) {
  return (
    <Card className="surface-card border-0" styles={{ body: { padding: 12, minHeight: 96, borderTop: `3px solid ${accent}` } }}>
      <div style={{ color: "hsl(var(--text-secondary))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
      <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1, marginTop: 6 }}>{value}</div>
      <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, marginTop: 6, lineHeight: 1.35 }}>{hint}</div>
    </Card>
  );
}

export default async function ErpTenantsPage() {
  const result = await loadErpTenants();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <Card className="surface-card border-0" styles={{ body: { padding: 14 } }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Tag bordered={false} style={{ margin: 0, width: "fit-content", borderRadius: 999, paddingInline: "0.75rem", background: "hsl(var(--section-erp) / 0.12)", color: "hsl(var(--section-erp))", fontWeight: 700 }}>
              ERP
            </Tag>
            <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.5rem, 2.3vw, 1.9rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              Tenants ERP Full Pro
            </h1>
            <p style={{ margin: 0, maxWidth: 640, color: "hsl(var(--text-muted))", fontSize: 13.5, lineHeight: 1.45 }}>
              Listado compacto para revisar estado y vencimiento cuando ERP exponga el contrato superadmin.
            </p>
          </div>
        </Card>
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const total = result.tenants.items.length;
  const active = result.tenants.items.filter((row) => row.status === "ACTIVE").length;
  const trial = result.tenants.items.filter((row) => row.status === "TRIAL").length;
  const suspended = result.tenants.items.filter((row) => row.status !== "ACTIVE" && row.status !== "TRIAL").length;

  return (
    <div className="space-y-4">
      <Card className="surface-card border-0" styles={{ body: { padding: 14 } }}>
        <div style={{ display: "grid", gap: 8 }}>
          <Tag bordered={false} style={{ margin: 0, width: "fit-content", borderRadius: 999, paddingInline: "0.75rem", background: "hsl(var(--section-erp) / 0.12)", color: "hsl(var(--section-erp))", fontWeight: 700 }}>
            ERP
          </Tag>
          <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.5rem, 2.3vw, 1.9rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
            Tenants ERP Full Pro
          </h1>
          <p style={{ margin: 0, maxWidth: 640, color: "hsl(var(--text-muted))", fontSize: 13.5, lineHeight: 1.45 }}>
            Listado centralizado del ERP con una lectura mas compacta de estado y vencimiento.
          </p>
        </div>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <MiniStatCard title="Total" value={formatNumber(total)} hint="Tenants registrados" accent="hsl(var(--section-erp))" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MiniStatCard title="Activos" value={formatNumber(active)} hint="Con servicio disponible" accent="hsl(var(--status-success))" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MiniStatCard title="Trial" value={formatNumber(trial)} hint="En periodo de prueba" accent="hsl(var(--status-warning))" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MiniStatCard title="Suspendidos" value={formatNumber(suspended)} hint="Requieren revision" accent="hsl(var(--status-error))" />
        </Col>
      </Row>

      <Card className="surface-card border-0" styles={{ body: { padding: 12 } }}>
        <DataTable
          caption="Registro multi-tenant ERP"
          columns={[
            { key: "empresa", title: "Empresa" },
            { key: "slug", title: "Slug" },
            { key: "plan", title: "Plan" },
            { key: "estado", title: "Estado" },
            { key: "trial", title: "Trial" },
          ]}
          rows={result.tenants.items.map((row) => {
            const stateBackground =
              row.status === "ACTIVE"
                ? "hsl(var(--status-success-bg))"
                : row.status === "TRIAL"
                  ? "hsl(var(--status-warning-bg))"
                  : "hsl(var(--status-error-bg))";
            const stateColor =
              row.status === "ACTIVE"
                ? "hsl(var(--status-success))"
                : row.status === "TRIAL"
                  ? "hsl(var(--status-warning))"
                  : "hsl(var(--status-error))";

            return {
              key: String(row.id),
              cells: [
                <Link key={`link-${row.id}`} href={`/erp/tenants/${row.id}`} style={{ color: "hsl(var(--section-erp))", fontWeight: 700 }}>
                  {row.name}
                </Link>,
                row.slug,
                row.plan,
                <Tag
                  key={`status-${row.id}`}
                  bordered={false}
                  style={{
                    margin: 0,
                    borderRadius: 999,
                    background: stateBackground,
                    color: stateColor,
                    fontWeight: 700,
                  }}
                >
                  {row.status}
                </Tag>,
                formatDateOnly(row.trialEndsAt),
              ],
            };
          })}
        />
      </Card>
    </div>
  );
}
