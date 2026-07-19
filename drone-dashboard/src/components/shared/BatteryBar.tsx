import { cn } from "@/lib/utils";

export function BatteryBar({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const color = v > 60 ? "bg-success" : v > 30 ? "bg-warning" : "bg-destructive";
  return (
    <div className={cn("flex items-center gap-2 min-w-24", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">{Math.round(v)}%</span>
    </div>
  );
}
