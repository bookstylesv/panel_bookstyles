"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert, Badge, Button, Card, Col, Modal, Progress, Row,
  Space, Table, Tabs, Tag, Tooltip, Typography, Upload,
} from "antd";
import {
  CloudUploadOutlined, DeleteOutlined, DownloadOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, ReloadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

const { Text, Paragraph, Title } = Typography;

// ── tipos ─────────────────────────────────────────────

type ImportResource =
  | "clientes" | "empleados" | "servicios" | "productos"
  | "proveedores" | "cat-producto" | "cat-gasto" | "cat-servicio";

type RowError = { fila: number; campo: string; error: string };

type ImportResult = {
  success: boolean;
  imported: number;
  skipped: number;
  errors: RowError[];
  message: string;
  dailyRemaining: number;
};

type StatusData = {
  plan: string;
  dailyUsed: number;
  dailyLimit: number;
  dailyRemaining: number;
  counts: Record<ImportResource, number>;
};

const DAILY_LIMIT = 10;

const RESOURCES: { key: ImportResource; label: string; tag: string; tagColor: string; blockedBy?: string }[] = [
  { key: "cat-producto", label: "Categorías de Producto",  tag: "Paso 1", tagColor: "purple" },
  { key: "cat-gasto",    label: "Categorías de Gasto",     tag: "Paso 1", tagColor: "purple" },
  { key: "cat-servicio", label: "Categorías de Servicio",  tag: "Paso 1", tagColor: "purple" },
  { key: "proveedores",  label: "Proveedores",             tag: "Paso 1", tagColor: "blue"   },
  { key: "clientes",     label: "Clientes",                tag: "Paso 2", tagColor: "green"  },
  { key: "empleados",    label: "Empleados",               tag: "Paso 2", tagColor: "green"  },
  { key: "servicios",    label: "Servicios",               tag: "Paso 2", tagColor: "green"  },
  { key: "productos",    label: "Productos",               tag: "Paso 2 — requiere cat. producto si usas categoría", tagColor: "orange", blockedBy: "cat-producto" },
];

const PLAN_LIMITS: Record<string, Record<ImportResource, number>> = {
  TRIAL:      { "clientes": 50,    "empleados": 3,   "servicios": 20,  "productos": 50,   "proveedores": 10,  "cat-producto": 10,  "cat-gasto": 10,  "cat-servicio": 10  },
  BASIC:      { "clientes": 500,   "empleados": 10,  "servicios": 100, "productos": 200,  "proveedores": 50,  "cat-producto": 30,  "cat-gasto": 30,  "cat-servicio": 30  },
  PRO:        { "clientes": 2000,  "empleados": 25,  "servicios": 300, "productos": 500,  "proveedores": 100, "cat-producto": 100, "cat-gasto": 100, "cat-servicio": 100 },
  ENTERPRISE: { "clientes": 99999, "empleados": 500, "servicios": 9999,"productos": 9999, "proveedores": 9999,"cat-producto": 9999,"cat-gasto": 9999,"cat-servicio": 9999 },
};

// ── subcomponente: panel por recurso ──────────────────

function ResourcePanel({
  tenantId, resource, label, status, onStatusRefresh,
}: {
  tenantId: number;
  resource: ImportResource;
  label: string;
  status: StatusData | null;
  onStatusRefresh: () => void;
}) {
  const [fileList, setFileList]     = useState<UploadFile[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [result, setResult]         = useState<ImportResult | null>(null);
  const [resetting, setResetting]   = useState(false);
  const [resetModal, setResetModal] = useState(false);

  const count     = status?.counts[resource] ?? 0;
  const planLimit = status ? (PLAN_LIMITS[status.plan]?.[resource] ?? 9999) : 9999;
  const noIntents = (status?.dailyRemaining ?? 1) <= 0;

  async function handleUpload() {
    if (!fileList[0]) return;
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("resource", resource);
      fd.append("file", fileList[0].originFileObj as File);
      const res = await fetch(`/api/panel/barber/tenants/${tenantId}/import`, { method: "POST", body: fd });
      const data: ImportResult = await res.json();
      setResult(data);
      if (data.success) { setFileList([]); onStatusRefresh(); }
    } catch {
      setResult({ success: false, imported: 0, skipped: 0, errors: [], message: "Error de conexión al intentar importar.", dailyRemaining: 0 });
    } finally {
      setUploading(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setResetModal(false);
    try {
      const res = await fetch(`/api/panel/barber/tenants/${tenantId}/import/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource }),
      });
      const data = await res.json();
      setResult({ success: res.ok, imported: 0, skipped: 0, errors: [], message: data.message ?? (res.ok ? "Reset completado." : data.error), dailyRemaining: status?.dailyRemaining ?? 0 });
      onStatusRefresh();
    } catch {
      setResult({ success: false, imported: 0, skipped: 0, errors: [], message: "Error de conexión al intentar resetear.", dailyRemaining: 0 });
    } finally {
      setResetting(false);
    }
  }

  function downloadTemplate() {
    window.open(`/api/panel/barber/tenants/${tenantId}/import/template?resource=${resource}`, "_blank");
  }

  const pct = planLimit >= 99999 ? 0 : Math.round((count / planLimit) * 100);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Contador del plan */}
      <Card size="small" className="surface-card border-0">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontWeight: 700, fontSize: 13 }}>Registros en BD</Text>
          <Text style={{ fontWeight: 800, color: "hsl(var(--section-barber))", fontSize: 18 }}>{count}</Text>
        </div>
        {planLimit < 99999 && (
          <>
            <Progress percent={pct} size="small" showInfo={false}
              strokeColor={pct > 85 ? "hsl(var(--status-warning))" : "hsl(var(--section-barber))"}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>{count} / {planLimit} — plan {status?.plan}</Text>
          </>
        )}
      </Card>

      {/* Alerta sin intentos */}
      {noIntents && (
        <Alert type="warning" showIcon
          message={`Límite diario alcanzado (${DAILY_LIMIT}/día)`}
          description="Ya usaste los 10 intentos de importación del día. El contador se reinicia a las 12:00 AM."
        />
      )}

      {/* Plantilla + Upload */}
      <Card size="small" className="surface-card border-0"
        title={<Text style={{ fontSize: 13, fontWeight: 700 }}>1. Descarga la plantilla</Text>}
      >
        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
            Descargar plantilla {label}
          </Button>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Llena la plantilla y súbela en el paso 2. No cambies los encabezados.
          </Text>
        </Space>
      </Card>

      <Card size="small" className="surface-card border-0"
        title={<Text style={{ fontSize: 13, fontWeight: 700 }}>2. Sube el archivo completado</Text>}
      >
        <Upload
          accept=".xlsx,.csv"
          maxCount={1}
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: fl }) => setFileList(fl)}
        >
          <Button icon={<CloudUploadOutlined />} disabled={noIntents}>
            Seleccionar archivo (.xlsx / .csv)
          </Button>
        </Upload>
        {fileList.length > 0 && (
          <Button
            type="primary"
            style={{ marginTop: 12, background: "hsl(var(--section-barber))", borderColor: "hsl(var(--section-barber))" }}
            loading={uploading}
            disabled={noIntents}
            onClick={handleUpload}
            icon={<CloudUploadOutlined />}
          >
            {uploading ? "Importando..." : "Importar ahora"}
          </Button>
        )}
      </Card>

      {/* Resultado */}
      {result && (
        <Alert
          type={result.success && result.errors.length === 0 ? "success" : result.errors.length > 0 ? "warning" : "error"}
          showIcon
          message={result.message}
          description={
            result.success && result.errors.length === 0 ? (
              <Text style={{ fontSize: 12 }}>
                {result.imported} importados · {result.skipped} omitidos (duplicados) · Intentos restantes hoy: {result.dailyRemaining}
              </Text>
            ) : null
          }
        />
      )}

      {/* Tabla de errores */}
      {result && result.errors.length > 0 && (
        <Card size="small" className="surface-card border-0"
          title={<Text style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--status-warning))" }}>Errores en {result.errors.length} fila(s)</Text>}
        >
          <Table
            size="small"
            dataSource={result.errors.map((e, i) => ({ ...e, key: i }))}
            pagination={{ pageSize: 10, size: "small" }}
            columns={[
              { title: "Fila",   dataIndex: "fila",  width: 70 },
              { title: "Campo",  dataIndex: "campo", width: 140 },
              { title: "Error",  dataIndex: "error" },
            ]}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Corrige el archivo y vuelve a subirlo. Los registros sin error ya fueron importados.
          </Text>
        </Card>
      )}

      {/* Reset */}
      <Card size="small" className="surface-card border-0"
        title={
          <Text style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--status-error))" }}>
            Zona de reinicio
          </Text>
        }
        style={{ border: "1px solid hsl(var(--status-error) / 0.25)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Text style={{ fontSize: 13 }}>
            Elimina <strong>todos los {label.toLowerCase()}</strong> de este tenant para volver a importar desde cero.
            Esta acción <Text type="danger">no se puede deshacer</Text>.
          </Text>
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={resetting}
            disabled={count === 0}
            onClick={() => setResetModal(true)}
          >
            Resetear {label}
          </Button>
        </div>
      </Card>

      <Modal
        open={resetModal}
        title={<span style={{ color: "hsl(var(--status-error))" }}><ExclamationCircleOutlined /> Confirmar reinicio</span>}
        okText={`Eliminar ${count} registros`}
        okButtonProps={{ danger: true, loading: resetting }}
        cancelText="Cancelar"
        onOk={handleReset}
        onCancel={() => setResetModal(false)}
      >
        <Paragraph>
          Estás a punto de eliminar <Text strong>{count} {label.toLowerCase()}</Text> de este tenant.
          Esta acción es <Text type="danger">permanente e irreversible</Text>.
        </Paragraph>
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Úsala solo si subiste datos incorrectos y necesitas empezar de cero.
        </Paragraph>
      </Modal>
    </div>
  );
}

// ── modal de información ──────────────────────────────

function InfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onCancel={onClose} footer={<Button onClick={onClose}>Entendido</Button>}
      title={<span><InfoCircleOutlined style={{ marginRight: 8 }} />Cómo funciona el módulo de importación</span>}
      width={680}
    >
      <div style={{ display: "grid", gap: 16, paddingTop: 8 }}>
        <Alert type="info" showIcon message="Orden recomendado de importación"
          description="Sube primero las categorías y proveedores (Paso 1), luego clientes, empleados, servicios y productos (Paso 2)."
        />

        <Title level={5} style={{ margin: 0 }}>Límites de seguridad aplicados</Title>
        <Table
          size="small" pagination={false}
          dataSource={[
            { key: 1, capa: "Tamaño de archivo",     desc: "Máximo 2 MB por archivo subido" },
            { key: 2, capa: "Filas por importación", desc: "Clientes: 2000 · Productos: 1000 · Empleados: 100 · Servicios: 500 · Proveedores: 200 · Categorías: 100" },
            { key: 3, capa: "Límite por plan",        desc: "Cada plan tiene un máximo acumulado de registros en BD (TRIAL < BASIC < PRO < ENTERPRISE)" },
            { key: 4, capa: "Intentos diarios",       desc: "Máximo 10 importaciones por tenant por día. Se reinicia a las 12:00 AM" },
            { key: 5, capa: "Validación fila por fila", desc: "Columnas requeridas, emails válidos, precios numéricos. Los errores se muestran en tabla detallada" },
          ]}
          columns={[
            { title: "Capa", dataIndex: "capa", width: 200, render: (v: string) => <Text strong style={{ fontSize: 12 }}>{v}</Text> },
            { title: "Descripción", dataIndex: "desc", render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
          ]}
        />

        <Title level={5} style={{ margin: 0 }}>Zona de reinicio</Title>
        <Paragraph style={{ fontSize: 13, margin: 0 }}>
          Si subiste datos incorrectos, usa el botón <Text code>Resetear</Text> en cada pestaña para eliminar todos los
          registros de ese recurso y volver a importar. El botón solo aparece si hay registros en BD.
          La acción es <Text type="danger">permanente</Text> — confirma antes de proceder.
        </Paragraph>

        <Title level={5} style={{ margin: 0 }}>Plantillas</Title>
        <Paragraph style={{ fontSize: 13, margin: 0 }}>
          Cada pestaña tiene su botón <Text strong>Descargar plantilla</Text>. Descarga el archivo .xlsx,
          llena los datos sin cambiar los encabezados de la primera fila, guarda y súbelo.
          Los campos con asterisco (*) en la columna son obligatorios.
        </Paragraph>

        <Alert type="warning" showIcon
          message="Productos requieren categorías previas"
          description='Si tu archivo de productos tiene categoría, esa categoría debe existir ya en BD. Importa "Categorías de Producto" primero o deja la columna categoría vacía.'
        />
      </div>
    </Modal>
  );
}

// ── componente principal ──────────────────────────────

export function BarberImportModule({
  tenantId, tenantName, plan,
}: {
  tenantId: number;
  tenantName: string;
  plan: string;
}) {
  const [status, setStatus]       = useState<StatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [infoOpen, setInfoOpen]   = useState(false);
  const refreshRef = useRef(0);

  const fetchStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/panel/barber/tenants/${tenantId}/import/status`);
      const data: StatusData = await res.json();
      setStatus(data);
    } finally {
      setLoadingStatus(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const dailyPct = status ? Math.round((status.dailyUsed / DAILY_LIMIT) * 100) : 0;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Barra superior: estado del día + botón info */}
      <Card size="small" className="surface-card border-0">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Tenant
              </Text>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{tenantName}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Plan
              </Text>
              <div><Tag color="purple">{plan}</Tag></div>
            </div>
            <div style={{ minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: 700 }}>Intentos de importación hoy</Text>
                <Text style={{ fontSize: 12, fontWeight: 800 }}>{status?.dailyUsed ?? 0} / {DAILY_LIMIT}</Text>
              </div>
              <Progress
                percent={dailyPct} size="small" showInfo={false}
                strokeColor={dailyPct >= 100 ? "hsl(var(--status-error))" : dailyPct >= 70 ? "hsl(var(--status-warning))" : "hsl(var(--section-barber))"}
              />
            </div>
          </div>
          <Space>
            <Tooltip title="Actualizar estado">
              <Button icon={<ReloadOutlined />} loading={loadingStatus} onClick={fetchStatus} size="small" />
            </Tooltip>
            <Button icon={<InfoCircleOutlined />} onClick={() => setInfoOpen(true)}>
              Información
            </Button>
          </Space>
        </div>
      </Card>

      {/* Tabs por recurso */}
      <Card className="surface-card border-0" size="small">
        <Tabs
          type="card"
          size="small"
          items={RESOURCES.map(r => ({
            key: r.key,
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {r.label}
                <Badge count={status?.counts[r.key] ?? 0} size="small"
                  style={{ backgroundColor: "hsl(var(--section-barber))" }}
                  overflowCount={9999}
                />
              </span>
            ),
            children: (
              <div style={{ paddingTop: 12 }}>
                <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag color={r.tagColor}>{r.tag}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>{r.label}</Text>
                  {r.blockedBy && status?.counts[r.blockedBy as ImportResource] === 0 && (
                    <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                      Importa cat-producto primero si usarás categorías
                    </Tag>
                  )}
                </div>
                <ResourcePanel
                  tenantId={tenantId}
                  resource={r.key}
                  label={r.label}
                  status={status}
                  onStatusRefresh={fetchStatus}
                />
              </div>
            ),
          }))}
        />
      </Card>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
