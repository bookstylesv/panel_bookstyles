import { Alert, Card, Col, Progress, Row, Tag } from "antd";
import { Map, MapPinned } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { formatNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getDteMap } from "@/lib/integrations/dte";

async function loadMap() {
  try {
    const map = await getDteMap();
    return { map };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
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

export default async function DteMapaPage() {
  const result = await loadMap();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Mapa" description="Distribucion geografica de tenants por departamento." />
        <Alert type="error" showIcon message="No se pudo cargar el mapa" description={result.error} />
      </div>
    );
  }

  const { map } = result;
  const activeTotal = map.departamentos.reduce((sum, item) => sum + item.activos, 0);
  const withoutLocationRate = map.total_tenants > 0 ? Math.round((map.sin_ubicacion / map.total_tenants) * 100) : 0;
  const coverageRate = map.total_tenants > 0 ? Math.round(((map.total_tenants - map.sin_ubicacion) / map.total_tenants) * 100) : 0;
  const topDepartment = map.departamentos[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Mapa"
        description="Cobertura territorial compacta por departamento."
        actions={
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 999,
              background: "hsl(var(--accent-soft))",
              color: "hsl(var(--accent-strong))",
              fontWeight: 700,
            }}
          >
            Sin ubicacion {formatNumber(map.sin_ubicacion)}
          </Tag>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Tenants" value={map.total_tenants} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Sin ubicacion" value={map.sin_ubicacion} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Cobertura" value={`${coverageRate}%`} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Activos" value={activeTotal} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card className="surface-card border-0" title={<SectionLabel>Cobertura por departamento</SectionLabel>}>
            <DataTable
              caption="Distribucion territorial"
              columns={[
                { key: "codigo", title: "Codigo" },
                { key: "departamento", title: "Departamento" },
                { key: "total", title: "Total", align: "right" },
                { key: "activos", title: "Activos", align: "right" },
                { key: "pruebas", title: "Pruebas", align: "right" },
                { key: "suspendidos", title: "Suspendidos", align: "right" },
              ]}
              rows={map.departamentos.map((item) => ({
                key: item.codigo,
                cells: [
                  item.codigo,
                  item.nombre,
                  formatNumber(item.total),
                  formatNumber(item.activos),
                  formatNumber(item.en_pruebas),
                  formatNumber(item.suspendidos),
                ],
              }))}
              emptyState="No hay departamentos para mostrar."
            />
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card className="surface-card border-0" title={<SectionLabel>Lectura geografica</SectionLabel>}>
            <div className="space-y-4">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Cobertura</span>
                  <span style={{ color: "hsl(var(--text-primary))", fontWeight: 700 }}>{coverageRate}%</span>
                </div>
                <Progress percent={coverageRate} strokeColor="hsl(var(--section-dte))" showInfo={false} />
              </div>

              <div style={{ padding: "0.85rem 0.95rem", borderRadius: 14, background: "hsl(var(--bg-subtle))", border: "1px solid hsl(var(--border-default))", lineHeight: 1.55, color: "hsl(var(--text-muted))", fontSize: 13 }}>
                Lectura rapida del gap de ubicacion.
              </div>

              {topDepartment ? (
                <div style={{ padding: "0.85rem 0.95rem", borderRadius: 14, border: "1px solid hsl(var(--border-default))", background: "hsl(var(--bg-surface))" }}>
                  <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Departamento dominante
                  </div>
                  <div style={{ marginTop: 6, color: "hsl(var(--text-primary))", fontSize: 16, fontWeight: 700 }}>
                    {topDepartment.nombre}
                  </div>
                  <div style={{ marginTop: 4, color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.5 }}>
                    {formatNumber(topDepartment.total)} tenants, {formatNumber(topDepartment.activos)} activos, {formatNumber(topDepartment.suspendidos)} suspendidos.
                  </div>
                </div>
              ) : null}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["Sin ubicacion", formatNumber(map.sin_ubicacion)],
                  ["Cobertura", `${coverageRate}%`],
                  ["Activos", formatNumber(activeTotal)],
                  ["Riesgo", `${withoutLocationRate}%`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 14,
                      border: "1px solid hsl(var(--border-default))",
                      background: "hsl(var(--bg-subtle))",
                      padding: "0.8rem 0.9rem",
                    }}
                  >
                    <div style={{ color: "hsl(var(--text-muted))", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {label}
                    </div>
                    <div style={{ marginTop: 6, color: "hsl(var(--text-primary))", fontSize: 18, fontWeight: 800 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
