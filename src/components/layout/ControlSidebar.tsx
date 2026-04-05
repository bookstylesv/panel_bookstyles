"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Divider, Drawer, Layout, Menu, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Scissors,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const { Sider } = Layout;
const { Text } = Typography;

const MENU_ITEMS: MenuProps["items"] = [
  {
    key: "/overview",
    label: "Vista global",
    icon: <LayoutDashboard size={16} />,
  },
  { type: "divider" },
  {
    key: "dte",
    label: "DTE Sistema",
    icon: <FileText size={16} />,
    children: [
      { key: "/dte/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
      { key: "/dte/clientes", label: "Clientes", icon: <Users size={14} /> },
      { key: "/dte/planes", label: "Planes", icon: <CreditCard size={14} /> },
      { key: "/dte/health", label: "Health", icon: <Activity size={14} /> },
      { key: "/dte/auditoria", label: "Auditoria", icon: <ShieldCheck size={14} /> },
      { key: "/dte/analytics", label: "Analytics", icon: <BarChart3 size={14} /> },
      { key: "/dte/mapa", label: "Mapa", icon: <MapPinned size={14} /> },
      { key: "/dte/backups", label: "Backups", icon: <Database size={14} /> },
      { key: "/dte/departamentos", label: "Departamentos", icon: <Building2 size={14} /> },
      { key: "/dte/municipios", label: "Municipios", icon: <Building2 size={14} /> },
      { key: "/dte/tema", label: "Tema", icon: <ShieldCheck size={14} /> },
    ],
  },
  {
    key: "barber",
    label: "Barber Pro",
    icon: <Scissors size={16} />,
    children: [
      { key: "/barber/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
      { key: "/barber/tenants", label: "Barberias", icon: <Store size={14} /> },
      { key: "/barber/health", label: "Health", icon: <Activity size={14} /> },
      { key: "/barber/config", label: "Configuracion", icon: <Settings size={14} /> },
    ],
  },
  {
    key: "erp",
    label: "ERP Full Pro",
    icon: <Building2 size={16} />,
    children: [
      { key: "/erp/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
      { key: "/erp/tenants", label: "Tenants", icon: <Building2 size={14} /> },
      { key: "/erp/health", label: "Health", icon: <ShieldCheck size={14} /> },
    ],
  },
];

const ALL_ROUTES = [
  "/dte/dashboard", "/dte/clientes", "/dte/planes", "/dte/health",
  "/dte/auditoria", "/dte/analytics", "/dte/mapa", "/dte/backups",
  "/dte/departamentos", "/dte/municipios", "/dte/tema",
  "/barber/dashboard", "/barber/tenants", "/barber/health", "/barber/config",
  "/erp/dashboard", "/erp/tenants", "/erp/health",
];

function getSelectedKey(pathname: string): string {
  if (pathname === "/overview") return "/overview";
  return ALL_ROUTES.find((r) => pathname.startsWith(r)) ?? "/overview";
}

function getDefaultOpenKeys(pathname: string): string[] {
  if (pathname.startsWith("/dte")) return ["dte"];
  if (pathname.startsWith("/barber")) return ["barber"];
  if (pathname.startsWith("/erp")) return ["erp"];
  return [];
}

function getInitials(name?: string | null) {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

function useBreakpoint() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const tabletQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");

    const update = () => {
      setIsMobile(mobileQuery.matches);
      setIsTablet(tabletQuery.matches);
    };

    update();
    mobileQuery.addEventListener("change", update);
    tabletQuery.addEventListener("change", update);
    return () => {
      mobileQuery.removeEventListener("change", update);
      tabletQuery.removeEventListener("change", update);
    };
  }, []);

  return { isMobile, isTablet };
}

interface ControlSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({
  collapsed,
  onCollapse,
  onNavigate,
  selectedKey,
  openKeys,
  onOpenChange,
  initials,
  session,
  onLogout,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  onNavigate: (key: string) => void;
  selectedKey: string;
  openKeys: string[];
  onOpenChange: (keys: string[]) => void;
  initials: string;
  session: { username?: string | null } | null;
  onLogout: () => void;
}) {
  return (
    <div className="panel-sider__inner">
      {/* Brand */}
      <div
        style={{
          minHeight: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: collapsed ? "16px 10px" : "16px 16px",
          borderBottom: "1px solid hsl(var(--sidebar-border))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div className="panel-sider__mark">SC</div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <p className="panel-sider__eyebrow">Speeddan Control</p>
              <Text strong style={{ color: "hsl(var(--sidebar-fg))", fontSize: 14, display: "block", lineHeight: 1.15 }}>
                Panel central
              </Text>
              <p className="panel-sider__caption">Superadmin</p>
            </div>
          )}
        </div>
        <Tooltip title={collapsed ? "Expandir menu" : "Colapsar menu"} placement="right">
          <Button
            type="text"
            size="small"
            onClick={onCollapse}
            icon={collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            style={{ color: "hsl(var(--sidebar-muted))", flexShrink: 0 }}
          />
        </Tooltip>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px 10px" }}>
        <Menu
          theme="dark"
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedKey]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={onOpenChange}
          items={MENU_ITEMS}
          onClick={({ key }) => {
            if (typeof key === "string" && key.startsWith("/")) {
              onNavigate(key);
            }
          }}
          style={{ background: "transparent", border: "none" }}
        />
      </div>

      {/* User footer */}
      <div style={{ padding: collapsed ? "8px 10px 14px" : "8px 14px 16px" }}>
        <Divider style={{ margin: "0 0 10px", borderColor: "hsl(var(--sidebar-border))" }} />
        <div className="panel-sider__profile">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar
              size={32}
              style={{
                background: "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary-dark)) 100%)",
                color: "hsl(var(--text-inverse))",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="panel-sider__profile-label" style={{ fontSize: 13 }}>
                  {session?.username ?? "Superadmin"}
                </div>
                <div className="panel-sider__profile-meta">Sesion segura</div>
              </div>
            )}
          </div>
          <Button
            type="text"
            block={!collapsed}
            icon={<LogOut size={14} />}
            onClick={onLogout}
            style={{
              marginTop: 10,
              justifyContent: collapsed ? "center" : "flex-start",
              color: "hsl(var(--sidebar-fg))",
              paddingInline: collapsed ? 0 : 4,
            }}
          >
            {!collapsed ? "Cerrar sesion" : null}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ControlSidebar({ mobileOpen = false, onMobileClose }: ControlSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, session } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(() => getDefaultOpenKeys(pathname));

  // Auto-collapse on tablet
  useEffect(() => {
    if (isTablet) setCollapsed(true);
    else if (!isMobile) setCollapsed(false);
  }, [isTablet, isMobile]);

  const selectedKey = useMemo(() => getSelectedKey(pathname), [pathname]);
  const initials = getInitials(session?.username);

  const handleNavigate = (key: string) => {
    router.push(key);
    onMobileClose?.();
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    onMobileClose?.();
  };

  const contentProps = {
    collapsed: isMobile ? false : collapsed,
    onCollapse: () => setCollapsed((v) => !v),
    onNavigate: handleNavigate,
    selectedKey,
    openKeys,
    onOpenChange: (keys: string[]) => setOpenKeys(keys),
    initials,
    session,
    onLogout: handleLogout,
  };

  // Mobile: Drawer
  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        width={232}
        closable={false}
        styles={{
          body: { padding: 0, background: "hsl(var(--bg-sidebar))" },
          wrapper: { boxShadow: "var(--shadow-xl)" },
        }}
      >
        <SidebarContent {...contentProps} />
      </Drawer>
    );
  }

  // Tablet / Desktop: Sider
  return (
    <Sider
      width={232}
      collapsedWidth={72}
      collapsed={collapsed}
      trigger={null}
      className="panel-sider"
      style={{ height: "100vh", position: "sticky", top: 0, overflow: "hidden" }}
    >
      <SidebarContent {...contentProps} />
    </Sider>
  );
}
