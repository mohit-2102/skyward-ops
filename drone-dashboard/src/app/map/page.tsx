"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { MapPanel } from "@/components/map/MapPanel";
import { useFleet } from "@/lib/fleet-store";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { DroneStatus } from "@/lib/drone-types";
import { useState } from "react";


export default function MapPage() {
  const { drones } = useFleet();
  const [filter, setFilter] = useState<DroneStatus | "all">("all");
  const filtered = filter === "all" ? drones : drones.filter((d) => d.status === filter);

  return (
    <AppShell>
      <div className="px-6 py-6 space-y-4 max-w-[1600px] mx-auto">
        <PageHeader
          title="Interactive Map"
          description="Real-time positions of every drone in the fleet across the campus airspace."
          actions={
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5 text-xs">
              {(["all", "in-flight", "available", "charging", "maintenance", "offline"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2.5 py-1 rounded capitalize ${filter === s ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {s === "all" ? "All" : s.replace("-", " ")}
                </button>
              ))}
            </div>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 h-[calc(100vh-220px)] min-h-[560px]">
            <MapPanel drones={filtered} height="100%" />
          </div>
          <aside className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">In View</h3>
              <p className="text-[11px] text-muted-foreground">{filtered.length} drones</p>
            </div>
            <ul className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
              {filtered.map((d) => (
                <li key={d.id} className="p-3 hover:bg-surface/60">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{d.name}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                    {d.lat.toFixed(4)}, {d.lng.toFixed(4)} · {d.altitude}m
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
