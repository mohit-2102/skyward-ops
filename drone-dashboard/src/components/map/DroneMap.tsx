"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { Drone } from "@/lib/drone-types";
import { statusMeta, formatRelative } from "@/lib/drone-utils";
import { CAMPUS_CENTER } from "@/lib/mock-data";
import { BatteryBar } from "@/components/shared/BatteryBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Signal, Gauge, Mountain, User, Radio } from "lucide-react";

function droneIcon(hex: string, inFlight: boolean) {
  const html = `
    <div class="drone-marker ${inFlight ? "drone-pulse" : ""}" style="color:${hex};background:${hex};width:18px;height:18px;position:relative">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v6M12 16v6M2 12h6M16 12h6"/>
      </svg>
    </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

interface Props {
  drones: Drone[];
  height?: string | number;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function DroneMap({ drones, height = "100%", selectedId, onSelect }: Props) {
  const icons = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    (["in-flight", "available", "charging", "maintenance", "offline"] as const).forEach((s) => {
      const m = statusMeta(s);
      map.set(s, droneIcon(m.hex, s === "in-flight"));
    });
    return map;
  }, []);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border" style={{ height }}>
      <MapContainer
        center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
        zoom={16}
        scrollWheelZoom
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
          radius={900}
          pathOptions={{ color: "#4aa3ff", weight: 1, opacity: 0.4, fillOpacity: 0.03 }}
        />
        {drones.map((d) => {
          const m = statusMeta(d.status);
          return (
            <Marker
              key={d.id}
              position={[d.lat, d.lng]}
              icon={icons.get(d.status)!}
              eventHandlers={{ click: () => onSelect?.(d.id) }}
            >
              <Popup>
                <div className="p-0 min-w-[280px] font-sans">
                  <div className="flex items-center gap-3 p-3 border-b border-border bg-surface">
                    <div
                      className="h-11 w-11 rounded-md grid place-items-center border"
                      style={{ borderColor: m.hex, color: m.hex, background: `${m.hex}15` }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <circle cx="12" cy="12" r="2.5" />
                        <circle cx="5" cy="5" r="2" />
                        <circle cx="19" cy="5" r="2" />
                        <circle cx="5" cy="19" r="2" />
                        <circle cx="19" cy="19" r="2" />
                        <path d="M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{d.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {d.manufacturer} · {d.model}
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <BatteryBar value={d.battery} />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
                      <Row icon={<Gauge className="h-3 w-3" />} label="Speed" value={`${d.speed.toFixed(1)} m/s`} />
                      <Row icon={<Mountain className="h-3 w-3" />} label="Altitude" value={`${d.altitude} m`} />
                      <Row icon={<Signal className="h-3 w-3" />} label="Signal" value={`${d.signal}%`} />
                      <Row icon={<Radio className="h-3 w-3" />} label="Firmware" value={d.firmware} />
                      <Row icon={<User className="h-3 w-3" />} label="Operator" value={d.operator} />
                      <Row icon={<Signal className="h-3 w-3" />} label="Mission" value={d.mission} />
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Updated {formatRelative(d.lastUpdated)}
                      </span>
                      <Link
                        href={`/fleet/${d.id}`}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Open details →
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {selectedId && <div className="hidden">{selectedId}</div>}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground w-16">{label}</span>
      <span className="text-foreground font-medium truncate">{value}</span>
    </div>
  );
}
