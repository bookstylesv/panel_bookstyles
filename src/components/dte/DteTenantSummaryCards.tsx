"use client";

import type { ReactNode } from "react";
import { Card, Col, Row, Statistic, Tag } from "antd";
import { Building2, CalendarClock, CreditCard, Palette, ShieldCheck, Store, Users } from "lucide-react";
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

function getStatusTone(estado: DteTenantDetail["estado"]) {
  if (estado === "activo") return "success";
  if (estado === "pruebas") return "warning";
  return "error";
}

function toneStyle(tone: "success" | "warning" | "error") {
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

  return {
    background: "hsl(var(--status-error-bg))",
    color: "hsl(var(--status-error))",
  };
}

function getExpiryLabel(fechaPago: string | null) {
  if (!fechaPago) return "Sin fecha de pago";

  const date = new Date(fechaPago);
  if (Number.isNaN(date.getTime())) return "Fecha invalida";

  const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)} dias`;
  if (diffDays === 0) return "Vence hoy";
  if (diffDays === 1) return "Vence manana";
  return `Vence en ${diffDays} dias`;
}

function toTime(value: string | null | undefined) {
  if (!value) return Number.NEGATIVE_INFINITY;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function getLatestPago(pagos?: DteTenantPago[] | null) {
  if (!pagos?.length) return null;

  return [...pagos].sort((a, b) => toTime(b.fecha_pago ?? b.created_at) - toTime(a.fecha_pago ?? a.created_at))[0];
}

function countTotalPuntosVenta(sucursales?: DteTenantSucursal[] | null) {
  if (!sucursales?.length) return 0;

  return sucursales.reduce((total, sucursal) => total + (sucursal.puntos_venta?.length ?? 0), 0);
}

function isCertificateExpired(firma?: DteTenantFirma | null) {
  if (!firma?.fecha_vencimiento) return false;

  const time = new Date(firma.fecha_vencimiento).getTime();
  return Number.isFinite(time) ? time < Date.now() : false;
}

function getThemeLabel(temaConfig?: DteTenantTemaConfig | null) {
  if (!temaConfig) return "Tema del sistema";
  return "Tema definido";
}

function SummaryCard({
  title,
  value,
  accentVar,
  icon,
  meta,
}: {
  title: string;
  value: string | number;
  accentVar: string;
  icon: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <Card
      className="surface-card border-0 h-full"
      size="small"
      style={{ borderTop: `3px solid hsl(var(${accentVar}))` }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          minHeight: "100%",
        },
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "hsl(var(--text-secondary))",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          {meta ? <div style={{ marginTop: 8 }}>{meta}</div> : null}
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: `hsl(var(${accentVar}) / 0.12)`,
            color: `hsl(var(${accentVar}))`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
      <Statistic
        value={value}
        valueStyle={{
          color: `hsl(var(${accentVar}))`,
          fontFamily: "var(--font-display)",
          fontSize: 28,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      />
    </Card>
  );
}

export type DteTenantSummaryCardsProps = {
  tenant: DteTenantDetail;
  pagos?: DteTenantPago[] | null;
  usuarios?: DteTenantUser[] | null;
  dte?: DteTenantDocumentConfig[] | null;
  sucursales?: DteTenantSucursal[] | null;
  apiMh?: DteTenantApiMh | null;
  firma?: DteTenantFirma | null;
  empresaConfig?: DteTenantEmpresaConfig | null;
  temaConfig?: DteTenantTemaConfig | null;
};

export function DteTenantSummaryCards({
  tenant,
  pagos,
  usuarios,
  dte,
  sucursales,
  apiMh,
  firma,
  empresaConfig,
  temaConfig,
}: DteTenantSummaryCardsProps) {
  const latestPago = getLatestPago(pagos);
  const totalUsuarios = usuarios?.length ?? 0;
  const usuariosActivos = usuarios?.filter((user) => user.activo).length ?? 0;
  const totalSucursales = sucursales?.length ?? 0;
  const totalPuntosVenta = countTotalPuntosVenta(sucursales);
  const totalSeries = dte?.length ?? 0;
  const ultimaSerie = dte?.[0]?.prefijo ?? "Sin serie";
  const apiConectada = Boolean(apiMh && apiMh.tiene_password && apiMh.tiene_token);
  const firmaActiva = Boolean(firma?.fecha_vencimiento) && !isCertificateExpired(firma);
  const tenantPlan = tenant.plan_nombre ?? "Sin plan";
  const companyName = empresaConfig?.nombre_negocio ?? tenant.nombre;
  const latestPaymentDate = latestPago?.fecha_pago ?? latestPago?.created_at ?? tenant.fecha_pago;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} xl={6}>
        <SummaryCard
          title="Estado"
          value={tenant.estado}
          accentVar="--section-dte"
          icon={<ShieldCheck size={18} />}
          meta={
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Tag bordered={false} style={{ margin: 0, borderRadius: 999, ...toneStyle(getStatusTone(tenant.estado)) }}>
                {tenantPlan}
              </Tag>
              <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--bg-subtle))", color: "hsl(var(--text-secondary))" }}>
                {companyName}
              </Tag>
            </div>
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryCard
          title="Ultimo pago"
          value={latestPaymentDate ? formatDate(latestPaymentDate) : "Sin dato"}
          accentVar="--section-barber"
          icon={<CalendarClock size={18} />}
          meta={
            <span style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>
              {latestPago
                ? `${formatCurrency(latestPago.monto)} · ${getExpiryLabel(latestPago.nueva_fecha_vencimiento ?? latestPago.fecha_pago)}`
                : getExpiryLabel(tenant.fecha_pago)}
            </span>
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryCard
          title="Usuarios"
          value={formatNumber(totalUsuarios)}
          accentVar="--section-erp"
          icon={<Users size={18} />}
          meta={
            <span style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>
              {usuariosActivos} activos · limite {tenant.max_usuarios ?? tenant.plan_max_usuarios ?? "N/A"}
            </span>
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryCard
          title="Sucursales"
          value={formatNumber(totalSucursales)}
          accentVar="--section-overview"
          icon={<Store size={18} />}
          meta={
            <span style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>
              {formatNumber(totalPuntosVenta)} puntos de venta
            </span>
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryCard
          title="Series DTE"
          value={formatNumber(totalSeries)}
          accentVar="--section-dte"
          icon={<CreditCard size={18} />}
          meta={
            <span style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>
              Ultima serie {ultimaSerie}
            </span>
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryCard
          title="API Hacienda"
          value={apiConectada ? "Conectada" : apiMh ? "Parcial" : "Sin config"}
          accentVar="--section-barber"
          icon={<Building2 size={18} />}
          meta={
            <span style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>
              {apiMh?.ambiente ?? "Sin ambiente"}
            </span>
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryCard
          title="Firma"
          value={firmaActiva ? "Activa" : firma ? "Revisar" : "Sin firma"}
          accentVar="--section-erp"
          icon={<ShieldCheck size={18} />}
          meta={
            <span style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>
              {firma?.fecha_vencimiento ? formatDate(firma.fecha_vencimiento) : "Sin vencimiento"}
            </span>
          }
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryCard
          title="Tema"
          value={getThemeLabel(temaConfig)}
          accentVar="--section-overview"
          icon={<Palette size={18} />}
          meta={
            <span style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>
              {temaConfig ? `Acento ${temaConfig.accent}` : "Usa el tema global"}
            </span>
          }
        />
      </Col>
    </Row>
  );
}

