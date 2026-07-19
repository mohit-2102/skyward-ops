import type { DroneStatus } from "@/lib/drone-types";
import { statusMeta } from "@/lib/drone-utils";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: DroneStatus; className?: string }) {
  const m = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium border",
        "bg-surface border-border",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot, status === "in-flight" && "animate-pulse")} />
      <span className={m.color}>{m.label}</span>
    </span>
  );
}
