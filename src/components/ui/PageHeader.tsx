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
      <h2
        style={{
          margin: "0.9rem 0 0.35rem 0",
          fontSize: "1.9rem",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h2>
      <p style={{ margin: 0, maxWidth: 760, color: "hsl(var(--text-muted))" }}>
        {description}
      </p>
    </div>
  );
}
