"use client";

import { Avatar, Layout, Typography } from "antd";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/context/AuthContext";

const { Header, Content } = Layout;

const SECTION_META = [
  { matcher: (pathname: string) => pathname.startsWith("/dte"), label: "DTE", accent: "--section-dte" },
  { matcher: (pathname: string) => pathname.startsWith("/barber"), label: "Barber Pro", accent: "--section-barber" },
  { matcher: (pathname: string) => pathname.startsWith("/erp"), label: "ERP Full Pro", accent: "--section-erp" },
  { matcher: () => true, label: "Vista Global", accent: "--section-overview" },
];

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session } = useAuth();

  const active = SECTION_META.find((item) => item.matcher(pathname)) ?? SECTION_META[SECTION_META.length - 1];

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout>
        <Header className="px-6 py-5">
          <div className="surface-card flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <span
                className="section-badge"
                style={{
                  background: `hsl(var(${active.accent}) / 0.12)`,
                  color: `hsl(var(${active.accent}))`,
                }}
              >
                {active.label}
              </span>
              <Typography.Title level={3} style={{ margin: "0.8rem 0 0 0" }}>
                Panel central unificado
              </Typography.Title>
              <Typography.Paragraph style={{ margin: "0.35rem 0 0 0", color: "hsl(var(--text-muted))" }}>
                Operacion centralizada para DTE, Barber Pro y ERP Full Pro.
              </Typography.Paragraph>
            </div>
            <div className="flex items-center gap-3">
              <Avatar
                style={{
                  backgroundColor: "hsl(var(--accent-soft))",
                  color: "hsl(var(--accent-strong))",
                }}
              >
                {session?.username.slice(0, 1).toUpperCase()}
              </Avatar>
              <div>
                <Typography.Text strong>{session?.username}</Typography.Text>
                <br />
                <Typography.Text type="secondary">Superadmin central</Typography.Text>
              </div>
            </div>
          </div>
        </Header>
        <Content className="px-6 pb-8">{children}</Content>
      </Layout>
    </Layout>
  );
}
