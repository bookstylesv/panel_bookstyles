"use client";

import { Avatar, Button, Layout, Space, Tag, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ControlSidebar } from "@/components/layout/ControlSidebar";
import { useAuth } from "@/context/AuthContext";

const { Header, Content } = Layout;
const { Text } = Typography;

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

  const active =
    SECTION_META.find((item) => item.matcher(pathname)) ?? SECTION_META[SECTION_META.length - 1];
  const onOverview = pathname === "/overview";
  const sessionLabel = session?.username ?? "Superadmin";
  const sessionInitial = getInitials(session?.username);

  return (
    <Layout hasSider style={{ minHeight: "100vh", background: "hsl(var(--bg-page))" }}>
      <ControlSidebar />

      <Layout style={{ background: "transparent" }}>
        <Header
          style={{
            height: "auto",
            lineHeight: 1,
            padding: "0 24px",
            background: "hsl(var(--bg-surface) / 0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid hsl(var(--border-default))",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {/* Left: section tag + path */}
            <Space size={8}>
              <Tag
                bordered={false}
                style={{
                  margin: 0,
                  background: `hsl(var(${active.accent}) / 0.12)`,
                  color: `hsl(var(${active.accent}))`,
                  borderRadius: 999,
                  paddingInline: 10,
                  fontWeight: 700,
                  fontSize: 12,
                  lineHeight: "24px",
                }}
              >
                {active.label}
              </Tag>
              <Text style={{ color: "hsl(var(--text-muted))", fontSize: 12, fontFamily: "monospace" }}>
                {pathname}
              </Text>
            </Space>

            {/* Right: actions + user */}
            <Space size={8}>
              {!onOverview && (
                <Button size="small" type="default" onClick={() => router.push("/overview")}>
                  Ir al overview
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
                  fontSize: 12,
                  lineHeight: "24px",
                }}
              >
                Operativo
              </Tag>

              <div
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
                <div>
                  <div
                    style={{
                      color: "hsl(var(--text-primary))",
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {sessionLabel}
                  </div>
                  <div style={{ color: "hsl(var(--text-muted))", fontSize: 10, lineHeight: 1 }}>
                    Superadmin
                  </div>
                </div>
              </div>
            </Space>
          </div>
        </Header>

        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
