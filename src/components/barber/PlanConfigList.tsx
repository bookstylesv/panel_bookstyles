"use client";

import { useState } from "react";
import {
  Button, Card, Checkbox, Col, Divider, InputNumber,
  Row, Space, Tag, Typography, message,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { BarberPlan, BarberPlanConfigItem, BarberModules } from "@/lib/integrations/barber";

const { Text, Title } = Typography;

const PLAN_COLORS: Record<BarberPlan, string> = {
  TRIAL:      "default",
  BASIC:      "blue",
  PRO:        "purple",
  ENTERPRISE: "gold",
};

const MODULE_LABELS: Record<keyof BarberModules, string> = {
  appointments:        "Citas / Agenda",
  pos:                 "POS / Ventas",
  clients:             "Clientes",
  products:            "Productos / Inventario",
  expenses:            "Gastos",
  reports_basic:       "Reportes básicos",
  accounts_receivable: "Cuentas por cobrar (CxC)",
  payroll:             "Planilla (ISSS/AFP)",
  billing_dte:         "Facturación DTE",
  reports_advanced:    "Reportes avanzados",
  branches:            "Sucursales",
  loyalty:             "Fidelización",
  api_integrations:    "API / Integraciones",
};

const MODULE_KEYS = Object.keys(MODULE_LABELS) as (keyof BarberModules)[];

// ─────────────────────────────────────────────────────────────────────────────

interface PlanCardProps {
  config: BarberPlanConfigItem;
}

function PlanCard({ config: initial }: PlanCardProps) {
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<BarberModules>({ ...initial.modules });
  const [maxBarbers, setMaxBarbers] = useState(initial.maxBarbers);
  const [maxBranches, setMaxBranches] = useState(initial.maxBranches);
  const [messageApi, ctx] = message.useMessage();

  function toggleModule(key: keyof BarberModules) {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/panel/barber/plans/${initial.plan}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules, maxBarbers, maxBranches }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: { message?: string } };
        messageApi.error(data?.error?.message ?? "Error al guardar");
        return;
      }

      messageApi.success(`Plan ${initial.displayName} actualizado`);
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setSaving(false);
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
            <Tag color={PLAN_COLORS[initial.plan]} style={{ fontSize: 12, fontWeight: 700 }}>
              {initial.plan}
            </Tag>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{initial.displayName}</span>
            {initial.description && (
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                — {initial.description}
              </Text>
            )}
          </Space>
        }
        extra={
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
        }
      >
        {/* Límites numéricos */}
        <Space size={32} style={{ marginBottom: 16 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Máx. barberos
            </Text>
            <InputNumber
              min={1}
              max={9999}
              value={maxBarbers}
              onChange={(v) => setMaxBarbers(v ?? 1)}
              style={{ width: 90 }}
              size="small"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Máx. sucursales
            </Text>
            <InputNumber
              min={1}
              max={99}
              value={maxBranches}
              onChange={(v) => setMaxBranches(v ?? 1)}
              style={{ width: 90 }}
              size="small"
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

        {/* Módulos */}
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

// ─────────────────────────────────────────────────────────────────────────────

export function PlanConfigList({ initialPlans }: { initialPlans: BarberPlanConfigItem[] }) {
  const order: BarberPlan[] = ["TRIAL", "BASIC", "PRO", "ENTERPRISE"];
  const sorted = [...initialPlans].sort(
    (a, b) => order.indexOf(a.plan) - order.indexOf(b.plan),
  );

  return (
    <div>
      <Title level={5} style={{ marginBottom: 12, color: "hsl(var(--text-secondary))", fontWeight: 600 }}>
        Planes disponibles ({sorted.length})
      </Title>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {sorted.map((plan) => (
          <PlanCard key={plan.plan} config={plan} />
        ))}
      </Space>
    </div>
  );
}
