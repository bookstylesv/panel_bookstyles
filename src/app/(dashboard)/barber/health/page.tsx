import { Alert, Card, Col, Descriptions, Row } from "antd";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getBarberHealth } from "@/lib/integrations/barber";

function CompactStat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  tone: "section" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
}) {
  const accent =
    tone === "success"
      ? "hsl(var(--status-success))"
      : tone === "warning"
        ? "hsl(var(--status-warning))"
        : tone === "danger"
          ? "hsl(var(--status-error))"
          : tone === "neutral"
            ? "hsl(var(--text-secondary))"
            : "hsl(var(--section-barber))";

  return (
    <Card
      className="surface-card border-0"
      styles={{ body: { padding: "0.8rem 0.9rem" } }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 700 }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <div style={{ color: accent, fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)", fontWeight: 800, lineHeight: 1 }}>
            {value}
          </div>
          {hint ? (
            <span style={{ color: "hsl(var(--text-muted))", fontSize: 11.5 }}>{hint}</span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

async function loadBarberHealth() {
  try {
    const health = await getBarberHealth();
    return { health };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

export default async function BarberHealthPage() {
  const result = await loadBarberHealth();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <div>
          <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Barber
          </div>
          <h1 style={{ margin: "0.35rem 0 0", color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>
            Health Barber Pro
          </h1>
        </div>
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ color: "hsl(var(--section-barber))", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Barber
        </div>
        <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.1 }}>
          Health Barber Pro
        </h1>
        <p style={{ margin: 0, color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.45 }}>
          Estado de salud del backend de Barber Pro.
        </p>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <CompactStat label="Estado" value={result.health.status === "ok" ? "Operativo" : "Atencion"} tone={result.health.status === "ok" ? "success" : "warning"} hint={result.health.status.toUpperCase()} />
        </Col>
        <Col xs={24} md={8}>
          <CompactStat label="Latencia" value={result.health.latencyMs ?? "Sin dato"} tone={result.health.latencyMs && result.health.latencyMs > 300 ? "warning" : "section"} hint={result.health.latencyMs ? "ms" : "Sin lectura"} />
        </Col>
        <Col xs={24} md={8}>
          <CompactStat label="Ultima lectura" value={formatDate(result.health.timestamp)} tone="neutral" hint="Backend" />
        </Col>
      </Row>
      <Card
        className="surface-card border-0"
        styles={{ body: { padding: "0.9rem 1rem 1rem" } }}
        title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Detalle tecnico</span>}
      >
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Estado">{result.health.status}</Descriptions.Item>
          <Descriptions.Item label="Timestamp">{formatDate(result.health.timestamp)}</Descriptions.Item>
          <Descriptions.Item label="Latencia">{result.health.latencyMs ? `${formatNumber(result.health.latencyMs)} ms` : "No reportada"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
