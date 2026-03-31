import { Card, Statistic, Tag } from "antd";

export function MetricCard({
  title,
  value,
  accentVar,
  suffix,
  hint,
}: {
  title: string;
  value: number | string;
  accentVar: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <Card className="surface-card border-0">
      <div className="mb-4 flex items-center justify-between">
        <Tag
          bordered={false}
          style={{
            background: `hsl(var(${accentVar}) / 0.12)`,
            color: `hsl(var(${accentVar}))`,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Tag>
        {hint ? <span className="text-xs text-[hsl(var(--text-muted))]">{hint}</span> : null}
      </div>
      <Statistic
        value={value}
        suffix={suffix}
        valueStyle={{
          color: `hsl(var(${accentVar}))`,
          fontFamily: "var(--font-display)",
        }}
      />
    </Card>
  );
}
