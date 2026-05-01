"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Alert, Button, Card, Col, Descriptions, Drawer, Form, Input,
  Modal, Row, Select, Space, Tag, Typography, message,
} from "antd";
import {
  UserOutlined, KeyOutlined, PlusOutlined, CopyOutlined,
  CheckCircleOutlined, LockOutlined, TeamOutlined, ReloadOutlined,
} from "@ant-design/icons";
import type {
  BarberTeamUser, BarberTeamRole, BarberBranchItem,
} from "@/lib/integrations/barber";

const { Text, Title } = Typography;

// ── Constantes ────────────────────────────────────────────────────────────────

const ROLE_META: Record<BarberTeamRole, {
  label: string; color: string; description: string; icon: React.ReactNode;
}> = {
  SUPERADMIN: {
    label:       "Administrador",
    color:       "purple",
    description: "Acceso total al ERP. Gestiona usuarios, módulos y configuración.",
    icon:        <LockOutlined />,
  },
  GERENTE: {
    label:       "Gerente",
    color:       "blue",
    description: "Acceso a todos los módulos operativos de su sucursal asignada.",
    icon:        <TeamOutlined />,
  },
  USERS: {
    label:       "Usuario",
    color:       "default",
    description: "Acceso limitado. El Administrador le asigna módulos desde el ERP.",
    icon:        <UserOutlined />,
  },
};

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Tarjeta de un rol ─────────────────────────────────────────────────────────

interface RoleCardProps {
  role:       BarberTeamRole;
  user:       BarberTeamUser | null;
  tenantId:   number;
  branches:   BarberBranchItem[];
  onCreated:  (user: BarberTeamUser, password: string) => void;
}

function RoleCard({ role, user, tenantId, branches, onCreated }: RoleCardProps) {
  const meta               = ROLE_META[role];
  const [open, setOpen]    = useState(false);
  const [saving, setSaving] = useState(false);
  const [form]             = Form.useForm();
  const [messageApi, ctx]  = message.useMessage();

  async function handleSubmit(values: {
    fullName: string; email: string; password: string; branchId?: number;
  }) {
    setSaving(true);
    try {
      const res = await fetch(`/api/panel/barber/tenants/${tenantId}/users`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role, ...values }),
      });
      const data = await res.json() as { data?: BarberTeamUser; error?: { message?: string } | string };
      if (!res.ok) {
        const errMsg =
          typeof data.error === "string"
            ? data.error
            : (data.error as { message?: string } | undefined)?.message ?? "Error al crear el usuario";
        messageApi.error(errMsg);
        return;
      }
      onCreated(data.data!, values.password);
      setOpen(false);
      form.resetFields();
    } catch {
      messageApi.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  const needsBranch = role === "GERENTE";

  return (
    <>
      {ctx}
      <Card
        size="small"
        className="surface-card border-0"
        styles={{ body: { padding: "1rem 1.1rem" } }}
        title={
          <Space size={8}>
            <Tag color={meta.color} style={{ fontWeight: 700, fontSize: 12 }}>
              {meta.label}
            </Tag>
            {user && (
              <Tag
                icon={<CheckCircleOutlined />}
                color="success"
                style={{ fontSize: 11 }}
              >
                Creado
              </Tag>
            )}
          </Space>
        }
        extra={
          !user && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
              style={{
                background:   "hsl(var(--section-barber))",
                borderColor:  "hsl(var(--section-barber))",
              }}
            >
              Crear
            </Button>
          )
        }
      >
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: user ? 12 : 0 }}>
          {meta.description}
        </Text>

        {user && (
          <Descriptions bordered size="small" column={1} style={{ marginTop: 8 }}>
            <Descriptions.Item label="Nombre">{user.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space size={6}>
                <span style={{ fontWeight: 600 }}>{user.email}</span>
                <Button
                  type="link"
                  size="small"
                  icon={<CopyOutlined />}
                  style={{ padding: 0 }}
                  onClick={() => {
                    navigator.clipboard.writeText(user.email);
                    messageApi.success("Email copiado");
                  }}
                />
              </Space>
            </Descriptions.Item>
            {user.branch && (
              <Descriptions.Item label="Sucursal">
                <Space size={4}>
                  {user.branch.name}
                  {user.branch.isHeadquarters && (
                    <Tag style={{ fontSize: 10 }}>Casa Matriz</Tag>
                  )}
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Estado">
              <Tag color={user.active ? "success" : "error"}>
                {user.active ? "Activo" : "Inactivo"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {/* Drawer de creación */}
      <Drawer
        title={`Crear ${meta.label}`}
        width={440}
        open={open}
        onClose={() => { setOpen(false); form.resetFields(); }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => { setOpen(false); form.resetFields(); }}>
              Cancelar
            </Button>
            <Button
              type="primary"
              loading={saving}
              onClick={() => form.submit()}
              style={{
                background:  "hsl(var(--section-barber))",
                borderColor: "hsl(var(--section-barber))",
              }}
            >
              Crear {meta.label}
            </Button>
          </div>
        }
      >
        <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 20 }}>
          {meta.description}
        </Text>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="fullName"
            label="Nombre completo"
            rules={[{ required: true, message: "El nombre es requerido" }]}
          >
            <Input placeholder="Ej: María González" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email / Usuario"
            rules={[
              { required: true, message: "El email es requerido" },
              { min: 3, message: "Mínimo 3 caracteres" },
            ]}
          >
            <Input placeholder="usuario@barberia.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña inicial"
            rules={[
              { required: true, message: "La contraseña es requerida" },
              { min: 8, message: "Mínimo 8 caracteres" },
            ]}
          >
            <Input.Password
              placeholder="Mínimo 8 caracteres"
              addonAfter={
                <Button
                  type="link"
                  size="small"
                  icon={<KeyOutlined />}
                  style={{ padding: 0, height: "auto" }}
                  onClick={() => form.setFieldValue("password", generatePassword())}
                >
                  Generar
                </Button>
              }
            />
          </Form.Item>

          {needsBranch && (
            <Form.Item
              name="branchId"
              label="Sucursal asignada"
              rules={[{ required: true, message: "Selecciona una sucursal" }]}
            >
              <Select placeholder="Seleccionar sucursal">
                {branches.map(b => (
                  <Select.Option key={b.id} value={b.id}>
                    {b.name}
                    {b.isHeadquarters ? " (Casa Matriz)" : ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {role === "USERS" && (
            <div style={{
              background:   "hsl(var(--bg-subtle, 220 13% 96%))",
              border:       "1px solid hsl(var(--border-default))",
              borderRadius: 8,
              padding:      "10px 14px",
              fontSize:     12,
              color:        "hsl(var(--text-muted))",
            }}>
              Los módulos se asignan desde el ERP por el Administrador después de la creación.
            </div>
          )}
        </Form>
      </Drawer>
    </>
  );
}

// ── Credenciales modal (aparece al crear cualquier usuario) ───────────────────

interface CreatedCredential {
  role:     BarberTeamRole;
  fullName: string;
  email:    string;
  password: string;
}

function CredentialsModal({
  cred,
  onClose,
}: {
  cred:    CreatedCredential | null;
  onClose: () => void;
}) {
  const [messageApi, ctx] = message.useMessage();
  if (!cred) return null;

  const meta = ROLE_META[cred.role];

  function copyAll() {
    if (!cred) return;
    const text = `Rol: ${meta.label}\nEmail: ${cred.email}\nContraseña: ${cred.password}`;
    navigator.clipboard.writeText(text);
    messageApi.success("Credenciales copiadas");
  }

  return (
    <>
      {ctx}
      <Modal
        open={!!cred}
        title={`${meta.label} creado exitosamente`}
        onCancel={onClose}
        footer={<Button type="primary" onClick={onClose}>Listo</Button>}
      >
        <div style={{ marginTop: 8 }}>
          <div style={{
            background:   "hsl(172 78% 28% / 0.08)",
            border:       "1px solid hsl(172 78% 28% / 0.30)",
            borderRadius: 8,
            padding:      "14px 18px",
            marginBottom: 12,
          }}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Rol
            </Text>
            <div>
              <Tag color={meta.color} style={{ fontWeight: 700, marginTop: 4 }}>{meta.label}</Tag>
            </div>
          </div>

          <div style={{
            background:   "hsl(var(--bg-subtle, 220 13% 96%))",
            border:       "1px solid hsl(var(--border-default))",
            borderRadius: 8,
            padding:      "16px 18px",
            marginBottom: 12,
            display:      "grid",
            gap:          10,
          }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Nombre
              </Text>
              <div><Text strong>{cred.fullName}</Text></div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Email / Usuario
              </Text>
              <div><Text strong>{cred.email}</Text></div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Contraseña
              </Text>
              <div><Text strong code>{cred.password}</Text></div>
            </div>
          </div>

          <Button block icon={<CopyOutlined />} onClick={copyAll}>
            Copiar credenciales
          </Button>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Text type="warning" style={{ fontSize: 12 }}>
              Guarda estas credenciales — la contraseña no se mostrará de nuevo
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  tenantId:  number;
  owner:     { id: number; fullName: string; email: string; role: string; createdAt: string } | null;
  team:      BarberTeamUser[];
  teamError: boolean;
  branches:  BarberBranchItem[];
}

export function BarberTenantTeam({ tenantId, owner, team: initialTeam, teamError: initialTeamError, branches: initialBranches }: Props) {
  const [team, setTeam]               = useState<BarberTeamUser[]>(initialTeam);
  const [branches, setBranches]       = useState<BarberBranchItem[]>(initialBranches);
  const [teamError, setTeamError]     = useState(initialTeamError);
  const [teamErrorMsg, setTeamErrorMsg] = useState<string | null>(null);
  const [reloading, setReloading]     = useState(false);
  const [cred, setCred]               = useState<CreatedCredential | null>(null);
  const [messageApi, ctx]             = message.useMessage();

  // Si el SSR falló al cargar el equipo, reintentarlo desde el cliente
  useEffect(() => {
    if (!initialTeamError) return;
    void reloadTeam();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reloadTeam() {
    setReloading(true);
    try {
      const [teamRes, branchRes] = await Promise.all([
        fetch(`/api/panel/barber/tenants/${tenantId}/users`),
        fetch(`/api/panel/barber/tenants/${tenantId}/branches`),
      ]);

      if (teamRes.ok) {
        const data = await teamRes.json() as { data?: BarberTeamUser[] };
        if (Array.isArray(data.data)) {
          setTeam(data.data);
          setTeamError(false);
          setTeamErrorMsg(null);
        }
      } else {
        const errData = await teamRes.json().catch(() => ({})) as { error?: { message?: string } | string };
        const msg =
          typeof errData.error === "string"
            ? errData.error
            : (errData.error as { message?: string } | undefined)?.message
              ?? `Error ${teamRes.status} al cargar equipo`;
        setTeamErrorMsg(msg);
        setTeamError(true);
      }

      if (branchRes.ok) {
        const data = await branchRes.json() as { data?: BarberBranchItem[] };
        if (Array.isArray(data.data)) setBranches(data.data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de conexión";
      setTeamErrorMsg(msg);
      setTeamError(true);
    } finally {
      setReloading(false);
    }
  }

  const superadmin = team.find(u => u.role === "SUPERADMIN") ?? null;
  const gerente    = team.find(u => u.role === "GERENTE")    ?? null;
  const usuario    = team.find(u => u.role === "USERS")      ?? null;

  const handleCreated = useCallback((user: BarberTeamUser, password: string) => {
    setTeam(prev => [...prev, user]);
    setCred({ role: user.role as BarberTeamRole, fullName: user.fullName, email: user.email, password });
    messageApi.success(`${ROLE_META[user.role as BarberTeamRole].label} creado correctamente`);
  }, [messageApi]);

  return (
    <>
      {ctx}

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: teamError ? 10 : 14, flexWrap: "wrap" }}>
          <TeamOutlined style={{ color: "hsl(var(--section-barber))", fontSize: 16 }} />
          <Title level={5} style={{ margin: 0, color: "hsl(var(--text-secondary))" }}>
            Equipo del sistema
          </Title>
          <Tag style={{ fontSize: 11 }}>4 roles</Tag>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={reloading}
            onClick={reloadTeam}
            style={{ marginLeft: "auto", fontSize: 11 }}
          >
            Recargar equipo
          </Button>
        </div>

        {teamError && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="No se pudo cargar el equipo desde el servidor"
            description={
              teamErrorMsg
                ? `Error: ${teamErrorMsg}`
                : "Los usuarios ya creados podrían no verse. Haz clic en 'Recargar equipo' para intentar de nuevo."
            }
          />
        )}

        <Row gutter={[12, 12]}>
          {/* OWNER — solo lectura, ya existe al crear el tenant */}
          <Col xs={24} md={12}>
            <Card
              size="small"
              className="surface-card border-0"
              styles={{ body: { padding: "1rem 1.1rem" } }}
              title={
                <Space size={8}>
                  <Tag color="gold" style={{ fontWeight: 700, fontSize: 12 }}>Propietario</Tag>
                  {owner && (
                    <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 11 }}>
                      Creado
                    </Tag>
                  )}
                </Space>
              }
            >
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: owner ? 12 : 0 }}>
                Vista ejecutiva — solo dashboard y métricas. Se crea junto con el tenant.
              </Text>
              {owner ? (
                <Descriptions bordered size="small" column={1} style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Nombre">{owner.fullName}</Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Text strong>{owner.email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Rol">
                    <Tag color="gold">Propietario</Tag>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>Sin propietario registrado.</Text>
              )}
            </Card>
          </Col>

          {/* SUPERADMIN */}
          <Col xs={24} md={12}>
            <RoleCard
              role="SUPERADMIN"
              user={superadmin}
              tenantId={tenantId}
              branches={branches}
              onCreated={handleCreated}
            />
          </Col>

          {/* GERENTE */}
          <Col xs={24} md={12}>
            <RoleCard
              role="GERENTE"
              user={gerente}
              tenantId={tenantId}
              branches={branches}
              onCreated={handleCreated}
            />
          </Col>

          {/* USERS */}
          <Col xs={24} md={12}>
            <RoleCard
              role="USERS"
              user={usuario}
              tenantId={tenantId}
              branches={branches}
              onCreated={handleCreated}
            />
          </Col>
        </Row>
      </div>

      <CredentialsModal cred={cred} onClose={() => setCred(null)} />
    </>
  );
}
