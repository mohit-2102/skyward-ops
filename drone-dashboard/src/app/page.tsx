"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/shared/KpiCard";
import { MapPanel } from "@/components/map/MapPanel";
import { FleetTable } from "@/components/fleet/FleetTable";
import {
  FleetStatusPanel,
  RecentActivityPanel,
  CriticalAlertsPanel,
} from "@/components/dashboard/SidePanels";

import { useFleet } from "@/lib/fleet-store";

import {
  Plane,
  Rocket,
  CheckCircle2,
  BatteryCharging,
  Wrench,
  Battery,
  TrendingUp,
  Timer,
  Radio,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";

export default function DashboardPage() {
  
  const { drones } = useFleet();

  const [time, setTime] = useState("");

  useEffect(() => {
  const updateTime = () => {
    setTime(new Date().toLocaleTimeString());
  };

  updateTime();

  const interval = setInterval(updateTime, 1000);

  return () => clearInterval(interval);
}, []);
  
  const total = drones.length;
  const active = drones.filter((d) => d.status === "in-flight").length;
  const available = drones.filter((d) => d.status === "available").length;
  const charging = drones.filter((d) => d.status === "charging").length;
  const maintenance = drones.filter((d) => d.status === "maintenance").length;
  const avgBattery = drones.reduce((a, d) => a + d.battery, 0) / (total || 1);
  const totalFlightHours = drones.reduce((a, d) => a + d.flightHours, 0);
  const avgSignal = drones.filter((d) => d.status === "in-flight").reduce((a, d) => a + d.signal, 0) / (active || 1);
  const utilization = ((active + charging) / total) * 100;

  return (
    <AppShell>
      <div className="px-6 py-6 space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Operations Overview"
          description="Live fleet telemetry across IIT Bombay research airspace."
          actions={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Streaming · {time}
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard label="Total Drones" value={total} icon={<Plane className="h-4 w-4" />} hint={`${totalFlightHours.toLocaleString()} lifetime hours`} />
          <KpiCard label="Active Missions" value={active} accent="info" icon={<Rocket className="h-4 w-4" />} hint="in-flight now" />
          <KpiCard label="Available" value={available} accent="success" icon={<CheckCircle2 className="h-4 w-4" />} hint="ready to deploy" />
          <KpiCard label="Charging" value={charging} accent="warning" icon={<BatteryCharging className="h-4 w-4" />} hint="on dock" />
          <KpiCard label="Maintenance" value={maintenance} accent="destructive" icon={<Wrench className="h-4 w-4" />} hint="grounded" />
          <KpiCard label="Avg Battery" value={`${avgBattery.toFixed(0)}%`} icon={<Battery className="h-4 w-4" />} hint="fleet mean" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Live Airspace</h3>
                <p className="text-[11px] text-muted-foreground">IIT Bombay — Powai · 900 m operational perimeter</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-info" /> In flight</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Available</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> Charging</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Maintenance</span>
              </div>
            </div>
            <div className="h-[520px]">
              <MapPanel drones={drones} height="100%" />
            </div>
          </div>
          <div className="space-y-4">
            <FleetStatusPanel />
            <RecentActivityPanel />
            <CriticalAlertsPanel />
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Fleet Registry</h2>
            <span className="text-[11px] text-muted-foreground">Showing latest 8 · view full registry in Fleet</span>
          </div>
          <FleetTable drones={drones.slice(0, 8)} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KpiCard
            label="Fleet Utilization"
            value={`${utilization.toFixed(1)}%`}
            accent="info"
            icon={<TrendingUp className="h-4 w-4" />}
            hint="active + charging vs total"
          />
          <KpiCard
            label="Avg Signal (in-flight)"
            value={`${avgSignal.toFixed(0)}%`}
            icon={<Radio className="h-4 w-4" />}
            hint="downlink strength"
          />
          <KpiCard
            label="Flight Time Today"
            value={`${drones.reduce((a, d) => a + d.flightTimeToday, 0)} min`}
            icon={<Timer className="h-4 w-4" />}
            hint="all sorties"
          />
        </section>
      </div>
    </AppShell>
  );
}