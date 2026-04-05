"use client";

import { App, ConfigProvider, theme as antdTheme } from "antd";
import esES from "antd/locale/es_ES";

const tokenColor = (name: string, alpha?: string) =>
  alpha ? `hsl(var(${name}) / ${alpha})` : `hsl(var(${name}))`;

type AntdProviderVariant = "default" | "dashboard";

function getDefaultTheme() {
  return {
    cssVar: {},
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: tokenColor("--accent"),
      colorLink: tokenColor("--accent"),
      colorInfo: tokenColor("--accent"),
      colorSuccess: tokenColor("--state-success"),
      colorWarning: tokenColor("--state-warning"),
      colorError: tokenColor("--state-danger"),
      colorBgBase: tokenColor("--bg-surface"),
      colorBgLayout: tokenColor("--bg-app"),
      colorBgContainer: tokenColor("--bg-surface"),
      colorBgElevated: tokenColor("--bg-surface-strong"),
      colorBorder: tokenColor("--border-default"),
      colorBorderSecondary: tokenColor("--border-default", "0.72"),
      colorFillAlter: tokenColor("--bg-surface-muted"),
      colorFillSecondary: tokenColor("--accent-soft", "0.52"),
      colorFillTertiary: tokenColor("--accent-soft", "0.26"),
      colorSplit: tokenColor("--border-default", "0.82"),
      colorTextBase: tokenColor("--text-primary"),
      colorText: tokenColor("--text-primary"),
      colorTextSecondary: tokenColor("--text-secondary"),
      colorTextTertiary: tokenColor("--text-muted"),
      colorTextDescription: tokenColor("--text-muted"),
      controlItemBgActive: tokenColor("--accent-soft"),
      controlItemBgActiveHover: tokenColor("--accent-soft"),
      controlItemBgHover: tokenColor("--bg-surface-muted"),
      controlOutline: tokenColor("--accent", "0.16"),
      controlOutlineWidth: 0,
      lineWidth: 1,
      borderRadius: 18,
      borderRadiusSM: 12,
      borderRadiusLG: 24,
      borderRadiusXS: 10,
      fontSize: 14,
      fontFamily: "var(--font-sans)",
      fontFamilyCode: "var(--font-display)",
      boxShadowSecondary: "var(--shadow-card)",
    },
    components: {
      Layout: {
        headerBg: "transparent",
        bodyBg: "transparent",
        siderBg: tokenColor("--bg-sidebar"),
        triggerBg: tokenColor("--bg-sidebar-elevated"),
      },
      Menu: {
        darkItemBg: tokenColor("--bg-sidebar"),
        darkSubMenuItemBg: "transparent",
        darkItemHoverBg: tokenColor("--bg-sidebar-elevated"),
        darkItemSelectedBg: tokenColor("--accent-soft", "0.14"),
        darkItemSelectedColor: tokenColor("--text-inverse"),
        darkItemColor: tokenColor("--text-inverse", "0.72"),
        itemBorderRadius: 14,
        itemMarginBlock: 6,
        itemMarginInline: 10,
        subMenuItemBorderRadius: 12,
      },
      Card: {
        colorBorderSecondary: tokenColor("--border-default"),
        headerBg: "transparent",
        borderRadiusLG: 20,
        bodyPadding: 18,
        bodyPaddingSM: 14,
      },
      Button: {
        controlHeight: 42,
        controlHeightLG: 48,
        borderRadius: 12,
        defaultBorderColor: tokenColor("--border-default"),
        defaultColor: tokenColor("--text-primary"),
        defaultBg: tokenColor("--bg-surface"),
        primaryShadow: "none",
      },
      Input: {
        activeBg: tokenColor("--bg-surface"),
        activeBorderColor: tokenColor("--accent"),
        hoverBorderColor: tokenColor("--accent", "0.48"),
        colorBgContainer: tokenColor("--bg-surface"),
      },
      InputNumber: {
        activeBg: tokenColor("--bg-surface"),
        activeBorderColor: tokenColor("--accent"),
        hoverBorderColor: tokenColor("--accent", "0.48"),
      },
      Select: {
        optionSelectedBg: tokenColor("--accent-soft"),
        optionActiveBg: tokenColor("--bg-surface-muted"),
        activeBorderColor: tokenColor("--accent"),
        hoverBorderColor: tokenColor("--accent", "0.48"),
      },
      Form: {
        labelColor: tokenColor("--text-secondary"),
        verticalLabelPadding: "0 0 10px",
      },
      Tag: {
        defaultBg: tokenColor("--bg-surface-muted"),
        defaultColor: tokenColor("--text-secondary"),
        borderRadiusSM: 999,
        fontWeightStrong: 700,
      },
      Alert: {
        borderRadiusLG: 20,
        withDescriptionPadding: "18px 18px 18px 16px",
      },
      Table: {
        borderColor: tokenColor("--border-default"),
        headerBg: tokenColor("--bg-surface-muted"),
        headerColor: tokenColor("--text-muted"),
        rowHoverBg: tokenColor("--bg-surface-muted", "0.76"),
        cellPaddingBlock: 15,
        cellPaddingInline: 16,
      },
      Statistic: {
        contentFontSize: 18,
      },
      Divider: {
        colorSplit: tokenColor("--border-default", "0.82"),
      },
      Avatar: {
        colorBgContainer: tokenColor("--accent-soft"),
        colorTextPlaceholder: tokenColor("--accent-strong"),
      },
      Breadcrumb: {
        itemColor: tokenColor("--text-muted"),
        lastItemColor: tokenColor("--text-secondary"),
        linkColor: tokenColor("--text-secondary"),
        separatorColor: tokenColor("--text-muted", "0.8"),
      },
      Tabs: {
        itemColor: tokenColor("--text-muted"),
        itemSelectedColor: tokenColor("--text-primary"),
        itemHoverColor: tokenColor("--text-primary"),
        inkBarColor: tokenColor("--accent"),
      },
      Drawer: {
        colorBgElevated: tokenColor("--bg-surface-strong"),
      },
      Modal: {
        contentBg: tokenColor("--bg-surface-strong"),
        headerBg: "transparent",
        titleColor: tokenColor("--text-primary"),
      },
      Popover: {
        colorBgElevated: tokenColor("--bg-surface-strong"),
      },
      Tooltip: {
        colorBgSpotlight: tokenColor("--bg-sidebar"),
      },
    },
  };
}

// Colores reales que Ant Design puede parsear para derivar fondos de alertas, badges, etc.
// NO usar CSS vars aquí: el algoritmo defaultAlgorithm las necesita para calcular colorWarningBg, colorErrorBg, etc.
const SEMANTIC_COLORS = {
  primary: "hsl(262, 72%, 58%)",   // --raw-primary
  success: "hsl(142, 71%, 35%)",   // --raw-success
  warning: "hsl(38,  92%, 50%)",   // --raw-warning
  danger:  "hsl(0,   84%, 60%)",   // --raw-danger
} as const;

function getDashboardTheme() {
  return {
    cssVar: {},
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: SEMANTIC_COLORS.primary,
      colorLink:    SEMANTIC_COLORS.primary,
      colorInfo:    SEMANTIC_COLORS.primary,
      colorSuccess: SEMANTIC_COLORS.success,
      colorWarning: SEMANTIC_COLORS.warning,
      colorError:   SEMANTIC_COLORS.danger,
      colorBgBase: tokenColor("--bg-surface"),
      colorBgLayout: tokenColor("--bg-page"),
      colorBgContainer: tokenColor("--bg-surface"),
      colorBgElevated: tokenColor("--bg-surface-raised"),
      colorBorder: tokenColor("--border-default"),
      colorBorderSecondary: tokenColor("--border-default", "0.72"),
      colorFillAlter: tokenColor("--bg-subtle"),
      colorFillSecondary: tokenColor("--accent-soft", "0.58"),
      colorFillTertiary: tokenColor("--accent-soft", "0.22"),
      colorSplit: tokenColor("--border-default", "0.82"),
      colorTextBase: tokenColor("--text-primary"),
      colorText: tokenColor("--text-primary"),
      colorTextSecondary: tokenColor("--text-secondary"),
      colorTextTertiary: tokenColor("--text-muted"),
      colorTextDescription: tokenColor("--text-muted"),
      controlItemBgActive: tokenColor("--accent-soft"),
      controlItemBgActiveHover: tokenColor("--accent-soft"),
      controlItemBgHover: tokenColor("--bg-subtle"),
      controlOutline: tokenColor("--accent", "0.14"),
      controlOutlineWidth: 0,
      lineWidth: 1,
      borderRadius: 12,
      borderRadiusSM: 8,
      borderRadiusLG: 16,
      borderRadiusXS: 4,
      fontSize: 13,
      fontFamily: "var(--font-sans)",
      fontFamilyCode: "var(--font-display)",
      boxShadowSecondary: "var(--shadow-card)",
    },
    components: {
      Layout: {
        headerBg: tokenColor("--bg-surface"),
        bodyBg: tokenColor("--bg-page"),
        siderBg: tokenColor("--bg-sidebar"),
      },
      Menu: {
        darkItemBg: "transparent",
        darkSubMenuItemBg: "transparent",
        darkItemHoverBg: tokenColor("--sidebar-hover-bg"),
        darkItemSelectedBg: tokenColor("--sidebar-active-bg"),
        darkItemSelectedColor: tokenColor("--sidebar-active-fg"),
        darkItemColor: tokenColor("--sidebar-fg"),
        darkGroupTitleColor: tokenColor("--sidebar-muted"),
        itemBorderRadius: 8,
        itemMarginBlock: 2,
        itemMarginInline: 0,
        subMenuItemBorderRadius: 8,
      },
      Card: {
        colorBorderSecondary: tokenColor("--border-default"),
        headerBg: "transparent",
        headerFontSize: 13,
        headerFontSizeSM: 12,
        headerHeight: 48,
        borderRadiusLG: 16,
        bodyPadding: 18,
        bodyPaddingSM: 14,
      },
      Button: {
        controlHeight: 38,
        controlHeightLG: 42,
        borderRadius: 8,
        defaultBorderColor: tokenColor("--border-default"),
        defaultColor: tokenColor("--text-primary"),
        defaultBg: tokenColor("--bg-surface"),
        primaryShadow: "none",
      },
      Input: {
        activeBg: tokenColor("--bg-surface"),
        activeBorderColor: tokenColor("--accent"),
        hoverBorderColor: tokenColor("--accent", "0.42"),
        colorBgContainer: tokenColor("--bg-surface"),
      },
      InputNumber: {
        activeBg: tokenColor("--bg-surface"),
        activeBorderColor: tokenColor("--accent"),
        hoverBorderColor: tokenColor("--accent", "0.42"),
      },
      Select: {
        optionSelectedBg: tokenColor("--accent-soft"),
        optionActiveBg: tokenColor("--bg-subtle"),
        activeBorderColor: tokenColor("--accent"),
        hoverBorderColor: tokenColor("--accent", "0.42"),
      },
      Form: {
        labelColor: tokenColor("--text-secondary"),
        verticalLabelPadding: "0 0 8px",
      },
      Tag: {
        defaultBg: tokenColor("--bg-subtle"),
        defaultColor: tokenColor("--text-secondary"),
        borderRadiusSM: 999,
        fontWeightStrong: 700,
      },
      Alert: {
        borderRadiusLG: 14,
        withDescriptionPadding: "16px 18px 16px 16px",
      },
      Table: {
        borderColor: tokenColor("--border-default"),
        headerBg: tokenColor("--bg-subtle"),
        headerColor: tokenColor("--text-muted"),
        rowHoverBg: tokenColor("--accent-soft", "0.4"),
        cellPaddingBlock: 12,
        cellPaddingInline: 16,
      },
      Statistic: {
        contentFontSize: 18,
      },
      Divider: {
        colorSplit: tokenColor("--border-default", "0.86"),
      },
      Avatar: {
        colorBgContainer: tokenColor("--accent-soft"),
        colorTextPlaceholder: tokenColor("--accent-strong"),
      },
      Breadcrumb: {
        itemColor: tokenColor("--text-muted"),
        lastItemColor: tokenColor("--text-secondary"),
        linkColor: tokenColor("--text-secondary"),
        separatorColor: tokenColor("--text-muted", "0.8"),
      },
      Tabs: {
        itemColor: tokenColor("--text-muted"),
        itemSelectedColor: tokenColor("--text-primary"),
        itemHoverColor: tokenColor("--text-primary"),
        inkBarColor: tokenColor("--accent"),
      },
      Drawer: {
        colorBgElevated: tokenColor("--bg-surface-raised"),
      },
      Modal: {
        contentBg: tokenColor("--bg-surface-raised"),
        headerBg: "transparent",
        titleColor: tokenColor("--text-primary"),
      },
      Popover: {
        colorBgElevated: tokenColor("--bg-surface-raised"),
      },
      Tooltip: {
        colorBgSpotlight: tokenColor("--bg-sidebar"),
      },
      Descriptions: {
        labelBg: tokenColor("--bg-subtle"),
        itemPaddingBottom: 12,
      },
      Progress: {
        defaultColor: tokenColor("--accent"),
        remainingColor: tokenColor("--bg-subtle"),
      },
    },
  };
}

export function AntdProvider({
  children,
  variant = "default",
  withApp = true,
}: {
  children: React.ReactNode;
  variant?: AntdProviderVariant;
  withApp?: boolean;
}) {
  const content = withApp ? <App>{children}</App> : children;

  return (
    <ConfigProvider
      locale={esES}
      theme={variant === "dashboard" ? getDashboardTheme() : getDefaultTheme()}
    >
      {content}
    </ConfigProvider>
  );
}
