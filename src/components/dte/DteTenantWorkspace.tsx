"use client";

import type { ReactNode } from "react";
import { Alert, Card, Descriptions, Empty, Space, Table, Tag, Tabs, Timeline, type TabsProps } from "antd";
import {
  Building2,
  CalendarClock,
  FileSpreadsheet,
  KeyRound,
  MapPinned,
  Palette,
  Receipt,
  Signature,
  Users,
  PlugZap,
} from "lucide-react";
import type {
  DteTenantApiMh,
  DteTenantDetail,
  DteTenantDocumentConfig,
  DteTenantEmpresaConfig,
  DteTenantFirma,
  DteTenantPago,
  DteTenantSucursal,
  DteTenantTemaConfig,
  DteTenantUser,
} from "@/lib/integrations/dte";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { DteTenantSummaryCards } from "@/components/dte/DteTenantSummaryCards";

export type DteTenantWorkspaceProps = {
  tenant: DteTenantDetail;
  pagos: DteTenantPago[] | null;
  usuarios: DteTenantUser[] | null;
  dte: DteTenantDocumentConfig[] | null;
  sucursales: DteTenantSucursal[] | null;
  apiMh: DteTenantApiMh | null;
  firma: DteTenantFirma | null;
  empresaConfig: DteTenantEmpresaConfig | null;
  temaConfig: DteTenantTemaConfig | null;
  warnings?: string[];
};

type StatusTone = "success" | "warning" | "error" | "neutral";

function statusTone(estado: DteTenantDetail["estado"] | string | null | undefined): StatusTone {
  if (estado === "activo") return "success";
  if (estado === "pruebas") return "warning";
  if (estado === "suspendido") return "error";
  return "neutral";
}

function pillStyle(tone: StatusTone) {
  if (tone === "success") {
    return {
      background: "hsl(var(--status-success-bg))",
      color: "hsl(var(--status-success))",
    };
  }

  if (tone === "warning") {
    return {
      background: "hsl(var(--status-warning-bg))",
      color: "hsl(var(--status-warning))",
    };
  }

  if (tone === "error") {
    return {
      background: "hsl(var(--status-error-bg))",
      color: "hsl(var(--status-error))",
    };
  }

  return {
    background: "hsl(var(--bg-subtle))",
    color: "hsl(var(--text-secondary))",
  };
}

function toTime(value: string | null | undefined) {
  if (!value) return Number.NEGATIVE_INFINITY;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function latestByDate<T extends { created_at?: string; updated_at?: string; fecha_pago?: string | null }>(items: T[] | null) {
  if (!items?.length) return null;

  return [...items].sort((a, b) => {
    const timeA = toTime(a.fecha_pago ?? a.created_at ?? a.updated_at);
    const timeB = toTime(b.fecha_pago ?? b.created_at ?? b.updated_at);
    return timeB - timeA;
  })[0];
}

function countPoints(sucursales: DteTenantSucursal[] | null) {
  if (!sucursales?.length) return 0;
  return sucursales.reduce((total, sucursal) => total + (sucursal.puntos_venta?.length ?? 0), 0);
}

function isExpired(date: string | null | undefined) {
  if (!date) return false;
  const time = new Date(date).getTime();
  return Number.isFinite(time) ? time < Date.now() : false;
}

function display(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Sin dato";
  return String(value);
}

function toCssColor(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("rgb") || trimmed.startsWith("hsl") || trimmed.startsWith("var(")) {
    return trimmed;
  }

  if (/^\d+\s+\d+%\s+\d+%$/.test(trimmed)) {
    return `hsl(${trimmed})`;
  }

  return trimmed;
}

function SectionCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card
      className="surface-card border-0"
      styles={{
        body: {
          display: "grid",
          gap: "1rem",
        },
      }}
    >
      <div>
        <div style={{ color: "hsl(var(--text-primary))", fontSize: 16, fontWeight: 700 }}>{title}</div>
        <div style={{ marginTop: 4, color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.5 }}>{description}</div>
      </div>
      {children}
    </Card>
  );
}

function EmptySurface({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        borderRadius: "1rem",
        border: "1px dashed hsl(var(--border-default))",
        padding: "1rem",
        background: "hsl(var(--bg-subtle))",
      }}
    >
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <div style={{ color: "hsl(var(--text-primary))", fontWeight: 700 }}>{title}</div>
        <div style={{ marginTop: 4, color: "hsl(var(--text-muted))", fontSize: 13, lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, helper, accentVar }: { label: string; value: string | number; helper: string; accentVar: string }) {
  return (
    <div
      style={{
        borderRadius: "1rem",
        border: "1px solid hsl(var(--border-default) / 0.35)",
        background: "hsl(var(--bg-surface) / 0.08)",
        padding: "0.9rem 1rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ marginTop: 8, color: `hsl(var(${accentVar}))`, fontFamily: "var(--font-display)", fontSize: 24, lineHeight: 1, letterSpacing: "-0.04em" }}>
        {value}
      </div>
      <div style={{ marginTop: 6, color: "hsl(var(--text-inverse) / 0.7)", fontSize: 13, lineHeight: 1.4 }}>{helper}</div>
    </div>
  );
}

function heroBadgeStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    padding: "0.42rem 0.85rem",
    background: "hsl(var(--accent-soft) / 0.78)",
    color: "hsl(var(--accent-strong))",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
  };
}
export function DteTenantWorkspace({
  tenant,
  pagos,
  usuarios,
  dte,
  sucursales,
  apiMh,
  firma,
  empresaConfig,
  temaConfig,
  warnings = [],
}: DteTenantWorkspaceProps) {
  const pagosOrdenados = [...(pagos ?? [])].sort((a, b) => toTime(b.fecha_pago ?? b.created_at) - toTime(a.fecha_pago ?? a.created_at));
  const usuariosOrdenados = [...(usuarios ?? [])].sort((a, b) => toTime(b.updated_at) - toTime(a.updated_at));
  const dteOrdenado = [...(dte ?? [])].sort((a, b) => toTime(b.updated_at) - toTime(a.updated_at));
  const sucursalesOrdenadas = [...(sucursales ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre));

  const latestPago = latestByDate(pagosOrdenados);
  const latestUser = latestByDate(usuariosOrdenados);
  const latestDte = latestByDate(dteOrdenado);
  const activeUsers = usuariosOrdenados.filter((user) => user.activo).length;
  const pointsOfSale = countPoints(sucursalesOrdenadas);
  const apiReady = Boolean(apiMh && apiMh.tiene_password && apiMh.tiene_token);
  const firmaReady = Boolean(firma?.fecha_vencimiento) && !isExpired(firma?.fecha_vencimiento);
  const companyName = empresaConfig?.nombre_negocio ?? tenant.nombre;
  const tenantPlan = tenant.plan_nombre ?? "Sin plan";

  const accentColor = toCssColor(temaConfig?.accent, "hsl(var(--section-dte))");
  const pageColor = toCssColor(temaConfig?.page_bg, "hsl(var(--bg-surface))");
  const cardColor = toCssColor(temaConfig?.card_bg, "hsl(var(--bg-surface-strong))");
  const sidebarColor = toCssColor(temaConfig?.sidebar_bg, "hsl(var(--bg-sidebar))");

  const tabs: TabsProps["items"] = [
    {
      key: "cuenta",
      label: (
        <Space size={8}>
          <CalendarClock size={14} />
          Cuenta
        </Space>
      ),
      children: (
        <SectionCard title="Cuenta del tenant" description="Identidad, estado operativo, limites efectivos y notas base del cliente.">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Nombre">{tenant.nombre}</Descriptions.Item>
            <Descriptions.Item label="Slug">{tenant.slug}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle(statusTone(tenant.estado)) }}>
                {tenant.estado}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Plan">{tenantPlan}</Descriptions.Item>
            <Descriptions.Item label="Contacto">{tenant.email_contacto ?? "Sin dato"}</Descriptions.Item>
            <Descriptions.Item label="Telefono">{tenant.telefono ?? "Sin dato"}</Descriptions.Item>
            <Descriptions.Item label="Ultimo pago">{formatDate(tenant.fecha_pago)}</Descriptions.Item>
            <Descriptions.Item label="Suspension">{formatDate(tenant.fecha_suspension)}</Descriptions.Item>
            <Descriptions.Item label="Limite usuarios">{tenant.max_usuarios ?? tenant.plan_max_usuarios ?? "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Limite sucursales">{tenant.max_sucursales ?? tenant.plan_max_sucursales ?? "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Puntos de venta">{tenant.max_puntos_venta ?? tenant.plan_max_puntos_venta ?? "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Actualizado">{formatDate(tenant.updated_at)}</Descriptions.Item>
          </Descriptions>
          <Alert
            type="info"
            showIcon
            message="Cuenta en modo lectura"
            description="Este bloque ya deja visible la estructura del tenant para operar como workspace real sin exponer acciones de edicion todavia."
          />
        </SectionCard>
      ),
    },
    {
      key: "empresa",
      label: (
        <Space size={8}>
          <Building2 size={14} />
          Empresa
        </Space>
      ),
      children: empresaConfig ? (
        <SectionCard title="Empresa" description="Datos fiscales y comerciales que respaldan el tenant.">
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <Card className="surface-card border-0">
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Empresa registrada
                </div>
                <div style={{ color: "hsl(var(--text-primary))", fontFamily: "var(--font-display)", fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.04em" }}>
                  {companyName}
                </div>
                <Space wrap>
                  <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle("neutral") }}>
                    NIT {empresaConfig.nit ?? "Sin dato"}
                  </Tag>
                  <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle("neutral") }}>
                    NCR {empresaConfig.ncr ?? "Sin dato"}
                  </Tag>
                </Space>
              </div>
            </Card>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Direccion">{empresaConfig.direccion ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Giro">{empresaConfig.giro ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Departamento">{empresaConfig.departamento ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Municipio">{empresaConfig.municipio ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Telefono">{empresaConfig.telefono ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Correo">{empresaConfig.correo ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Actividad">{empresaConfig.cod_actividad ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Descripcion actividad">{empresaConfig.desc_actividad ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Tipo establecimiento">{empresaConfig.tipo_establecimiento ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Actualizado">{formatDate(empresaConfig.updated_at)}</Descriptions.Item>
            </Descriptions>
          </div>
        </SectionCard>
      ) : (
        <EmptySurface title="Sin configuracion de empresa" description="No hay configuracion empresarial cargada para este tenant." />
      ),
    },
    {
      key: "tema",
      label: (
        <Space size={8}>
          <Palette size={14} />
          Tema
        </Space>
      ),
      children: temaConfig ? (
        <SectionCard title="Tema" description="Paleta, superficies y tono visual aplicado a este tenant.">
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div
              style={{
                borderRadius: "1.15rem",
                border: "1px solid hsl(var(--border-default))",
                padding: "1rem",
                background: `linear-gradient(180deg, ${pageColor} 0%, ${cardColor} 100%)`,
              }}
            >
              <div
                style={{
                  borderRadius: "1rem",
                  padding: "1rem",
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${sidebarColor} 100%)`,
                  color: "hsl(var(--text-inverse))",
                }}
              >
                <div style={heroBadgeStyle()}>Vista previa</div>
                <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.04em" }}>
                  Acento y superficies del tenant
                </div>
                <div style={{ marginTop: 8, maxWidth: 360, color: "hsl(var(--text-inverse) / 0.75)", fontSize: 13, lineHeight: 1.5 }}>
                  Esta muestra usa los valores reales del tenant para validar contraste y consistencia visual.
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                {[
                  ["Acento", temaConfig.accent],
                  ["Texto", temaConfig.accent_text],
                  ["Fondo pagina", temaConfig.page_bg],
                  ["Fondo tarjeta", temaConfig.card_bg],
                  ["Sidebar", temaConfig.sidebar_bg],
                  ["Blur", temaConfig.glass_blur ?? "Sin dato"],
                ].map(([label, value]) => (
                  <div key={label} style={{ borderRadius: 12, border: "1px solid hsl(var(--border-default))", padding: "0.85rem", background: "hsl(var(--bg-surface))" }}>
                    <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      {label}
                    </div>
                    <div style={{ marginTop: 6, color: "hsl(var(--text-secondary))", fontSize: 13, wordBreak: "break-word" }}>{display(value)}</div>
                  </div>
                ))}
              </div>
            </div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Acento">{temaConfig.accent}</Descriptions.Item>
              <Descriptions.Item label="Texto acento">{temaConfig.accent_text}</Descriptions.Item>
              <Descriptions.Item label="Fondo pagina">{temaConfig.page_bg}</Descriptions.Item>
              <Descriptions.Item label="Fondo tarjeta">{temaConfig.card_bg}</Descriptions.Item>
              <Descriptions.Item label="Sidebar">{temaConfig.sidebar_bg}</Descriptions.Item>
              <Descriptions.Item label="Blur">{temaConfig.glass_blur ?? "Sin dato"}</Descriptions.Item>
              <Descriptions.Item label="Actualizado">{formatDate(temaConfig.updated_at)}</Descriptions.Item>
            </Descriptions>
          </div>
        </SectionCard>
      ) : (
        <EmptySurface title="Sin tema personalizado" description="No hay tema personalizado cargado para este tenant." />
      ),
    },
    {
      key: "pagos",
      label: (
        <Space size={8}>
          <Receipt size={14} />
          Pagos
        </Space>
      ),
      children: (
        <SectionCard title="Pagos" description="Historial de cobros, metodo y nueva fecha de vencimiento cuando este disponible.">
          {pagosOrdenados.length ? (
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
              dataSource={pagosOrdenados}
              columns={[
                {
                  title: "Fecha",
                  dataIndex: "fecha_pago",
                  render: (value: string | null) => formatDate(value),
                },
                {
                  title: "Monto",
                  dataIndex: "monto",
                  render: (value: number) => formatCurrency(value),
                },
                {
                  title: "Metodo",
                  dataIndex: "metodo",
                  render: (value: string | null) => value ?? "Sin dato",
                },
                {
                  title: "Vence",
                  dataIndex: "nueva_fecha_vencimiento",
                  render: (value: string | null) => formatDate(value),
                },
                {
                  title: "Notas",
                  dataIndex: "notas",
                  render: (value: string | null) => value ?? "Sin dato",
                },
              ]}
            />
          ) : (
            <EmptySurface title="Sin pagos registrados" description="No hay pagos cargados para este tenant." />
          )}
        </SectionCard>
      ),
    },
    {
      key: "usuarios",
      label: (
        <Space size={8}>
          <Users size={14} />
          Usuarios
        </Space>
      ),
      children: (
        <SectionCard title="Usuarios" description="Cuentas habilitadas para operar el tenant con su rol y estado actual.">
          {usuariosOrdenados.length ? (
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
              dataSource={usuariosOrdenados}
              columns={[
                { title: "Nombre", dataIndex: "nombre" },
                { title: "Usuario", dataIndex: "username" },
                { title: "Rol", dataIndex: "rol" },
                {
                  title: "Estado",
                  dataIndex: "activo",
                  render: (value: boolean) => (
                    <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle(value ? "success" : "error") }}>
                      {value ? "Activo" : "Inactivo"}
                    </Tag>
                  ),
                },
                {
                  title: "Actualizado",
                  dataIndex: "updated_at",
                  render: (value: string) => formatDate(value),
                },
              ]}
            />
          ) : (
            <EmptySurface title="Sin usuarios" description="No hay usuarios registrados para este tenant." />
          )}
        </SectionCard>
      ),
    },
    {
      key: "dte",
      label: (
        <Space size={8}>
          <FileSpreadsheet size={14} />
          DTE
        </Space>
      ),
      children: (
        <SectionCard title="DTE" description="Series, prefijos y numeracion actual de los documentos electronicos del tenant.">
          {dteOrdenado.length ? (
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
              dataSource={dteOrdenado}
              columns={[
                { title: "Tipo DTE", dataIndex: "tipo_dte" },
                { title: "Prefijo", dataIndex: "prefijo" },
                { title: "Numero actual", dataIndex: "numero_actual", render: (value: number) => formatNumber(value) },
                { title: "Actualizado", dataIndex: "updated_at", render: (value: string) => formatDate(value) },
              ]}
            />
          ) : (
            <EmptySurface title="Sin series DTE" description="No hay configuracion DTE cargada para este tenant." />
          )}
        </SectionCard>
      ),
    },
    {
      key: "sucursales",
      label: (
        <Space size={8}>
          <MapPinned size={14} />
          Sucursales
        </Space>
      ),
      children: (
        <SectionCard title="Sucursales" description="Ubicaciones, codigos y puntos de venta que operan dentro del tenant.">
          {sucursalesOrdenadas.length ? (
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
              dataSource={sucursalesOrdenadas}
              expandable={{
                expandedRowRender: (record) => {
                  const puntos = record.puntos_venta ?? [];
                  if (!puntos.length) {
                    return <EmptySurface title="Sin puntos de venta" description="Esta sucursal aun no tiene puntos de venta asociados." />;
                  }

                  return (
                    <Space wrap>
                      {puntos.map((point) => (
                        <Tag key={point.id} bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle(point.activo ? "success" : "error") }}>
                          {point.nombre} · {point.codigo}
                        </Tag>
                      ))}
                    </Space>
                  );
                },
              }}
              columns={[
                { title: "Sucursal", dataIndex: "nombre" },
                { title: "Codigo", dataIndex: "codigo" },
                { title: "Codigo MH", dataIndex: "codigo_mh", render: (value: string | null) => value ?? "Sin dato" },
                {
                  title: "Ubicacion",
                  render: (_: unknown, record) => `${record.departamento_nombre ?? "Sin dpto"} / ${record.municipio_nombre ?? "Sin municipio"}`,
                },
                {
                  title: "Contacto",
                  render: (_: unknown, record) => `${record.telefono ?? "Sin tel"} · ${record.correo ?? "Sin correo"}`,
                },
                {
                  title: "Estado",
                  dataIndex: "activo",
                  render: (value: boolean) => (
                    <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle(value ? "success" : "error") }}>
                      {value ? "Activa" : "Inactiva"}
                    </Tag>
                  ),
                },
              ]}
            />
          ) : (
            <EmptySurface title="Sin sucursales" description="No hay sucursales registradas para este tenant." />
          )}
        </SectionCard>
      ),
    },
    {
      key: "api",
      label: (
        <Space size={8}>
          <KeyRound size={14} />
          API Hacienda
        </Space>
      ),
      children: (
        <SectionCard title="API Hacienda" description="Conexion tecnica con ambiente, autenticacion y endpoints del tenant.">
          {apiMh ? (
            <>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Ambiente">{apiMh.ambiente}</Descriptions.Item>
                <Descriptions.Item label="Usuario API">{apiMh.usuario_api ?? "Sin dato"}</Descriptions.Item>
                <Descriptions.Item label="Auth URL">{apiMh.url_auth}</Descriptions.Item>
                <Descriptions.Item label="Transmision URL">{apiMh.url_transmision}</Descriptions.Item>
                <Descriptions.Item label="Password">{apiMh.tiene_password ? "Cargado" : "Sin password"}</Descriptions.Item>
                <Descriptions.Item label="Token">{apiMh.tiene_token ? "Cargado" : "Sin token"}</Descriptions.Item>
                <Descriptions.Item label="Token expira">{formatDate(apiMh.token_expira_en)}</Descriptions.Item>
                <Descriptions.Item label="Actualizado">{formatDate(apiMh.updated_at)}</Descriptions.Item>
              </Descriptions>
              <Alert
                type={apiReady ? "success" : "warning"}
                showIcon
                message={apiReady ? "Conexion lista" : "Conexion parcial"}
                description={
                  apiReady
                    ? "La configuracion tiene usuario, password y token disponibles para operar desde el panel central."
                    : "Falta completar credenciales o token para considerar esta configuracion como lista."
                }
              />
            </>
          ) : (
            <EmptySurface title="Sin configuracion API Hacienda" description="No hay configuracion de API Hacienda cargada para este tenant." />
          )}
        </SectionCard>
      ),
    },
    {
      key: "firma",
      label: (
        <Space size={8}>
          <Signature size={14} />
          Firma
        </Space>
      ),
      children: (
        <SectionCard title="Firma digital" description="Certificado, NIT y vigencia de la firma digital asociada al tenant.">
          {firma ? (
            <>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Archivo certificado">{firma.archivo_nombre ?? "Sin dato"}</Descriptions.Item>
                <Descriptions.Item label="Ruta certificado">{firma.certificado_path ?? "Sin dato"}</Descriptions.Item>
                <Descriptions.Item label="NIT certificado">{firma.nit_certificado ?? "Sin dato"}</Descriptions.Item>
                <Descriptions.Item label="Password">{firma.tiene_password ? "Cargado" : "Sin password"}</Descriptions.Item>
                <Descriptions.Item label="Certificado">{firma.tiene_certificado ? "Cargado" : "Sin archivo"}</Descriptions.Item>
                <Descriptions.Item label="Vence">{formatDate(firma.fecha_vencimiento)}</Descriptions.Item>
                <Descriptions.Item label="Actualizado">{formatDate(firma.updated_at ?? null)}</Descriptions.Item>
                <Descriptions.Item label="Estado">
                  <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle(firmaReady ? "success" : "warning") }}>
                    {firmaReady ? "Activa" : "Revisar"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              <Timeline
                items={[
                  {
                    color: firma.tiene_certificado ? "green" : "gray",
                    children: (
                      <div>
                        <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>Certificado</div>
                        <div style={{ color: "hsl(var(--text-muted))" }}>{firma.tiene_certificado ? "Archivo disponible" : "Sin archivo cargado"}</div>
                      </div>
                    ),
                  },
                  {
                    color: firma.tiene_password ? "green" : "gray",
                    children: (
                      <div>
                        <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>Password</div>
                        <div style={{ color: "hsl(var(--text-muted))" }}>{firma.tiene_password ? "Password disponible" : "Sin password cargado"}</div>
                      </div>
                    ),
                  },
                  {
                    color: firmaReady ? "green" : "orange",
                    children: (
                      <div>
                        <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))" }}>Vigencia</div>
                        <div style={{ color: "hsl(var(--text-muted))" }}>{firma.fecha_vencimiento ? formatDate(firma.fecha_vencimiento) : "Sin fecha"}</div>
                      </div>
                    ),
                  },
                ]}
              />
            </>
          ) : (
            <EmptySurface title="Sin firma digital" description="No hay firma digital cargada para este tenant." />
          )}
        </SectionCard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {warnings.length ? (
        <Alert
          type="warning"
          showIcon
          message="Algunos bloques no respondieron"
          description={
            <Space wrap>
              {warnings.map((warning) => (
                <Tag key={warning} bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle("warning") }}>
                  {warning}
                </Tag>
              ))}
            </Space>
          }
        />
      ) : null}

      <Card
        className="surface-card border-0 overflow-hidden"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)" }}>
          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(135deg, hsl(var(--bg-surface-strong)) 0%, hsl(var(--bg-subtle)) 56%, hsl(var(--accent-soft) / 0.45) 100%)",
              borderBottom: `3px solid ${accentColor}`,
            }}
          >
            <div style={heroBadgeStyle()}>Workspace DTE</div>
            <div
              style={{
                marginTop: 14,
                color: "hsl(var(--text-primary))",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3vw, 3.1rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
                textWrap: "balance",
              }}
            >
              {tenant.nombre}
            </div>
            <div style={{ marginTop: 10, maxWidth: 720, color: "hsl(var(--text-muted))", fontSize: 14, lineHeight: 1.7 }}>
              Vista profunda del tenant con cuenta, empresa, tema, pagos, usuarios, DTE, sucursales, API Hacienda y firma.
            </div>

            <Space wrap style={{ marginTop: 18 }}>
              <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle(statusTone(tenant.estado)) }}>
                {tenant.estado}
              </Tag>
              <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle("neutral") }}>
                Plan {tenantPlan}
              </Tag>
              <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle("neutral") }}>
                {tenant.slug}
              </Tag>
              <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle("neutral") }}>
                {companyName}
              </Tag>
            </Space>

            <div style={{ marginTop: 20 }}>
              <Descriptions bordered column={3} size="small">
                <Descriptions.Item label="Contacto">{tenant.email_contacto ?? "Sin dato"}</Descriptions.Item>
                <Descriptions.Item label="Telefono">{tenant.telefono ?? "Sin dato"}</Descriptions.Item>
                <Descriptions.Item label="Actualizado">{formatDate(tenant.updated_at)}</Descriptions.Item>
                <Descriptions.Item label="Ultimo pago">{formatDate(tenant.fecha_pago)}</Descriptions.Item>
                <Descriptions.Item label="Suspension">{formatDate(tenant.fecha_suspension)}</Descriptions.Item>
                <Descriptions.Item label="Notas">{tenant.notas ?? "Sin notas"}</Descriptions.Item>
              </Descriptions>
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(180deg, hsl(var(--bg-sidebar)) 0%, hsl(var(--bg-sidebar-elevated)) 100%)",
              color: "hsl(var(--text-inverse))",
            }}
          >
            <div style={heroBadgeStyle()}>Snapshot operativo</div>
            <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
              <HeroStat
                label="Ultimo pago"
                value={latestPago ? formatDate(latestPago.fecha_pago ?? latestPago.created_at ?? null) : formatDate(tenant.fecha_pago)}
                helper={latestPago ? `${formatCurrency(latestPago.monto)} · ${latestPago.metodo ?? "Sin metodo"}` : "Sin pago cargado"}
                accentVar="--section-barber"
              />
              <HeroStat
                label="Usuarios activos"
                value={`${activeUsers}/${usuariosOrdenados.length}`}
                helper={`Limite ${tenant.max_usuarios ?? tenant.plan_max_usuarios ?? "N/A"} usuarios`}
                accentVar="--section-erp"
              />
              <HeroStat
                label="Sucursales"
                value={sucursalesOrdenadas.length}
                helper={`${pointsOfSale} puntos de venta asociados`}
                accentVar="--section-overview"
              />
              <HeroStat
                label="Series DTE"
                value={dteOrdenado.length}
                helper={latestDte ? `${latestDte.tipo_dte} · ${latestDte.prefijo}` : "Sin series cargadas"}
                accentVar="--section-dte"
              />
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PlugZap size={16} />
                <span style={{ fontWeight: 700 }}>API Hacienda</span>
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle(apiReady ? "success" : "warning") }}>
                  {apiReady ? "Conectada" : "Parcial"}
                </Tag>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Signature size={16} />
                <span style={{ fontWeight: 700 }}>Firma</span>
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle(firmaReady ? "success" : "warning") }}>
                  {firma ? (firmaReady ? "Activa" : "Revisar") : "Sin firma"}
                </Tag>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Palette size={16} />
                <span style={{ fontWeight: 700 }}>Tema</span>
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle("neutral") }}>
                  {temaConfig ? "Definido" : "Sistema"}
                </Tag>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={16} />
                <span style={{ fontWeight: 700 }}>Ultimo usuario</span>
                <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...pillStyle("neutral") }}>
                  {latestUser?.username ?? "Sin usuarios"}
                </Tag>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <DteTenantSummaryCards
        tenant={tenant}
        pagos={pagos}
        usuarios={usuarios}
        dte={dte}
        sucursales={sucursales}
        apiMh={apiMh}
        firma={firma}
        empresaConfig={empresaConfig}
        temaConfig={temaConfig}
      />

      <Card className="surface-card border-0">
        <Tabs items={tabs} />
      </Card>
    </div>
  );
}

