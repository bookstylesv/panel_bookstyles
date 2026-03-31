"use client";

import { App, ConfigProvider, theme as antdTheme } from "antd";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        cssVar: {},
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "hsl(var(--accent))",
          colorInfo: "hsl(var(--accent))",
          colorSuccess: "hsl(var(--state-success))",
          colorWarning: "hsl(var(--state-warning))",
          colorError: "hsl(var(--state-danger))",
          colorBgBase: "hsl(var(--bg-surface))",
          colorBgLayout: "hsl(var(--bg-app))",
          colorBgContainer: "hsl(var(--bg-surface))",
          colorBorder: "hsl(var(--border-default))",
          colorTextBase: "hsl(var(--text-primary))",
          colorText: "hsl(var(--text-primary))",
          colorTextSecondary: "hsl(var(--text-secondary))",
          borderRadius: 18,
          fontFamily: "var(--font-sans)",
          boxShadowSecondary: "var(--shadow-card)",
        },
        components: {
          Layout: {
            siderBg: "hsl(var(--bg-sidebar))",
            headerBg: "transparent",
            bodyBg: "transparent",
            triggerBg: "hsl(var(--bg-sidebar-elevated))",
          },
          Menu: {
            darkItemBg: "hsl(var(--bg-sidebar))",
            darkSubMenuItemBg: "hsl(var(--bg-sidebar))",
            darkItemSelectedBg: "hsl(var(--accent-strong) / 0.22)",
            darkItemHoverBg: "hsl(var(--bg-sidebar-elevated))",
            darkItemSelectedColor: "hsl(var(--text-inverse))",
            darkItemColor: "hsl(var(--text-inverse) / 0.72)",
          },
          Card: {
            colorBorderSecondary: "hsl(var(--border-default))",
          },
          Button: {
            defaultBorderColor: "hsl(var(--border-default))",
            defaultColor: "hsl(var(--text-primary))",
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
