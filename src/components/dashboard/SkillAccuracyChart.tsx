"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

type SkillAccuracyChartProps = {
  data: { label: string; accuracy: number; hasData: boolean }[];
};

const COLOR = "#4550e6";
const COLOR_EMPTY = "#d7dae0";

export function SkillAccuracyChart({ data }: SkillAccuracyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          width={32}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, "Aciertos"]}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.hasData ? COLOR : COLOR_EMPTY} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
