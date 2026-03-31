import type { ReactNode } from "react";
import { Space, Tag, Typography } from "antd";

const { Title, Text } = Typography;

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ minWidth: 0, flex: "1 1 28rem" }}>
        <Tag
          bordered={false}
          style={{
            margin: 0,
            background: "hsl(var(--accent-soft) / 0.6)",
            color: "hsl(var(--accent-strong))",
            borderRadius: 999,
            paddingInline: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontSize: 11,
            lineHeight: "22px",
          }}
        >
          {eyebrow}
        </Tag>

        <Title
          level={2}
          style={{
            margin: "0.85rem 0 0.35rem",
            fontSize: "clamp(1.65rem, 2.6vw, 2.2rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </Title>

        <Text
          type="secondary"
          style={{ lineHeight: 1.6, maxWidth: 760, display: "block" }}
        >
          {description}
        </Text>
      </div>

      {actions && (
        <Space wrap size={8} style={{ justifyContent: "flex-end" }}>
          {actions}
        </Space>
      )}
    </div>
  );
}
