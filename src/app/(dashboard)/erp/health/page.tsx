import { Alert, Card, Col, Descriptions, Row, Tag } from "antd";
import { getErrorMessage } from "@/lib/error-message";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getErpHealth } from "@/lib/integrations/erp";

async function loadErpHealth() {
  try {
    const health = await getErpHealth();
    return { health };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function getStatusLabel(status: string) {
  if (status === "ok") return "Operativo";
  if (status === "degraded") return "Con alerta";
  return "Sin conexion";
}

function getStatusStyles(status: string) {
  if (status === "ok") {
    return {
      background: "hsl(var(--status-success-bg))",
      color: "hsl(var(--status-success))",
    };
  }

  if (status === "degraded") {
    return {
      background: "hsl(var(--status-warning-bg))",
      color: "hsl(var(--status-warning))",
    };
  }

  return {
    background: "hsl(var(--status-error-bg))",
    color: "hsl(var(--status-error))",
  };
}

export default async function ErpHealthPage() {
  const result = await loadErpHealth();

  if ("error" in result) {
    return (
      <div className="space-y-4">
        <Card className="surface-card border-0" styles={{ body: { padding: 14 } }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Tag
              bordered={false}
              style={{
                margin: 0,
                width: "fit-content",
                borderRadius: 999,
                paddingInline: "0.75rem",
                background: "hsl(var(--section-erp) / 0.12)",
                color: "hsl(var(--section-erp))",
                fontWeight: 700,
              }}
            >
              ERP
            </Tag>
            <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.5rem, 2.3vw, 1.9rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              Health ERP Full Pro
            </h1>
            <p style={{ margin: 0, maxWidth: 640, color: "hsl(var(--text-muted))", fontSize: 13.5, lineHeight: 1.45 }}>
              Vista compacta del estado del backend ERP, sin texto innecesario ni bloques que empujen la data hacia abajo.
            </p>
          </div>
        </Card>
        <Alert type="warning" showIcon message="ERP aun no responde al contrato superadmin" description={result.error} />
      </div>
    );
  }

  const statusLabel = getStatusLabel(result.health.status);
  const statusStyles = getStatusStyles(result.health.status);

  return (
    <div className="space-y-4">
      <Card className="surface-card border-0" styles={{ body: { display: "grid", gap: 10, padding: 14 } }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <Tag
              bordered={false}
              style={{
                margin: 0,
                width: "fit-content",
                borderRadius: 999,
                paddingInline: "0.75rem",
                background: "hsl(var(--section-erp) / 0.12)",
                color: "hsl(var(--section-erp))",
                fontWeight: 700,
              }}
            >
              ERP
            </Tag>
            <h1 style={{ margin: 0, color: "hsl(var(--text-primary))", fontSize: "clamp(1.5rem, 2.3vw, 1.9rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              Health ERP Full Pro
            </h1>
            <p style={{ margin: 0, maxWidth: 640, color: "hsl(var(--text-muted))", fontSize: 13.5, lineHeight: 1.45 }}>
              Estado operativo del backend ERP con latencia y timestamp visibles de inmediato.
            </p>
          </div>
          <Tag bordered={false} style={{ margin: 0, borderRadius: 999, paddingInline: "0.75rem", ...statusStyles, fontWeight: 700 }}>
            {statusLabel}
          </Tag>
        </div>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Card className="surface-card border-0" styles={{ body: { padding: 12, minHeight: 96 } }}>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Estado</div>
            <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1, marginTop: 6 }}>{statusLabel}</div>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, marginTop: 6 }}>Servicio reportado como {result.health.status}</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card border-0" styles={{ body: { padding: 12, minHeight: 96 } }}>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Latencia</div>
            <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1, marginTop: 6 }}>
              {result.health.latencyMs ? `${formatNumber(result.health.latencyMs)} ms` : "No reportada"}
            </div>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, marginTop: 6 }}>Respuesta observada en la ultima consulta</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card border-0" styles={{ body: { padding: 12, minHeight: 96 } }}>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Timestamp</div>
            <div style={{ color: "hsl(var(--text-primary))", fontSize: "clamp(1.35rem, 2vw, 1.75rem)", fontWeight: 800, lineHeight: 1, marginTop: 6 }}>
              {formatDate(result.health.timestamp)}
            </div>
            <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, marginTop: 6 }}>Marca temporal de la verificacion</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={14}>
          <Card className="surface-card border-0" title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Detalle de health</span>} styles={{ body: { padding: 12 } }}>
            <Descriptions bordered={false} column={1} size="small">
              <Descriptions.Item label="Estado">
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...statusStyles, fontWeight: 700 }}>
                  {result.health.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp">{formatDate(result.health.timestamp)}</Descriptions.Item>
              <Descriptions.Item label="Latencia">
                {result.health.latencyMs ? `${formatNumber(result.health.latencyMs)} ms` : "No reportada"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="surface-card border-0" title={<span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Lectura rapida</span>} styles={{ body: { display: "grid", gap: 8, padding: 12 } }}>
            <div style={{ display: "grid", gap: 8, padding: 12, borderRadius: 16, border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-surface))" }}>
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>Señal del servicio</div>
              <div style={{ color: "hsl(var(--text-primary))", fontSize: 20, fontWeight: 800 }}>{statusLabel}</div>
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, lineHeight: 1.4 }}>
                El backend ERP mantiene el mismo contrato superadmin; solo cambia la presentacion visual para leerlo mas rapido.
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
