import { Typography } from "antd";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <span className="section-badge bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-strong))]">
        {eyebrow}
      </span>
      <Typography.Title level={2} style={{ margin: "0.9rem 0 0.35rem 0" }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph style={{ margin: 0, maxWidth: 760, color: "hsl(var(--text-muted))" }}>
        {description}
      </Typography.Paragraph>
    </div>
  );
}
