import { Alert, Button, Col, Row, Tag } from "antd";
import { Building2, FileSpreadsheet, Receipt, Users } from "lucide-react";
import type { ReactNode } from "react";
import { DteTenantWorkspace } from "@/components/dte/DteTenantWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";
import { getErrorMessage } from "@/lib/error-message";
import {
  getDteTenant,
  getDteTenantApiMh,
  getDteTenantDte,
  getDteTenantEmpresaConfig,
  getDteTenantFirma,
  getDteTenantPagos,
  getDteTenantSucursales,
  getDteTenantTemaConfig,
  getDteTenantUsuarios,
} from "@/lib/integrations/dte";

function settledValue<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : null;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-secondary))" }}>{children}</span>;
}

function CompactStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid hsl(var(--border-default))",
        background: "hsl(var(--bg-surface))",
        padding: "0.8rem 0.9rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          color: "hsl(var(--text-muted))",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          color: "hsl(var(--text-primary))",
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 800,
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
    </div>
  );
}

async function loadDteTenantWorkspace(id: string) {
  const tenantId = Number(id);

  if (!Number.isInteger(tenantId) || tenantId <= 0) {
    return { error: "El id del tenant no es valido." };
  }

  const results = await Promise.allSettled([
    getDteTenant(tenantId),
    getDteTenantPagos(tenantId),
    getDteTenantUsuarios(tenantId),
    getDteTenantDte(tenantId),
    getDteTenantSucursales(tenantId),
    getDteTenantApiMh(tenantId),
    getDteTenantFirma(tenantId),
    getDteTenantEmpresaConfig(tenantId),
    getDteTenantTemaConfig(tenantId),
  ] as const);

  const [tenantResult, pagosResult, usuariosResult, dteResult, sucursalesResult, apiMhResult, firmaResult, empresaConfigResult, temaConfigResult] = results;

  if (tenantResult.status === "rejected") {
    return { error: getErrorMessage(tenantResult.reason) };
  }

  const warnings: string[] = [];
  if (pagosResult.status === "rejected") warnings.push("Pagos");
  if (usuariosResult.status === "rejected") warnings.push("Usuarios");
  if (dteResult.status === "rejected") warnings.push("DTE");
  if (sucursalesResult.status === "rejected") warnings.push("Sucursales");
  if (apiMhResult.status === "rejected") warnings.push("API Hacienda");
  if (firmaResult.status === "rejected") warnings.push("Firma");
  if (empresaConfigResult.status === "rejected") warnings.push("Empresa");
  if (temaConfigResult.status === "rejected") warnings.push("Tema");

  return {
    tenant: tenantResult.value,
    pagos: settledValue(pagosResult),
    usuarios: settledValue(usuariosResult),
    dte: settledValue(dteResult),
    sucursales: settledValue(sucursalesResult),
    apiMh: settledValue(apiMhResult),
    firma: settledValue(firmaResult),
    empresaConfig: settledValue(empresaConfigResult),
    temaConfig: settledValue(temaConfigResult),
    warnings,
  };
}

export default async function DteClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadDteTenantWorkspace(id);

  if ("error" in result) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="DTE" title="Detalle DTE" description={`No se pudo abrir el tenant ${id}.`} />
        <Alert type="error" showIcon message="Fallo la integracion" description={result.error} />
      </div>
    );
  }

  const { tenant, warnings, ...workspaceData } = result;
  const pagosCount = workspaceData.pagos?.length ?? 0;
  const usuariosCount = workspaceData.usuarios?.length ?? 0;
  const sucursalesCount = workspaceData.sucursales?.length ?? 0;
  const seriesCount = workspaceData.dte?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title={tenant.nombre}
        description="Workspace compacto del tenant DTE con cuenta, pagos, usuarios y DTE."
        actions={
          <>
            <Tag bordered={false} style={{ margin: 0, borderRadius: 999, background: "hsl(var(--bg-subtle))", color: "hsl(var(--text-secondary))" }}>
              Solo lectura
            </Tag>
            <Button href="/dte/clientes" type="default">
              Volver a clientes
            </Button>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Usuarios" value={usuariosCount} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Pagos" value={pagosCount} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Sucursales" value={sucursalesCount} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <CompactStat label="Series DTE" value={seriesCount} />
        </Col>
      </Row>

      <DteTenantWorkspace tenant={tenant} warnings={warnings} {...workspaceData} />
    </div>
  );
}
