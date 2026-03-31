import type { ReactNode } from "react";
import { Card, Statistic } from "antd";

type Tone = "section" | "success" | "warning" | "danger" | "neutral";

const TONE_VARS: Record<Tone, string> = {
  section: "",
  success: "--state-success",
  warning: "--state-warning",
  danger: "--state-danger",
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
  title: string;
  value: number | string;
  accentVar: string;
  tone?: Tone;
  suffix?: string;
  hint?: string;
  icon?: ReactNode;
}) {
  const colorVar = tone === "section" ? accentVar : TONE_VARS[tone];
  const isNumericValue = typeof value === "number";

  return (
    <Card
      className="surface-card metric-card border-0 h-full"
      size="small"
      style={{ borderTop: `3px solid hsl(var(${colorVar}))` }}
      styles={{
        body: {
          display: "flex",
          minHeight: "100%",
          flexDirection: "column",
          gap: "0.5rem",
          padding: "0.8rem 0.9rem 0.82rem",
        },
      }}
    >
      <div
        className="metric-card__eyebrow"
      >
        <div style={{ minWidth: 0 }}>
          <div className="metric-card__kicker">
            <span
              className="metric-card__dot"
              style={{ background: `hsl(var(${colorVar}))` }}
            />
            {title}
          </div>
        </div>

        {icon ? (
          <div
            className="metric-card__icon"
            style={{
              color: `hsl(var(${colorVar}))`,
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2rem",
              height: "2rem",
              borderRadius: "999px",
              background: `hsl(var(${colorVar}) / 0.12)`,
            }}
          >
            {icon}
          </div>
        ) : null}
      </div>

      {hint ? <p className="metric-card__hint">{hint}</p> : null}

      {isNumericValue ? (
        <Statistic
          className="metric-card__value"
          value={value}
          suffix={suffix}
          valueStyle={{
            color: `hsl(var(${colorVar}))`,
            fontSize: "1.55rem",
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        />
      ) : (
        <div
          className="metric-card__value metric-card__value--text"
          style={{
            color: `hsl(var(${colorVar}))`,
            fontFamily: "var(--font-display)",
            fontSize: "1.2rem",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            fontWeight: 700,
          }}
        >
          {value}
        </div>
      )}
    </Card>
  );
}
