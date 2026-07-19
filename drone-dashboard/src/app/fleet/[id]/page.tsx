"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useFleet } from "@/lib/fleet-store";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BatteryBar } from "@/components/shared/BatteryBar";
import { formatDate, formatRelative } from "@/lib/drone-utils";
import {
    ArrowLeft, Battery, Signal, Gauge, Mountain, Thermometer, Cpu, Radio,
    Wrench, Clock, User, MapPin, Zap, Activity as ActivityIcon,
} from "lucide-react";
import { MapPanel } from "@/components/map/MapPanel";
import type { Drone } from "@/lib/drone-types";
import type { ReactNode } from "react";



export default function DroneDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { drones } = useFleet();
    const drone = drones.find((d) => d.id === id);
    if (!drone) {
        notFound();
    }

    return (
        <AppShell>
            <div className="px-6 py-6 space-y-5 max-w-[1600px] mx-auto">
                <Link href="/fleet" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Fleet
                </Link>

                <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-lg bg-surface border border-border grid place-items-center text-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
                                <circle cx="12" cy="12" r="2.5" />
                                <circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" />
                                <circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
                                <path d="M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight">{drone.name}</h1>
                                <StatusBadge status={drone.status} />
                            </div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                                <span className="font-mono">{drone.id}</span> · {drone.manufacturer} {drone.model} · SN {drone.serial}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Firmware {drone.firmware}</span>
                        <span className="text-border">·</span>
                        <span>Updated {formatRelative(drone.lastUpdated)}</span>
                    </div>
                </header>

                {/* Overview KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <StatTile icon={<Battery className="h-4 w-4" />} label="Battery" value={`${drone.battery.toFixed(0)}%`} />
                    <StatTile icon={<Zap className="h-4 w-4" />} label="Health" value={`${drone.healthScore}`} />
                    <StatTile icon={<Gauge className="h-4 w-4" />} label="Speed" value={`${drone.speed.toFixed(1)} m/s`} />
                    <StatTile icon={<Mountain className="h-4 w-4" />} label="Altitude" value={`${drone.altitude} m`} />
                    <StatTile icon={<Signal className="h-4 w-4" />} label="Signal" value={`${drone.signal}%`} />
                    <StatTile icon={<Thermometer className="h-4 w-4" />} label="Temp" value={`${drone.temperature}°C`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Section title="Live Status" icon={<ActivityIcon className="h-4 w-4" />} className="lg:col-span-2">
                        <BatteryBar value={drone.battery} className="mb-4" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                            <KV label="Mission" value={drone.mission} />
                            <KV label="Operator" value={drone.operator} icon={<User className="h-3.5 w-3.5" />} />
                            <KV label="Payload" value={drone.payload} />
                            <KV label="Camera" value={drone.camera} />
                            <KV label="Coordinates" value={`${drone.lat.toFixed(5)}, ${drone.lng.toFixed(5)}`} icon={<MapPin className="h-3.5 w-3.5" />} />
                            <KV label="Heading" value={`${drone.heading}°`} />
                            <KV label="Flight Time (today)" value={`${drone.flightTimeToday} min`} icon={<Clock className="h-3.5 w-3.5" />} />
                            <KV label="Lifetime Hours" value={`${drone.flightHours} h`} />
                            <KV label="Battery Cycles" value={drone.batteryCycles} />
                        </div>
                    </Section>
                    <Section title="Location" icon={<MapPin className="h-4 w-4" />}>
                        <div className="h-56 -mx-4 -mb-4">
                            <MapPanel drones={[drone]} height="100%" />
                        </div>
                    </Section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section title="Specifications" icon={<Cpu className="h-4 w-4" />}>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <KV label="Manufacturer" value={drone.manufacturer} />
                            <KV label="Model" value={drone.model} />
                            <KV label="Weight" value={`${drone.weight} g`} />
                            <KV label="Max Speed" value={`${drone.maxSpeed} m/s`} />
                            <KV label="Max Altitude" value={`${drone.maxAltitude} m`} />
                            <KV label="Max Range" value={`${drone.maxRange} km`} />
                            <KV label="Purchased" value={formatDate(drone.purchaseDate)} />
                            <KV label="Serial" value={drone.serial} />
                        </div>
                    </Section>

                    <Section title="Battery Health" icon={<Battery className="h-4 w-4" />}>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-semibold tabular-nums">{Math.max(60, 100 - drone.batteryCycles / 8).toFixed(0)}%</span>
                            <span className="text-xs text-muted-foreground">estimated capacity retention</span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                            <MiniStat label="Cycles" value={drone.batteryCycles} />
                            <MiniStat label="Current" value={`${drone.battery.toFixed(0)}%`} />
                            <MiniStat label="Temp" value={`${drone.temperature}°C`} />
                        </div>
                    </Section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section title="Components" icon={<Cpu className="h-4 w-4" />}>
                        <ul className="divide-y divide-border">
                            {drone.components.map((c) => (
                                <li key={c.name} className="flex items-center gap-3 py-2 text-sm">
                                    <span className="w-40 shrink-0 text-foreground">{c.name}</span>
                                    <div className="flex-1"><BatteryBar value={c.health} /></div>
                                    <span className="text-xs text-muted-foreground w-28 text-right">Replaced {formatDate(c.lastReplaced)}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section title="Maintenance History" icon={<Wrench className="h-4 w-4" />}>
                        <ul className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                            {drone.maintenanceHistory.map((m) => (
                                <li key={m.id} className="rounded-md border border-border p-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{m.type}</span>
                                        <span className="text-[11px] text-muted-foreground">{formatDate(m.date)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{m.technician} · {m.notes}</div>
                                </li>
                            ))}
                        </ul>
                    </Section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section title="Recent Flights" icon={<ActivityIcon className="h-4 w-4" />}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                                    <th className="text-left font-medium py-2">Date</th>
                                    <th className="text-left font-medium py-2">Mission</th>
                                    <th className="text-right font-medium py-2">Duration</th>
                                    <th className="text-right font-medium py-2">Distance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drone.recentFlights.map((f) => (
                                    <tr key={f.id} className="border-b border-border/50 last:border-0">
                                        <td className="py-2 text-muted-foreground">{formatDate(f.date)}</td>
                                        <td className="py-2">{f.mission}</td>
                                        <td className="py-2 text-right tabular-nums">{f.duration} min</td>
                                        <td className="py-2 text-right tabular-nums">{f.distance} km</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Section>

                    <Section title="Telemetry" icon={<Radio className="h-4 w-4" />}>
                        <Telemetry drone={drone} />
                    </Section>
                </div>

                <Section title="Firmware & Notes" icon={<Cpu className="h-4 w-4" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <KV label="Current" value={drone.firmware} />
                        <KV label="Last Update" value={formatDate(drone.lastMaintenance)} />
                        <KV label="Next Scheduled Service" value={formatDate(drone.nextMaintenance)} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{drone.notes}</p>
                </Section>
            </div>
        </AppShell>
    );
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                {icon}{label}
            </div>
            <div className="mt-1 text-xl font-semibold tabular-nums tracking-tight">{value}</div>
        </div>
    );
}

function Section({ title, icon, children, className = "" }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`rounded-lg border border-border bg-card ${className}`}>
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="text-muted-foreground">{icon}</span>
                <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <div className="p-4">{children}</div>
        </section>
    );
}

function KV({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">{icon}{label}</span>
            <span className="text-sm text-foreground truncate">{value}</span>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-md border border-border p-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className="text-sm font-semibold tabular-nums mt-0.5">{value}</div>
        </div>
    );
}

function Telemetry({ drone }: { drone: Drone }) {
    const rows: [string, string][] = [
        ["Latitude", drone.lat.toFixed(6)],
        ["Longitude", drone.lng.toFixed(6)],
        ["Altitude", `${drone.altitude} m`],
        ["Speed", `${drone.speed.toFixed(2)} m/s`],
        ["Heading", `${drone.heading}°`],
        ["Signal", `${drone.signal}%`],
        ["Battery", `${drone.battery.toFixed(1)}%`],
        ["Temperature", `${drone.temperature}°C`],
        ["Firmware", drone.firmware],
        ["Last packet", formatRelative(drone.lastUpdated)],
    ];
    return (
        <div className="font-mono text-xs rounded-md bg-surface border border-border p-3 max-h-72 overflow-y-auto scrollbar-thin">
            {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-border/40 last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground">{v}</span>
                </div>
            ))}
        </div>
    );
}
