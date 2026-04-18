"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DteAnalyticsSeriePunto } from "@/lib/integrations/dte";

interface MomChartProps {
  serie: DteAnalyticsSeriePunto[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "hsl(var(--bg-surface))",
        border: "1px solid hsl(var(--border-default))",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        color: "hsl(var(--text-primary))",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: "hsl(var(--text-secondary))" }}>
          {p.name}: <strong style={{ color: "hsl(var(--text-primary))" }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function MomChart({ serie }: MomChartProps) {
  const data = serie.slice(-6).map((p) => ({
    mes: p.mes_label,
    Nuevos: p.nuevos,
    Activaciones: p.activaciones,
    Suspensiones: p.suspensiones,
  }));

  if (!data.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "hsl(var(--text-muted))", fontSize: 13 }}>
        Sin datos mensuales disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="hsl(var(--border-default))" strokeDasharray="3 3" />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: "hsl(var(--text-muted))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--text-muted))" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--bg-elevated, var(--bg-surface)) / 0.5)" }} />
        <Bar dataKey="Nuevos" fill="hsl(var(--section-dte))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Activaciones" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Suspensiones" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
