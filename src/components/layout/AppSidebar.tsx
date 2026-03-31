"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Layout, Menu, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Scissors,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const { Sider } = Layout;

type NavGroup = {
  key: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
  colorVar: string;
  items?: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
  }>;
};

const NAV: NavGroup[] = [
  {
    key: "overview",
    label: "Vista Global",
    href: "/overview",
    icon: <LayoutDashboard size={16} />,
    colorVar: "--section-overview",
  },
  {
    key: "dte",
    label: "DTE",
    icon: <FileText size={16} />,
    colorVar: "--section-dte",
    items: [
      { key: "/dte/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
      { key: "/dte/clientes", label: "Clientes", icon: <Users size={14} /> },
      { key: "/dte/planes", label: "Planes", icon: <CreditCard size={14} /> },
      { key: "/dte/health", label: "Health", icon: <Activity size={14} /> },
    ],
  },
  {
    key: "barber",
    label: "Barber Pro",
    icon: <Scissors size={16} />,
    colorVar: "--section-barber",
    items: [
      { key: "/barber/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
      { key: "/barber/tenants", label: "Barberias", icon: <Store size={14} /> },
      { key: "/barber/health", label: "Health", icon: <Activity size={14} /> },
    ],
  },
  {
    key: "erp",
    label: "ERP Full Pro",
    icon: <Building2 size={16} />,
    colorVar: "--section-erp",
    items: [
      { key: "/erp/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
      { key: "/erp/tenants", label: "Tenants", icon: <Building2 size={14} /> },
      { key: "/erp/health", label: "Health", icon: <ShieldCheck size={14} /> },
    ],
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = NAV.flatMap((group) => group.items ?? [{ key: group.href ?? "", label: "", icon: null }])
    .find((item) => item.key && pathname.startsWith(item.key))?.key ?? pathname;

  const openKey =
    NAV.find((group) => pathname === group.href || pathname.startsWith(`/${group.key}`))?.key ?? "overview";

  const items: MenuProps["items"] = NAV.map((group) => {
    const groupLabel = (
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
        <span style={{ color: `hsl(var(${group.colorVar}))` }}>{group.icon}</span>
        {group.label}
      </span>
    );

    if (!group.items?.length && group.href) {
      return {
        key: group.href,
        icon: group.icon,
        label: group.label,
      };
    }

    return {
      key: group.key,
      label: groupLabel,
      children: group.items?.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      })),
    };
  });

  return (
    <Sider
      width={248}
      collapsedWidth={68}
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
        borderRight: "1px solid hsl(var(--border-default) / 0.1)",
      }}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            {!collapsed && (
              <div>
                <p
                  className="m-0 font-bold uppercase tracking-[0.22em]"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "hsl(var(--text-inverse))",
                  }}
                >
                  Speeddan
                </p>
                <p className="m-0 text-xs text-white/55">Control v3</p>
              </div>
            )}
            <Tooltip title={collapsed ? "Expandir" : "Colapsar"} placement="right">
              <Button
                type="text"
                size="small"
                icon={collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                onClick={() => setCollapsed((value) => !value)}
                className="text-white/70"
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <Menu
            mode="inline"
            theme="dark"
            items={items}
            selectedKeys={[selectedKey]}
            defaultOpenKeys={[openKey]}
            onClick={({ key }) => {
              if (typeof key === "string" && key.startsWith("/")) {
                router.push(key);
              }
            }}
            style={{ background: "transparent", border: "none" }}
          />
        </div>

        <div className="border-t border-white/10 p-3">
          <Button
            type="text"
            block
            icon={<LogOut size={15} />}
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="justify-start text-white/75 hover:!bg-white/10 hover:!text-white"
          >
            {!collapsed && "Cerrar sesion"}
          </Button>
        </div>
      </div>
    </Sider>
  );
}
