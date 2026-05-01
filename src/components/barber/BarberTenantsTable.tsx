"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, message, Modal, Space, Table, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CopyOutlined, KeyOutlined, TeamOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { BarberTenantListItem } from "@/lib/integrations/barber";
import { EditBarberTenantDrawer } from "./EditBarberTenantDrawer";

const { Text } = Typography;

function statusColor(status: string) {
  if (status === "ACTIVE") return "success";
  if (status === "TRIAL") return "processing";
  if (status === "SUSPENDED") return "warning";
  return "error";
}

function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("es-SV", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type ResetResult = { ownerEmail: string; ownerName: string; newPassword: string; tenantName: string };

export function BarberTenantsTable({
  items,
  barberAppUrl,
  total,
  currentPage,
  pageSize,
}: {
  items: BarberTenantListItem[];
  barberAppUrl: string;
  total: number;
  currentPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, contextHolderModal] = Modal.useModal();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);

  const editingTenant = editingId !== null ? items.find((t) => t.id === editingId) ?? null : null;

  function confirmDelete(tenant: BarberTenantListItem) {
    modal.confirm({
      title: `Eliminar "${tenant.name}"`,
      icon: <ExclamationCircleOutlined />,
      content: "Esta acción eliminará el tenant. ¿Deseas continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: () => handleDelete(tenant.id),
    });
  }

  function confirmReset(tenant: BarberTenantListItem) {
    modal.confirm({
      title: `Resetear contraseña — "${tenant.name}"`,
      icon: <KeyOutlined />,
      content: "Se generará una nueva contraseña para el propietario. La contraseña actual dejará de funcionar.",
      okText: "Resetear contraseña",
      cancelText: "Cancelar",
      onOk: () => handleResetPassword(tenant),
    });
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/panel/barber/tenants/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        messageApi.error(data?.error ?? "Error al eliminar");
        return;
      }
      messageApi.success("Tenant eliminado");
      router.refresh();
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleResetPassword(tenant: BarberTenantListItem) {
    setResettingId(tenant.id);
    try {
      const res = await fetch(`/api/panel/barber/tenants/${tenant.id}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        messageApi.error(data?.error ?? "Error al resetear contraseña");
        return;
      }
      setResetResult({ ...data.data, tenantName: tenant.name });
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setResettingId(null);
    }
  }

  const columns: ColumnsType<BarberTenantListItem> = [
    {
      key: "name",
      title: "Negocio",
      render: (_, row) => (
        <Link href={`/barber/tenants/${row.id}`} style={{ fontWeight: 600 }}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "businessType",
      title: "Tipo",
      render: (_, row) => (
        <Tag color={row.businessType === "SALON" ? "magenta" : "blue"}>
          {row.businessType === "SALON" ? "Salón" : "Barbería"}
        </Tag>
      ),
    },
    {
      key: "slug",
      title: "Slug",
      dataIndex: "slug",
    },
    {
      key: "plan",
      title: "Plan",
      dataIndex: "plan",
    },
    {
      key: "status",
      title: "Estado",
      render: (_, row) => (
        <Tag color={statusColor(row.status)}>{row.status}</Tag>
      ),
    },
    {
      key: "paidUntil",
      title: "Pago hasta",
      render: (_, row) => formatDate(row.paidUntil),
    },
    {
      key: "owner",
      title: "Propietario",
      render: (_, row) => {
        const owner = row.users?.[0];
        if (!owner) return <span style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}>—</span>;
        return (
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{owner.fullName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "hsl(var(--text-muted))", fontSize: 11 }}>{owner.email}</span>
              <Tooltip title="Copiar email">
                <CopyOutlined
                  style={{ fontSize: 11, color: "hsl(var(--text-muted))", cursor: "pointer" }}
                  onClick={() => { navigator.clipboard.writeText(owner.email); }}
                />
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      key: "city",
      title: "Ciudad",
      render: (_, row) => row.city ?? "—",
    },
    {
      key: "acceso",
      title: "URL de acceso",
      render: (_, row) => (
        <Link
          href={`${barberAppUrl}/login/${row.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: "hsl(172 78% 28%)", whiteSpace: "nowrap" }}
        >
          /login/{row.slug} ↗
        </Link>
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      align: "center",
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="Gestionar equipo (roles)">
            <Link href={`/barber/tenants/${row.id}`}>
              <Button
                size="small"
                icon={<TeamOutlined />}
                style={{ color: "hsl(var(--section-barber))", borderColor: "hsl(var(--section-barber))" }}
              />
            </Link>
          </Tooltip>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => setEditingId(row.id)} />
          </Tooltip>
          <Tooltip title="Nueva contraseña">
            <Button
              size="small"
              icon={<KeyOutlined />}
              loading={resettingId === row.id}
              onClick={() => confirmReset(row)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === row.id}
              onClick={() => confirmDelete(row)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      {contextHolderModal}

      <Table
        size="small"
        columns={columns}
        dataSource={items}
        rowKey="id"
        pagination={{
          total,
          current: currentPage,
          pageSize,
          pageSizeOptions: [10, 25, 50, 100],
          showSizeChanger: true,
          showTotal: (t, [from, to]) => `${from}–${to} de ${t} barberías`,
          onChange: (page, size) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(page));
            params.set("limit", String(size));
            router.push(`/barber/tenants?${params.toString()}`);
          },
        }}
        locale={{ emptyText: "Sin barberías registradas" }}
      />

      {editingTenant && (
        <EditBarberTenantDrawer
          tenant={editingTenant}
          open={editingId !== null}
          onClose={() => setEditingId(null)}
          onSaved={() => { setEditingId(null); router.refresh(); }}
        />
      )}

      {/* Modal nueva contraseña */}
      <Modal
        open={!!resetResult}
        title="Nueva contraseña generada"
        onCancel={() => setResetResult(null)}
        footer={<Button type="primary" onClick={() => setResetResult(null)}>Listo</Button>}
      >
        {resetResult && (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                background: "hsl(172 78% 28% / 0.06)",
                border: "1px solid hsl(172 78% 28% / 0.25)",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 12,
              }}
            >
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Empresa
              </Text>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{resetResult.tenantName}</div>
            </div>

            <div
              style={{
                background: "hsl(var(--bg-subtle, 220 13% 96%))",
                border: "1px solid hsl(var(--border-default))",
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 12,
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Propietario
                </Text>
                <div style={{ fontWeight: 600 }}>{resetResult.ownerName}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Usuario / Email
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text strong>{resetResult.ownerEmail}</Text>
                  <Tooltip title="Copiar email">
                    <CopyOutlined
                      style={{ cursor: "pointer", color: "hsl(var(--text-muted))" }}
                      onClick={() => { navigator.clipboard.writeText(resetResult.ownerEmail); messageApi.success("Email copiado"); }}
                    />
                  </Tooltip>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Nueva contraseña
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <Text strong code style={{ fontSize: 16, letterSpacing: 2 }}>
                    {resetResult.newPassword}
                  </Text>
                  <Tooltip title="Copiar contraseña">
                    <CopyOutlined
                      style={{ cursor: "pointer", color: "hsl(var(--text-muted))" }}
                      onClick={() => { navigator.clipboard.writeText(resetResult.newPassword); messageApi.success("Contraseña copiada"); }}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>

            <Text type="warning" style={{ fontSize: 12 }}>
              Guarda esta contraseña — no se puede recuperar después de cerrar.
            </Text>
          </div>
        )}
      </Modal>
    </>
  );
}
