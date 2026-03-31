import type { ReactNode } from "react";
import { Tag } from "antd";

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
    <div className="page-header">
      <div className="page-header__copy" style={{ minWidth: 0, flex: "1 1 24rem" }}>
        <Tag
          bordered={false}
          className="page-header__eyebrow"
          style={{
            margin: 0,
            background: "hsl(var(--accent-soft) / 0.6)",
            color: "hsl(var(--accent-strong))",
            borderRadius: 999,
            paddingInline: 8,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 10,
            lineHeight: "20px",
          }}
        >
          {eyebrow}
        </Tag>

        <h1 className="page-header__title">{title}</h1>

        <p className="page-header__description">{description}</p>
      </div>

      {actions && (
        <div className="page-header__actions">
          {actions}
        </div>
      )}
    </div>
  );
}
