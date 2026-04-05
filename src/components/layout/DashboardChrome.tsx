"use client";

import { useState } from "react";
import { Avatar, Button, Layout, Space, Tag, Typography } from "antd";
import { Menu as MenuIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ControlSidebar } from "@/components/layout/ControlSidebar";
import { useAuth } from "@/context/AuthContext";

const { Header, Content } = Layout;
type SectionMeta = {
  matcher: (pathname: string) => boolean;
  label: string;
  accent: string;
};

const SECTION_META: SectionMeta[] = [
  {
    matcher: (p) => p.startsWith("/dte"),
    label: "DTE",
    accent: "--section-dte",
  },
  {
    matcher: (p) => p.startsWith("/barber"),
    label: "Barber Pro",
    accent: "--section-barber",
  },
  {
    matcher: (p) => p.startsWith("/erp"),
    label: "ERP Full Pro",
    accent: "--section-erp",
  },
  {
    matcher: () => true,
    label: "Vista global",
    accent: "--section-overview",
  },
];

function getInitials(name?: string | null) {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

export function DashboardChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const active =
    SECTION_META.find((item) => item.matcher(pathname)) ?? SECTION_META[SECTION_META.length - 1];
  const onOverview = pathname === "/overview";
  const sessionLabel = session?.username ?? "Superadmin";
  const sessionInitial = getInitials(session?.username);

  return (
    <Layout className="control-dashboard" hasSider style={{ minHeight: "100vh", background: "transparent" }}>
      <ControlSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Layout style={{ background: "transparent", minWidth: 0 }}>
        <Header
          className="control-dashboard__topbar"
          style={{
            height: "auto",
            lineHeight: 1,
            padding: "0 18px",
            background: "transparent",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            className="control-dashboard__topbar-inner"
            style={{
              minHeight: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Space size={8} wrap>
              {/* Hamburger — visible only on mobile via CSS */}
              <Button
                type="text"
                size="small"
                className="control-dashboard__hamburger"
                icon={<MenuIcon size={18} />}
                onClick={() => setMobileOpen(true)}
                style={{ color: "hsl(var(--text-secondary))" }}
              />
              <Tag
                bordered={false}
                className="control-dashboard__section"
                style={{
                  margin: 0,
                  background: `hsl(var(${active.accent}) / 0.12)`,
                  color: `hsl(var(${active.accent}))`,
                  borderRadius: 999,
                  paddingInline: 11,
                  fontWeight: 700,
                  fontSize: 11,
                  lineHeight: "22px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {active.label}
              </Tag>
            </Space>

            <Space className="control-dashboard__meta" size={8} wrap>
              {!onOverview && (
                <Button size="small" type="default" onClick={() => router.push("/overview")}>
                  Overview
                </Button>
              )}

              <Tag
                bordered={false}
                style={{
                  margin: 0,
                  background: "hsl(var(--status-success-bg))",
                  color: "hsl(var(--status-success))",
                  borderRadius: 999,
                  paddingInline: 10,
                  fontWeight: 700,
                  fontSize: 11,
                  lineHeight: "22px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Operativo
              </Tag>

              <div
                className="control-dashboard__user"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px 4px 4px",
                  borderRadius: 999,
                  border: "1px solid hsl(var(--border-default))",
                  background: "hsl(var(--bg-surface))",
                }}
              >
                <Avatar
                  size={28}
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary-dark)) 100%)",
                    color: "hsl(var(--text-inverse))",
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  {sessionInitial}
                </Avatar>
                <div className="control-dashboard__user-meta">
                  <div
                    style={{
                      color: "hsl(var(--text-primary))",
                      fontSize: 11.5,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {sessionLabel}
                  </div>
                </div>
              </div>
            </Space>
          </div>
        </Header>

        <Content className="control-dashboard__content" style={{ padding: "18px 18px 28px" }}>
          <div className="control-dashboard__frame">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
