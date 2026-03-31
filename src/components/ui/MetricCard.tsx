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
      className="surface-card border-0 h-full"
      size="small"
      style={{ borderTop: `3px solid hsl(var(${colorVar}))` }}
      styles={{
        body: {
          display: "flex",
          minHeight: "100%",
          flexDirection: "column",
          gap: "0.7rem",
          padding: "1rem 1rem 0.95rem",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "hsl(var(--text-secondary))",
              fontSize: "0.76rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight: 1.35,
            }}
          >
            {title}
          </div>
          {hint ? (
            <div
              style={{
                marginTop: "0.4rem",
                fontSize: "0.82rem",
                lineHeight: 1.45,
                color: "hsl(var(--text-muted))",
              }}
            >
              {hint}
            </div>
          ) : null}
        </div>

        {icon ? (
          <div
            style={{
              color: `hsl(var(${colorVar}))`,
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.4rem",
              height: "2.4rem",
              borderRadius: "0.9rem",
              background: `hsl(var(${colorVar}) / 0.12)`,
            }}
          >
            {icon}
          </div>
        ) : null}
      </div>

      {isNumericValue ? (
        <Statistic
          value={value}
          suffix={suffix}
          valueStyle={{
            color: `hsl(var(${colorVar}))`,
            fontSize: "1.95rem",
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        />
      ) : (
        <div
          style={{
            color: `hsl(var(${colorVar}))`,
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
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
