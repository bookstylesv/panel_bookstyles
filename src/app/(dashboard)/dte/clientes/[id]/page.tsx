import { Alert, Button, Tag } from "antd";
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DTE"
        title={tenant.nombre}
        description="Workspace profundo del tenant DTE con cuenta, empresa, pagos, usuarios, DTE, sucursales, API Hacienda y firma."
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
      <DteTenantWorkspace tenant={tenant} warnings={warnings} {...workspaceData} />
    </div>
  );
}
