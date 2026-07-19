"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { useFleet } from "@/lib/fleet-store";
import { formatDate } from "@/lib/drone-utils";
import { Wrench, CalendarClock, CheckCircle2, Battery } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";



export default function MaintenancePage() {
  const { drones } = useFleet();
  const [now] = useState(() => Date.now());

  const upcoming = drones
    .map((d) => ({ drone: d, next: new Date(d.nextMaintenance).getTime() }))
    .filter((x) => x.next > now)
    .sort((a, b) => a.next - b.next)
    .slice(0, 12);

  const completed = drones
    .flatMap((d) => d.maintenanceHistory.map((m) => ({ ...m, drone: d })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

  const avgHealth = drones.reduce((a, d) => a + d.healthScore, 0) / drones.length;
  const avgCycles = drones.reduce((a, d) => a + d.batteryCycles, 0) / drones.length;
  const inMaintenance = drones.filter((d) => d.status === "maintenance").length;
  const dueSoon = drones.filter((d) => (new Date(d.nextMaintenance).getTime() - now) / 86400000 < 14).length;

  return (
    <AppShell>
      <div className="px-6 py-6 space-y-5 max-w-[1600px] mx-auto">
        <PageHeader title="Maintenance" description="Track service schedules, completed work, component health and battery cycles." />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Fleet Health" value={`${avgHealth.toFixed(0)}`} accent="success" icon={<CheckCircle2 className="h-4 w-4" />} hint="avg score" />
          <KpiCard label="In Maintenance" value={inMaintenance} accent="destructive" icon={<Wrench className="h-4 w-4" />} hint="grounded now" />
          <KpiCard label="Due within 14 days" value={dueSoon} accent="warning" icon={<CalendarClock className="h-4 w-4" />} />
          <KpiCard label="Avg Battery Cycles" value={avgCycles.toFixed(0)} icon={<Battery className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold">Upcoming Maintenance</h3>
            </div>
            <ul className="divide-y divide-border">
              {upcoming.map(({ drone, next }) => {
                const days = Math.round((next - now) / 86400000);
                return (
                  <li key={drone.id}>
                    <Link href={`/fleet/${drone.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface/60 transition-colors">
                      <div>
                        <div className="text-sm font-medium">{drone.name} <span className="text-muted-foreground font-mono text-xs ml-1">{drone.id}</span></div>
                        <div className="text-[11px] text-muted-foreground">{drone.model} · {drone.operator}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{formatDate(drone.nextMaintenance)}</div>
                        <div className={`text-[11px] ${days < 7 ? "text-warning" : "text-muted-foreground"}`}>in {days} days</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold">Completed Maintenance</h3>
            </div>
            <ul className="divide-y divide-border max-h-[520px] overflow-y-auto scrollbar-thin">
              {completed.map((m) => (
                <li key={m.id}>
                  <Link href={`/fleet/${m.drone.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface/60 transition-colors">
                    <div>
                      <div className="text-sm font-medium">{m.type}</div>
                      <div className="text-[11px] text-muted-foreground">{m.drone.name} · {m.technician}</div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{formatDate(m.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Component Replacement & Battery Cycles</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="text-left font-medium px-4 py-2">Drone</th>
                  <th className="text-left font-medium px-4 py-2">Health</th>
                  <th className="text-left font-medium px-4 py-2">Cycles</th>
                  <th className="text-left font-medium px-4 py-2">Weakest Component</th>
                  <th className="text-left font-medium px-4 py-2">Last Service</th>
                </tr>
              </thead>
              <tbody>
                {drones.slice(0, 15).map((d) => {
                  const weakest = [...d.components].sort((a, b) => a.health - b.health)[0]!;
                  return (
                    <tr key={d.id} className="border-b border-border/50 last:border-0 hover:bg-surface/60">
                      <td className="px-4 py-2.5">
                        <Link href={`/fleet/${d.id}`} className="hover:text-primary">
                          <div className="text-foreground">{d.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{d.id}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        <span className={d.healthScore > 85 ? "text-success" : d.healthScore > 70 ? "text-warning" : "text-destructive"}>{d.healthScore}</span>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{d.batteryCycles}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-foreground">{weakest.name}</span>
                        <span className="text-muted-foreground text-xs ml-2">{weakest.health}%</span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDate(d.lastMaintenance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
