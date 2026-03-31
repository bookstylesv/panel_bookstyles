import { Alert, Button, Card, Col, Descriptions, Row, Statistic, Tag } from "antd";
import { Scissors, Users, TrendingUp, PauseCircle } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { getErrorMessage } from "@/lib/error-message";
import { formatNumber } from "@/lib/formatters";
import { getBarberDashboard } from "@/lib/integrations/barber";

async function loadBarberDashboard() {
  try {
    const dashboard = await getBarberDashboard();
    return { dashboard };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberDashboardPage() {
  const result = await loadBarberDashboard();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Barber</div>
            <h1 style={{ margin: "0.2rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.25rem, 2vw, 1.6rem)", lineHeight: 1.1 }}>Dashboard Barber Pro</h1>
          </div>
        </div>
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  const { dashboard } = result;
  const planEntries = Object.entries(dashboard.por_plan).filter(([, v]) => v > 0);
  const cancelados = dashboard.cancelados;

  return (
    <div className="space-y-4">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Barber</div>
          <h1 style={{ margin: "0.2rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.25rem, 2vw, 1.6rem)", lineHeight: 1.1 }}>Dashboard Barber Pro</h1>
        </div>
        <Button href="/barber/tenants" type="primary" style={{ background: "hsl(var(--section-barber))", borderColor: "hsl(var(--section-barber))" }}>
          Ver barberias
        </Button>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Total barberias"
            value={dashboard.total}
            accentVar="--section-barber"
            icon={<Scissors size={18} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Activas"
            value={dashboard.activos}
            accentVar="--section-barber"
            tone="success"
            icon={<TrendingUp size={18} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="En trial"
            value={dashboard.en_trial}
            accentVar="--section-barber"
            tone="warning"
            icon={<Users size={18} />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Suspendidas"
            value={dashboard.suspendidos}
            accentVar="--section-barber"
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
              {planEntries.length > 0 ? planEntries.map(([plan, total]) => (
                <Col key={plan} xs={12} md={6}>
                  <div style={{
                    padding: "0.9rem",
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border-default))",
                    background: "hsl(var(--bg-surface))",
                    textAlign: "center",
                  }}>
                    <Statistic
                      value={total}
                      valueStyle={{ color: "hsl(var(--section-barber))", fontSize: "1.6rem", fontWeight: 800 }}
                    />
                    <Tag bordered={false} style={{
                      marginTop: 4,
                      borderRadius: 999,
                      background: "hsl(var(--section-barber) / 0.1)",
                      color: "hsl(var(--section-barber))",
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
              <Descriptions.Item label="Total barberias">{formatNumber(dashboard.total)}</Descriptions.Item>
              <Descriptions.Item label="Activas">
                <span style={{ color: "hsl(var(--state-success))", fontWeight: 700 }}>{formatNumber(dashboard.activos)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="En trial">
                <span style={{ color: "hsl(var(--state-warning))", fontWeight: 700 }}>{formatNumber(dashboard.en_trial)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Suspendidas">
                <span style={{ color: "hsl(var(--state-danger))", fontWeight: 700 }}>{formatNumber(dashboard.suspendidos)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Canceladas">
                <span style={{ color: "hsl(var(--text-muted))", fontWeight: 700 }}>{formatNumber(cancelados)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Planes activos">{planEntries.length}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <Button size="small" href="/barber/tenants" block>
                Ver barberias
              </Button>
              <Button size="small" href="/barber/health" block>
                Health check
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
