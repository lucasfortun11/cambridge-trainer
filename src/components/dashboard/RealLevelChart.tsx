"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";
import { CEFR_LEVELS, levelToNumeric, numericToLevel } from "@/lib/cambridge-exams";
import type { RealLevelChartPoint } from "@/lib/level-history";
import type { CEFRLevel } from "@/generated/prisma/client";

type RealLevelChartProps = {
  data: RealLevelChartPoint[];
  targetLevel: CEFRLevel;
};

type TooltipPayloadEntry = { dataKey?: string; payload: RealLevelChartPoint };

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        fontSize: 12,
        padding: "8px 10px",
      }}
    >
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {point.writingLabel && <p className="text-foreground">Writing: {point.writingLabel}</p>}
      {point.speakingLabel && <p className="text-foreground">Speaking: {point.speakingLabel}</p>}
    </div>
  );
}

export function RealLevelChart({ data, targetLevel }: RealLevelChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
        Completa un Writing o Speaking para empezar a ver tu nivel real (independiente de tu
        objetivo) a lo largo del tiempo.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
        <YAxis
          domain={[1, CEFR_LEVELS.length + 1]}
          ticks={CEFR_LEVELS.map((_, i) => i + 1)}
          tickFormatter={(value) => numericToLevel(value)}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          width={34}
        />
        <ReferenceLine
          y={levelToNumeric(targetLevel, "LOW")}
          stroke="var(--primary)"
          strokeDasharray="4 4"
          label={{
            value: `Objetivo: ${targetLevel}`,
            fontSize: 10,
            fill: "var(--primary)",
            position: "insideTopRight",
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="writingValue"
          name="Writing"
          stroke="#4550e6"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="speakingValue"
          name="Speaking"
          stroke="#0891b2"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
