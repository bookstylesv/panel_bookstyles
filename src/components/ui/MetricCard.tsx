import type { CSSProperties, ReactNode } from "react";
import { Card, Statistic } from "antd";

type Tone = "section" | "success" | "warning" | "danger" | "neutral";

const TONE_VARS: Record<Tone, string> = {
  section: "",
  success: "--state-success",
  warning: "--state-warning",
  danger:  "--state-danger",
  neutral: "--text-muted",
};

export function MetricCard({
  title,
  value,
  accentVar,
  tone = "section",
  suffix,
  hint,
  icon,
}: {
  title:     string;
  value:     number | string;
  accentVar: string;
  tone?:     Tone;
  suffix?:   string;
  hint?:     string;
  icon?:     ReactNode;
}) {
  const colorVar = tone === "section" ? accentVar : TONE_VARS[tone];

  // CSS custom properties: all visual styling stays in globals.css
  const cssVars = {
    "--metric-accent":      `hsl(var(${colorVar}))`,
    "--metric-accent-soft": `hsl(var(${colorVar}) / 0.1)`,
  } as CSSProperties;

  return (
    <Card
      className="metric-card h-full"
      size="small"
      style={cssVars}
      styles={{
        body: {
          padding: "0.85rem 1rem",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
    >
      <div className="metric-card__header">
        <div className="metric-card__kicker">{title}</div>
        {icon ? <div className="metric-card__icon">{icon}</div> : null}
      </div>

      {typeof value === "number" ? (
        <Statistic
          className="metric-card__value"
          value={value}
          suffix={suffix}
          valueStyle={{ color: "var(--metric-accent)" }}
        />
      ) : (
        <div
          style={{
            color: "var(--metric-accent)",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 3.2vw, 2.35rem)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            fontWeight: 800,
          }}
        >
          {value}
        </div>
      )}

      {hint ? <p className="metric-card__hint">{hint}</p> : null}
    </Card>
  );
}
