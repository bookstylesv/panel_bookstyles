"use client";

import { useState } from "react";
import {
  Button, Card, Checkbox, Col, Divider, Form, Input,
  InputNumber, Modal, Popconfirm, Row, Space, Tag,
  Typography, message,
} from "antd";
import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import type { BarberPlanConfigItem, BarberModules } from "@/lib/integrations/barber";

const { Text, Title } = Typography;

const SYSTEM_PLANS = ["trial", "basic", "pro", "enterprise"];

const SYSTEM_COLORS: Record<string, string> = {
  trial:      "default",
  basic:      "blue",
  pro:        "purple",
  enterprise: "gold",
};

const MODULE_LABELS: Record<keyof BarberModules, string> = {
  pos:          "POS",
  pos_turnos:   "Turnos de Caja",
  pos_dte:      "Documentos / Facturación DTE",
  appointments: "Citas / Agenda",
  billing:      "Caja de Citas / Agenda",
  clients:      "Clientes",
  loyalty:      "Fidelización (Puntos y Tarjetas)",
  barbers:      "Barberos / Estilistas",
  services:     "Servicios / Tratamientos",
  compras:      "Compras",
  proveedores:  "Proveedores",
  productos:    "Productos",
  inventario:   "Inventario",
  gastos:       "Gastos",
  cxp:          "Cuentas por Pagar",
  payroll:      "Planilla",
  branches:     "Sucursales",
  settings:     "Configuración del sistema",
};

const MODULE_KEYS = Object.keys(MODULE_LABELS) as (keyof BarberModules)[];

const DEFAULT_MODULES: BarberModules = Object.fromEntries(
  MODULE_KEYS.map((k) => [k, false])
) as BarberModules;

const LEGACY_MODULE_GROUPS: Record<string, (keyof BarberModules)[]> = {
  pos: ["pos", "pos_turnos"],
  appointments: ["appointments", "billing"],
  products: ["compras", "proveedores", "productos", "inventario"],
  expenses: ["gastos", "cxp"],
  billing_dte: ["pos_dte"],
  dte: ["pos_dte"],
};

function normalizeModules(modules: Partial<Record<string, boolean>> | null | undefined): BarberModules {
  const normalized = { ...DEFAULT_MODULES };
  for (const [key, enabled] of Object.entries(modules ?? {})) {
    if (typeof enabled !== "boolean") continue;
    const targets = LEGACY_MODULE_GROUPS[key] ?? (MODULE_KEYS.includes(key as keyof BarberModules) ? [key as keyof BarberModules] : []);
    for (const target of targets) normalized[target] = enabled;
  }
  return normalized;
}

// ─── PlanCard ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  config: BarberPlanConfigItem;
  onDeleted: (slug: string) => void;
}

function PlanCard({ config: initial, onDeleted }: PlanCardProps) {
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [modules, setModules]       = useState<BarberModules>(() => normalizeModules(initial.modules));
  const [maxBarbers, setMaxBarbers] = useState(initial.maxBarbers);
  const [maxBranches, setMaxBranches] = useState(initial.maxBranches);
  const [messageApi, ctx]           = message.useMessage();

  const isSystem = SYSTEM_PLANS.includes(initial.slug);
  const tagColor = SYSTEM_COLORS[initial.slug] ?? "cyan";

  function toggleModule(key: keyof BarberModules) {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/panel/barber/plans/${initial.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules, maxBarbers, maxBranches }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: { message?: string } | string };
        messageApi.error(typeof data?.error === "string" ? data.error : data?.error?.message ?? "Error al guardar");
        return;
      }
      messageApi.success(`Plan "${initial.displayName}" actualizado`);
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/panel/barber/plans/${initial.slug}`, { method: "DELETE" });
      const data = await res.json() as { error?: { message?: string } | string };
      if (!res.ok) {
        messageApi.error(typeof data?.error === "string" ? data.error : data?.error?.message ?? "No se pudo eliminar");
        return;
      }
      messageApi.success(`Plan "${initial.displayName}" eliminado`);
      onDeleted(initial.slug);
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }

  const enabledCount = MODULE_KEYS.filter((k) => modules[k]).length;

  return (
    <>
      {ctx}
      <Card
        className="surface-card border-0"
        styles={{ body: { padding: "1.1rem 1.2rem" } }}
        title={
          <Space>
            <Tag color={tagColor} style={{ fontSize: 12, fontWeight: 700 }}>
              {initial.slug.toUpperCase()}
            </Tag>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{initial.displayName}</span>
            {isSystem && <Tag style={{ fontSize: 11 }}>Sistema</Tag>}
            {initial.description && (
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                — {initial.description}
              </Text>
            )}
          </Space>
        }
        extra={
          <Space>
            {!isSystem && (
              <Popconfirm
                title="¿Eliminar este plan?"
                description="Los tenants asignados perderán su plan custom."
                onConfirm={handleDelete}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true, loading: deleting }}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleting}
                >
                  Eliminar
                </Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              style={{
                background: "hsl(var(--section-barber))",
                borderColor: "hsl(var(--section-barber))",
              }}
            >
              Guardar
            </Button>
          </Space>
        }
      >
        <Space size={32} style={{ marginBottom: 16 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Máx. barberos
            </Text>
            <InputNumber
              min={1} max={9999} value={maxBarbers}
              onChange={(v) => setMaxBarbers(v ?? 1)}
              style={{ width: 90 }} size="small"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Máx. sucursales
            </Text>
            <InputNumber
              min={1} max={99} value={maxBranches}
              onChange={(v) => setMaxBranches(v ?? 1)}
              style={{ width: 90 }} size="small"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Módulos activos
            </Text>
            <Text strong style={{ fontSize: 13 }}>
              {enabledCount} / {MODULE_KEYS.length}
            </Text>
          </div>
        </Space>

        <Divider style={{ margin: "0 0 12px" }} />

        <Row gutter={[8, 8]}>
          {MODULE_KEYS.map((key) => (
            <Col key={key} xs={24} sm={12} md={8}>
              <Checkbox
                checked={modules[key]}
                onChange={() => toggleModule(key)}
                style={{ fontSize: 13 }}
              >
                {MODULE_LABELS[key]}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Card>
    </>
  );
}

// ─── CreatePlanModal ──────────────────────────────────────────────────────────

interface CreatePlanModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (plan: BarberPlanConfigItem) => void;
}

function CreatePlanModal({ open, onClose, onCreated }: CreatePlanModalProps) {
  const [form]          = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<BarberModules>({ ...DEFAULT_MODULES });
  const [messageApi, ctx] = message.useMessage();

  function toggleModule(key: keyof BarberModules) {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleOk() {
    let values: { name: string; slug: string; description?: string; maxBarbers: number; maxBranches: number };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/panel/barber/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug:        values.slug,
          displayName: values.name,
          description: values.description,
          maxBarbers:  values.maxBarbers,
          maxBranches: values.maxBranches,
          modules,
          active: true,
        }),
      });

      const data = await res.json() as { data?: BarberPlanConfigItem; error?: string };

      if (!res.ok) {
        messageApi.error(data?.error ?? "Error al crear el plan");
        return;
      }

      messageApi.success(`Plan "${values.name}" creado`);
      form.resetFields();
      setModules({ ...DEFAULT_MODULES });
      onCreated(data.data!);
      onClose();
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    form.resetFields();
    setModules({ ...DEFAULT_MODULES });
    onClose();
  }

  const enabledCount = MODULE_KEYS.filter((k) => modules[k]).length;

  return (
    <>
      {ctx}
      <Modal
        title="Crear nuevo plan"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Crear plan"
        cancelText="Cancelar"
        confirmLoading={saving}
        width={700}
      >
        <Form form={form} layout="vertical" initialValues={{ maxBarbers: 5, maxBranches: 1 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre del plan"
                rules={[{ required: true, message: "Ingresa el nombre" }]}
              >
                <Input placeholder="Ej: Premium, Starter, VIP…" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="slug"
                label="Slug (identificador único)"
                rules={[
                  { required: true, message: "Ingresa el slug" },
                  { pattern: /^[a-z0-9-]+$/, message: "Solo letras minúsculas, números y guiones" },
                ]}
              >
                <Input placeholder="Ej: premium, starter-v2…" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Descripción (opcional)">
            <Input placeholder="Breve descripción del plan" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="maxBarbers" label="Máx. barberos">
                <InputNumber min={1} max={9999} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxBranches" label="Máx. sucursales">
                <InputNumber min={1} max={99} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "4px 0 12px" }}>
            Módulos incluidos — {enabledCount} / {MODULE_KEYS.length} seleccionados
          </Divider>

          <Row gutter={[8, 8]}>
            {MODULE_KEYS.map((key) => (
              <Col key={key} xs={24} sm={12} md={8}>
                <Checkbox
                  checked={modules[key]}
                  onChange={() => toggleModule(key)}
                  style={{ fontSize: 13 }}
                >
                  {MODULE_LABELS[key]}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>
    </>
  );
}

// ─── PlanConfigList ───────────────────────────────────────────────────────────

export function PlanConfigList({ initialPlans }: { initialPlans: BarberPlanConfigItem[] }) {
  const [plans, setPlans]   = useState<BarberPlanConfigItem[]>(initialPlans);
  const [showCreate, setShowCreate] = useState(false);

  const systemOrder = ["trial", "basic", "pro", "enterprise"];
  const sorted = [...plans].sort((a, b) => {
    const ai = systemOrder.indexOf(a.slug);
    const bi = systemOrder.indexOf(b.slug);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  function handleCreated(plan: BarberPlanConfigItem) {
    setPlans((prev) => [...prev, plan]);
  }

  function handleDeleted(slug: string) {
    setPlans((prev) => prev.filter((p) => p.slug !== slug));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, color: "hsl(var(--text-secondary))", fontWeight: 600 }}>
          Planes disponibles ({plans.length})
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreate(true)}
          style={{
            background: "hsl(var(--section-barber))",
            borderColor: "hsl(var(--section-barber))",
          }}
        >
          Crear plan
        </Button>
      </div>

      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {sorted.map((plan) => (
          <PlanCard key={plan.slug} config={plan} onDeleted={handleDeleted} />
        ))}
      </Space>

      <CreatePlanModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
