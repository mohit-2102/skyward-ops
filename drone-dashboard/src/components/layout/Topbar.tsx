import { Search, Bell, Command } from "lucide-react";
import { useFleet } from "@/lib/fleet-store";

export function Topbar() {
  const { drones, alerts } = useFleet();
  const active = drones.filter((d) => d.status === "in-flight").length;
  const criticals = alerts.filter((a) => a.severity === "critical").length;

  return (
    <header className="h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="h-full px-6 flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="uppercase tracking-widest text-[10px]">Ops Region</span>
          <span className="text-foreground font-medium">IIT Bombay — Powai</span>
          <span className="mx-2 text-border">/</span>
          <span className="uppercase tracking-widest text-[10px]">Active Sorties</span>
          <span className="text-info font-semibold tabular-nums">{active}</span>
        </div>
        <div className="flex-1" />
        <div className="relative w-72 max-w-full hidden sm:block">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search drones, missions, operators…"
            className="w-full h-9 pl-9 pr-16 rounded-md bg-surface border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
            <Command className="h-3 w-3" /> K
          </div>
        </div>
        <button className="relative h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface transition-colors">
          <Bell className="h-4 w-4" />
          {criticals > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold grid place-items-center">
              {criticals}
            </span>
          )}
        </button>
        <div className="h-9 w-9 rounded-md bg-primary/15 border border-primary/30 text-primary grid place-items-center text-xs font-semibold">
          OP
        </div>
      </div>
    </header>
  );
}
