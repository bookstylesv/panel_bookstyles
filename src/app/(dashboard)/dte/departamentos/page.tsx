import { Alert, Card, Col, Input, Row, Tag } from "antd";
import { Building2, Search, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import { getDteDepartamentos } from "@/lib/integrations/dte";

type SearchParams = Record<string, string | string[] | undefined>;

async function loadDepartamentos() {
  try {
    const departamentos = await getDteDepartamentos();
    return { departamentos };
  } catch (cause) {
    return { error: getErrorMessage(cause) };
  }
}

function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
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

export default async function DteDepartamentosPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const result = await loadDepartamentos();
  const params = (await searchParams) ?? {};

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Departamentos" description="Catalogo territorial del ecosistema DTE." />
        <Alert type="error" showIcon message="No se pudo cargar el catalogo de departamentos" description={result.error} />
      </div>
    );
  }

  const query = readParam(params.q).trim().toLowerCase();
  const departamentos = result.departamentos.filter((item) => !query || item.codigo.toLowerCase().includes(query) || item.nombre.toLowerCase().includes(query));
  const firstCode = result.departamentos[0]?.codigo ?? "-";
  const lastCode = result.departamentos.at(-1)?.codigo ?? "-";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Departamentos"
        description="Catalogo territorial CAT-012 en formato compacto."
        actions={<Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--accent-soft))", color: "hsl(var(--accent-strong))", fontWeight: 700 }}>CAT-012</Tag>}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={4}>
          <CompactStat label="Catalogo" value={result.departamentos.length} />
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <CompactStat label="Filtrados" value={departamentos.length} />
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <CompactStat label="Primer codigo" value={firstCode} />
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <CompactStat label="Ultimo codigo" value={lastCode} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={9}>
      <Card className="surface-card border-0" title={<SectionLabel>Filtro rapido</SectionLabel>}>
            <form action="/dte/departamentos" method="get" style={{ display: "grid", gap: 10 }}>
              <Input
                name="q"
                defaultValue={readParam(params.q)}
                allowClear
                prefix={<Search size={16} />}
                placeholder="Buscar departamento o codigo"
              />
              <button
                type="submit"
                style={{
                  border: "none",
                  borderRadius: "1rem",
                  padding: "0.9rem 1rem",
                  background: "hsl(var(--section-dte))",
                  color: "hsl(var(--text-inverse))",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Aplicar filtro
              </button>
            </form>
            <div style={{ marginTop: 12, color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.5 }}>
              Catalogo breve para ubicar clientes y municipios.
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          <Card className="surface-card border-0" title={<SectionLabel>Catalogo territorial</SectionLabel>}>
            <DataTable
              columns={[
                { key: "codigo", title: "Codigo" },
                { key: "nombre", title: "Departamento" },
              ]}
              rows={departamentos.map((item) => ({
                key: String(item.id),
                cells: [
                  <Tag key={`code-${item.id}`} bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--bg-subtle))", fontWeight: 700 }}>
                    {item.codigo}
                  </Tag>,
                  item.nombre,
                ],
              }))}
              caption={query ? `Resultados para "${readParam(params.q)}"` : "Catalogo territorial"}
              emptyState="No hay departamentos para mostrar."
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
