import Link from "next/link";
import type { Drone } from "@/lib/drone-types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BatteryBar } from "@/components/shared/BatteryBar";
import { ChevronRight } from "lucide-react";

interface Props {
  drones: Drone[];
  compact?: boolean;
}

export function FleetTable({ drones, compact }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="text-left font-medium px-4 py-2.5">Drone</th>
              <th className="text-left font-medium px-4 py-2.5">Model</th>
              <th className="text-left font-medium px-4 py-2.5">Status</th>
              <th className="text-left font-medium px-4 py-2.5 w-44">Battery</th>
              {!compact && <th className="text-left font-medium px-4 py-2.5">Mission</th>}
              {!compact && <th className="text-left font-medium px-4 py-2.5">Operator</th>}
              <th className="text-right font-medium px-4 py-2.5">Health</th>
              <th className="px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {drones.map((d) => (
              <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-surface/60 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/fleet/${d.id}`} className="flex items-center gap-2.5 group">
                    <span className="h-7 w-7 rounded-md bg-surface border border-border grid place-items-center text-[10px] font-mono text-muted-foreground group-hover:text-foreground">
                      {d.id.slice(-3)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">{d.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{d.id}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">{d.model}</div>
                  <div className="text-[11px] text-muted-foreground">{d.manufacturer}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3"><BatteryBar value={d.battery} /></td>
                {!compact && <td className="px-4 py-3 text-muted-foreground">{d.mission}</td>}
                {!compact && <td className="px-4 py-3 text-muted-foreground">{d.operator}</td>}
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className={d.healthScore > 85 ? "text-success" : d.healthScore > 70 ? "text-warning" : "text-destructive"}>
                    {d.healthScore}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <Link href={`/fleet/${d.id}`} className="text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {drones.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No drones match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
