"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, message, Modal, Space, Table, Tag } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { BarberTenantListItem } from "@/lib/integrations/barber";
import { EditBarberTenantDrawer } from "./EditBarberTenantDrawer";

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

export function BarberTenantsTable({
  items,
  barberAppUrl,
}: {
  items: BarberTenantListItem[];
  barberAppUrl: string;
}) {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, contextHolderModal] = Modal.useModal();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditingId(row.id)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === row.id}
            onClick={() => confirmDelete(row)}
          />
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
        pagination={false}
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
    </>
  );
}
