"use client";

import { useState } from "react";
import { Avatar, Button, Layout, Space, Tag } from "antd";
import { Menu as MenuIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ControlSidebar } from "@/components/layout/ControlSidebar";
import { useAuth } from "@/context/AuthContext";

const { Header, Content } = Layout;

type SectionMeta = {
  matcher: (pathname: string) => boolean;
  label:   string;
  accent:  string;
};

const SECTION_META: SectionMeta[] = [
  { matcher: (p) => p.startsWith("/dte"),    label: "DTE Sistema",  accent: "--section-dte"      },
  { matcher: (p) => p.startsWith("/barber"), label: "Barber Pro",   accent: "--section-barber"   },
  { matcher: (p) => p.startsWith("/erp"),    label: "ERP Full Pro", accent: "--section-erp"      },
  { matcher: () => true,                     label: "Vista global", accent: "--section-overview" },
];

function getInitials(name?: string | null) {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function DashboardChrome({ children }: { children: ReactNode }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const { session } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const active         = SECTION_META.find((s) => s.matcher(pathname)) ?? SECTION_META[SECTION_META.length - 1];
  const onOverview     = pathname === "/overview";
  const sessionLabel   = session?.username ?? "admin";
  const sessionInitial = getInitials(session?.username);

  // Gradiente violeta igual al login — aplicado al Layout para no ser tapado por body::before
  const dashboardBg = [
    "radial-gradient(ellipse 90% 50% at 12% 0%, hsl(262 100% 93%) 0%, transparent 55%)",
    "radial-gradient(ellipse 60% 35% at 88% 100%, hsl(262 80% 90%) 0%, transparent 50%)",
    "hsl(258 55% 91%)",
  ].join(", ");

  return (
    <Layout
      className="control-dashboard"
      hasSider
      style={{ minHeight: "100vh", background: dashboardBg }}
    >
      <ControlSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Layout style={{ background: "transparent", minWidth: 0 }}>

        {/* ── Topbar ── */}
        <Header
          style={{
            height: "auto",
            lineHeight: 1,
            padding: "0 16px",
            background: "hsl(var(--bg-surface))",
            borderBottom: "1px solid hsl(var(--border-default))",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              minHeight: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {/* Left: hamburger + section badge */}
            <Space size={8} align="center">
              <Button
                type="text"
                size="small"
                className="control-dashboard__hamburger"
                icon={<MenuIcon size={16} />}
                onClick={() => setMobileOpen(true)}
                style={{ color: "hsl(var(--text-muted))" }}
              />
              <Tag
                bordered={false}
                style={{
                  margin: 0,
                  background: `hsl(var(${active.accent}) / 0.1)`,
                  color: `hsl(var(${active.accent}))`,
                  borderRadius: 6,
                  paddingInline: 10,
                  fontWeight: 700,
                  fontSize: 11,
                  lineHeight: "22px",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                {active.label}
              </Tag>
            </Space>

            {/* Right: overview link + status + user chip */}
            <Space size={8} align="center">
              {!onOverview && (
                <Button
                  size="small"
                  type="text"
                  onClick={() => router.push("/overview")}
                  style={{ color: "hsl(var(--text-muted))", fontSize: 12 }}
                >
                  Overview
                </Button>
              )}

              <Tag
                bordered={false}
                style={{
                  margin: 0,
                  background: "hsl(var(--status-success-bg))",
                  color: "hsl(var(--status-success))",
                  borderRadius: 6,
                  paddingInline: 10,
                  fontWeight: 700,
                  fontSize: 11,
                  lineHeight: "22px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Operativo
              </Tag>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "3px 10px 3px 4px",
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border-default))",
                  background: "hsl(var(--bg-surface))",
                }}
              >
                <Avatar
                  size={26}
                  style={{
                    background: "hsl(var(--accent))",
                    color: "hsl(var(--text-inverse))",
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  {sessionInitial}
                </Avatar>
                <span
                  style={{
                    color: "hsl(var(--text-primary))",
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {sessionLabel}
                </span>
              </div>
            </Space>
          </div>
        </Header>

        {/* ── Content ── */}
        <Content style={{ padding: "20px 20px 32px" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
