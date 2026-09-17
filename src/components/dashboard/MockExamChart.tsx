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
} from "recharts";
import type { CambridgeExamInfo } from "@/lib/cambridge-exams";

type MockExamChartProps = {
  data: { label: string; score: number }[];
  exam: Pick<CambridgeExamInfo, "scoreMin" | "scoreMax" | "passScore" | "shortName">;
};

export function MockExamChart({ data, exam }: MockExamChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Completa tu primer simulacro para ver tu evolución aquí.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
        <YAxis
          domain={[exam.scoreMin, exam.scoreMax]}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          width={36}
        />
        <ReferenceLine
          y={exam.passScore}
          stroke="var(--success)"
          strokeDasharray="4 4"
          label={{
            value: exam.shortName,
            fontSize: 10,
            fill: "var(--success)",
            position: "insideTopRight",
          }}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#0891b2"
          strokeWidth={2.5}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
