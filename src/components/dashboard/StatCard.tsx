import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, sublabel, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
    </div>
  );
}
