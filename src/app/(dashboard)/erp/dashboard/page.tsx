import { Alert, Button, Card, Col, Descriptions, Row, Statistic, Tag } from "antd";
import { Building2, TrendingUp, Users, PauseCircle } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getErpDashboard } from "@/lib/integrations/erp";

async function loadErpDashboard() {
  try {
    const dashboard = await getErpDashboard();
    return { dashboard };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function ErpDashboardPage() {
  const result = await loadErpDashboard();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <div>
          <div style={{ color: "hsl(var(--section-erp))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>ERP</div>
          <h1 style={{ margin: "0.2rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.25rem, 2vw, 1.6rem)", lineHeight: 1.1 }}>Dashboard ERP Full Pro</h1>
        </div>
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const { dashboard } = result;
  const { total, activos, en_trial: enTrial, suspendidos } = dashboard;
  const coverage = total > 0 ? Math.round((activos / total) * 100) : 0;
  const planEntries = Object.entries(dashboard.por_plan).filter(([, v]) => v > 0);

  return (
    <div className="space-y-4">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "hsl(var(--section-erp))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>ERP</div>
          <h1 style={{ margin: "0.2rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.25rem, 2vw, 1.6rem)", lineHeight: 1.1 }}>Dashboard ERP Full Pro</h1>
        </div>
        <Button href="/erp/tenants" type="primary" style={{ background: "hsl(var(--section-erp))", borderColor: "hsl(var(--section-erp))" }}>
          Ver tenants
        </Button>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Total tenants"
            value={total}
            accentVar="--section-erp"
            icon={<Building2 size={18} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Activos"
            value={activos}
            accentVar="--section-erp"
            tone="success"
            icon={<TrendingUp size={18} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="En trial"
            value={enTrial}
            accentVar="--section-erp"
            tone="warning"
            icon={<Users size={18} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Suspendidos"
            value={suspendidos}
            accentVar="--section-erp"
            tone="danger"
            icon={<PauseCircle size={18} />}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={14}>
          <Card
            className="surface-card border-0"
            styles={{ body: { padding: "1rem" } }}
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Distribucion por plan</span>}
          >
            <Row gutter={[12, 12]}>
              {planEntries.length > 0 ? planEntries.map(([plan, count]) => (
                <Col key={plan} xs={12} md={6}>
                  <div style={{
                    padding: "0.9rem",
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border-default))",
                    background: "hsl(var(--bg-surface))",
                    textAlign: "center",
                  }}>
                    <Statistic
                      value={count}
                      valueStyle={{ color: "hsl(var(--section-erp))", fontSize: "1.6rem", fontWeight: 800 }}
                    />
                    <Tag bordered={false} style={{
                      marginTop: 4,
                      borderRadius: 999,
                      background: "hsl(var(--section-erp) / 0.1)",
                      color: "hsl(var(--section-erp))",
                      fontWeight: 700,
                      fontSize: 11,
                    }}>
                      {plan}
                    </Tag>
                  </div>
                </Col>
              )) : (
                <Col span={24}>
                  <p style={{ color: "hsl(var(--text-muted))", margin: 0 }}>Sin datos de planes.</p>
                </Col>
              )}
            </Row>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            className="surface-card border-0"
            styles={{ body: { padding: "1rem" } }}
            title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Resumen operativo</span>}
          >
            <Descriptions size="small" column={1} styles={{ label: { width: 140 } }}>
              <Descriptions.Item label="Total tenants">{formatNumber(total)}</Descriptions.Item>
              <Descriptions.Item label="Activos">
                <span style={{ color: "hsl(var(--state-success))", fontWeight: 700 }}>{formatNumber(activos)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="En trial">
                <span style={{ color: "hsl(var(--state-warning))", fontWeight: 700 }}>{formatNumber(enTrial)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Suspendidos">
                <span style={{ color: "hsl(var(--state-danger))", fontWeight: 700 }}>{formatNumber(suspendidos)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Cobertura activa">
                <span style={{ color: "hsl(var(--section-erp))", fontWeight: 700 }}>{coverage}%</span>
              </Descriptions.Item>
              <Descriptions.Item label="Planes activos">{planEntries.length}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <Button size="small" href="/erp/tenants" block>
                Ver tenants
              </Button>
              <Button size="small" href="/erp/health" block>
                Health check
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
