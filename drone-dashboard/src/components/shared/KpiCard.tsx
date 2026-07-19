import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "default" | "success" | "warning" | "info" | "destructive";
}

const accentMap = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  destructive: "text-destructive",
};

export function KpiCard({ label, value, hint, icon, accent = "default" }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2 hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className={cn("text-2xl font-semibold tabular-nums tracking-tight", accentMap[accent])}>{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
