import { Alert, Card, Col, Descriptions, Progress, Row, Tag } from "antd";
import { Activity, Cpu, Database, Gauge, Server, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getDteHealthDetail } from "@/lib/integrations/dte";

async function loadDteHealth() {
  try {
    const health = await getDteHealthDetail();
    return { health };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function getStatusTone(status: string) {
  if (status === "ok") return "success";
  if (status === "degraded") return "warning";
  return "error";
}

function formatUptime(seconds: number) {
  const totalHours = Math.floor(seconds / 3600);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>{children}</span>;
}

function CompactStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ borderRadius: 14, border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-surface))", padding: "0.8rem 0.9rem", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ color: "hsl(var(--text-muted))", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 6, color: "hsl(var(--text-primary))", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, lineHeight: 1.05 }}>{value}</div>
    </div>
  );
}

export default async function DteHealthPage() {
  const result = await loadDteHealth();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Health DTE" description="Estado operativo del backend de facturacion electronica." />
        <Alert type="error" showIcon message="Fallo la integracion DTE" description={result.error} />
      </div>
    );
  }

  const { health } = result;
  const latency = health.database.latency_ms ?? 0;
  const statusPercent = health.status === "ok" ? 100 : health.status === "degraded" ? 68 : 24;
  const poolPercent = health.database.pool.max > 0 ? Math.round((health.database.pool.total / health.database.pool.max) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Health DTE"
        description="Semaforo tecnico del backend DTE en una vista corta."
        actions={
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 999,
              background: `hsl(var(--status-${getStatusTone(health.status)}-bg))`,
              color: `hsl(var(--status-${getStatusTone(health.status)}))`,
              fontWeight: 700,
            }}
          >
            {health.status}
          </Tag>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Estado" value={health.status.toUpperCase()} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Latencia" value={`${formatNumber(latency)} ms`} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Pool usado" value={`${poolPercent}%`} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Uptime" value={formatUptime(health.process.uptime_seconds)} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card className="surface-card border-0" title={<SectionLabel>Base de datos</SectionLabel>}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Estado">
                <Tag
                  bordered={false}
                  style={{
                    margin: 0,
                    borderRadius: 999,
                    background: `hsl(var(--status-${getStatusTone(health.status)}-bg))`,
                    color: `hsl(var(--status-${getStatusTone(health.status)}))`,
                    fontWeight: 700,
                  }}
                >
                  {health.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Version">{health.database.version}</Descriptions.Item>
              <Descriptions.Item label="Latencia">{formatNumber(latency)} ms</Descriptions.Item>
              <Descriptions.Item label="Server time">{formatDate(health.database.server_time)}</Descriptions.Item>
              <Descriptions.Item label="Pool total">{formatNumber(health.database.pool.total)}</Descriptions.Item>
              <Descriptions.Item label="Pool idle">{formatNumber(health.database.pool.idle)}</Descriptions.Item>
              <Descriptions.Item label="Pool waiting">{formatNumber(health.database.pool.waiting)}</Descriptions.Item>
              <Descriptions.Item label="Pool max">{formatNumber(health.database.pool.max)}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Uso de pool</span>
                <span style={{ color: "hsl(var(--text-primary))", fontWeight: 700 }}>{poolPercent}%</span>
              </div>
              <Progress percent={poolPercent} showInfo={false} strokeColor="hsl(var(--section-dte))" />
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card className="surface-card border-0" title={<SectionLabel>Proceso y memoria</SectionLabel>}>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", background: "hsl(var(--section-dte) / 0.12)", color: "hsl(var(--section-dte))" }}>
                  <Server size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>{health.process.environment}</div>
                  <div style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>{health.process.node_version} - {health.process.platform} / {health.process.arch}</div>
                </div>
              </div>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="PID">{formatNumber(health.process.pid)}</Descriptions.Item>
                <Descriptions.Item label="Uptime">{formatUptime(health.process.uptime_seconds)}</Descriptions.Item>
                <Descriptions.Item label="RSS">{formatNumber(health.process.memory.rss_mb)} MB</Descriptions.Item>
                <Descriptions.Item label="Heap usado">{formatNumber(health.process.memory.heap_used_mb)} MB</Descriptions.Item>
                <Descriptions.Item label="Heap total">{formatNumber(health.process.memory.heap_total_mb)} MB</Descriptions.Item>
                <Descriptions.Item label="External">{formatNumber(health.process.memory.external_mb)} MB</Descriptions.Item>
              </Descriptions>

              <Alert
                type={health.status === "ok" ? "success" : health.status === "degraded" ? "warning" : "error"}
                showIcon
                message={health.status === "ok" ? "Servicio estable" : "Requiere revision"}
                description="Lectura rapida antes de abrir clientes, planes o auditoria."
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card className="surface-card border-0" title={<SectionLabel>Tenants del contrato</SectionLabel>}>
            <div style={{ display: "grid", gap: 10 }}>
              <CompactStat label="Total" value={health.tenants.total} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                <CompactStat label="Activos" value={health.tenants.activos} />
                <CompactStat label="Pruebas" value={health.tenants.en_pruebas} />
                <CompactStat label="Suspendidos" value={health.tenants.suspendidos} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card className="surface-card border-0" title={<SectionLabel>Lectura operativa</SectionLabel>}>
            <div style={{ borderRadius: 14, border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-subtle))", padding: "0.85rem 0.95rem", color: "hsl(var(--text-muted))", lineHeight: 1.55, fontSize: 13 }}>
              Estado general y carga del proceso sin texto de relleno.
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Salud general</span>
                <span style={{ color: "hsl(var(--text-primary))", fontWeight: 700 }}>{health.status}</span>
              </div>
              <Progress percent={statusPercent} showInfo={false} strokeColor="hsl(var(--section-dte))" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
