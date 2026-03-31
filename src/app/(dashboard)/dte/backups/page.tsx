import { Alert, Card, Col, Descriptions, Row, Tag } from "antd";
import { Database, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, formatNumber } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error-message";
import { getDteBackups } from "@/lib/integrations/dte";

async function loadBackups() {
  try {
    const backups = await getDteBackups();
    return { backups };
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

export default async function DteBackupsPage() {
  const result = await loadBackups();

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Backups" description="Inventario de respaldos del sistema." />
        <Alert type="error" showIcon message="No se pudieron cargar los backups" description={result.error} />
      </div>
    );
  }

  const { backups } = result;

  const rows = backups.backups.map((item) => ({
    key: item.filename,
    cells: [
      item.filename,
      <Tag key={`${item.filename}-type`} bordered={false} color={item.type === "database" ? "blue" : "gold"}>
        {item.type}
      </Tag>,
      item.size_mb,
      formatDate(item.created_at),
    ],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title="Backups"
        description="Inventario corto de respaldos y retencion."
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
            {backups.stats.total_backups} archivos
          </Tag>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Backups" value={backups.stats.total_backups} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Tamano total" value={`${backups.stats.total_size_mb} MB`} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Retencion" value={`${backups.stats.retention_days} dias`} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Ultimo backup" value={formatDate(backups.stats.last_backup_at)} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="surface-card border-0" title={<SectionLabel>Respaldos disponibles</SectionLabel>}>
            <DataTable
              caption="Backups del sistema"
              columns={[
                { key: "archivo", title: "Archivo" },
                { key: "tipo", title: "Tipo" },
                { key: "tamano", title: "Tamano", align: "right" },
                { key: "fecha", title: "Fecha" },
              ]}
              rows={rows}
              emptyState="No hay respaldos disponibles."
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card className="surface-card border-0" title={<SectionLabel>Lectura operativa</SectionLabel>}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Directorio">{backups.stats.backup_dir}</Descriptions.Item>
              <Descriptions.Item label="Ultimo backup">{formatDate(backups.stats.last_backup_at)}</Descriptions.Item>
              <Descriptions.Item label="Total archivos">{formatNumber(backups.stats.total_backups)}</Descriptions.Item>
              <Descriptions.Item label="Retencion">{backups.stats.retention_days} dias</Descriptions.Item>
            </Descriptions>

            <div
              style={{
                marginTop: 12,
                padding: "0.85rem 0.95rem",
                borderRadius: 14,
                border: "1px solid hsl(var(--border-default))",
                background: "hsl(var(--bg-subtle))",
                color: "hsl(var(--text-muted))",
                lineHeight: 1.55,
                fontSize: 13,
              }}
            >
              Inventario real del backend, sin accion manual falsa.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
