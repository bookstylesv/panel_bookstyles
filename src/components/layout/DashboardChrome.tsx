"use client";

import { useEffect, useState } from "react";
import { Avatar, Button, Layout, Space, Tooltip } from "antd";
import { Menu as MenuIcon, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ControlSidebar } from "@/components/layout/ControlSidebar";
import { useAuth } from "@/context/AuthContext";
import {
  CONTROL_THEME_STORAGE_KEY,
  applyControlThemeValues,
  getControlThemePreset,
} from "@/lib/control-theme";

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

  // ── Dark mode toggle ───────────────────────────────────
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(CONTROL_THEME_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { id?: string };
        setIsDark(parsed.id === "dark-steel");
      } catch { /* ignore */ }
    }
  }, []);

  function toggleTheme() {
    const nextId    = isDark ? "arctic-teal" : "dark-steel";
    const preset    = getControlThemePreset(nextId);
    applyControlThemeValues(document.documentElement.style, preset.values);
    window.localStorage.setItem(CONTROL_THEME_STORAGE_KEY, JSON.stringify({ id: nextId }));
    setIsDark(!isDark);
  }

  const active         = SECTION_META.find((s) => s.matcher(pathname)) ?? SECTION_META[SECTION_META.length - 1];
  const onOverview     = pathname === "/overview";
  const sessionLabel   = session?.username ?? "admin";
  const sessionInitial = getInitials(session?.username);

  return (
    <Layout
      className="control-dashboard"
      hasSider
      style={{ minHeight: "100vh" }}
    >
      <ControlSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Layout style={{ background: "transparent", minWidth: 0 }}>

        {/* ── Topbar ── */}
        <Header
          className="glass-topbar"
          style={{
            height: "auto",
            lineHeight: 1,
            padding: "0 16px",
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
              <Badge
                variant="outline"
                className="section-badge"
                style={{
                  "--section-color": `hsl(var(${active.accent}))`,
                  "--section-bg":    `hsl(var(${active.accent}) / 0.1)`,
                } as React.CSSProperties}
              >
                {active.label}
              </Badge>
            </Space>

            {/* Right: dark toggle + overview link + status + user chip */}
            <Space size={8} align="center">
              <Tooltip title={isDark ? "Modo claro" : "Modo oscuro"} placement="bottom">
                <Button
                  type="text"
                  size="small"
                  onClick={toggleTheme}
                  icon={isDark ? <Sun size={15} /> : <Moon size={15} />}
                  style={{ color: "hsl(var(--text-muted))" }}
                />
              </Tooltip>

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

              <Badge
                variant="outline"
                className="section-badge"
                style={{
                  "--section-color": "hsl(var(--status-success))",
                  "--section-bg":    "hsl(var(--status-success-bg))",
                } as React.CSSProperties}
              >
                Operativo
              </Badge>

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
