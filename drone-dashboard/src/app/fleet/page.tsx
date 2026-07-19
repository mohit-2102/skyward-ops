"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FleetTable } from "@/components/fleet/FleetTable";
import { useFleet } from "@/lib/fleet-store";
import type { DroneStatus, Manufacturer, PayloadType, CameraType } from "@/lib/drone-types";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";


type SortKey = "name" | "battery" | "health" | "flightHours";
const PAGE_SIZE = 10;

export default function FleetPage() {
  const { drones } = useFleet();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<DroneStatus | "">("");
  const [mfr, setMfr] = useState<Manufacturer | "">("");
  const [payload, setPayload] = useState<PayloadType | "">("");
  const [camera, setCamera] = useState<CameraType | "">("");
  const [minBattery, setMinBattery] = useState(0);
  const [sort, setSort] = useState<SortKey>("name");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const filtered = drones.filter((d) => {
      if (q && !`${d.id} ${d.name} ${d.model} ${d.operator}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (status && d.status !== status) return false;
      if (mfr && d.manufacturer !== mfr) return false;
      if (payload && d.payload !== payload) return false;
      if (camera && d.camera !== camera) return false;
      if (d.battery < minBattery) return false;
      return true;
    });
    filtered.sort((a, b) => {
      const v = (x: typeof a) =>
        sort === "name" ? x.name : sort === "battery" ? x.battery : sort === "health" ? x.healthScore : x.flightHours;
      const av = v(a);
      const bv = v(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return dir === "asc" ? cmp : -cmp;
    });
    return filtered;
  }, [drones, q, status, mfr, payload, camera, minBattery, sort, dir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const clear = () => {
    setQ(""); setStatus(""); setMfr(""); setPayload(""); setCamera(""); setMinBattery(0);
  };

  return (
    <AppShell>
      <div className="px-6 py-6 space-y-5 max-w-[1600px] mx-auto">
        <PageHeader
          title="Fleet Registry"
          description={`${filtered.length} of ${drones.length} drones · sorted by ${sort} (${dir})`}
        />

        <div className="rounded-lg border border-border bg-card p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search by ID, model, operator…"
              className="w-full h-9 pl-9 pr-3 rounded-md bg-surface border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <FilterSelect label="Status" value={status} onChange={(v) => { setStatus(v as DroneStatus | ""); setPage(1); }}
            options={["in-flight", "available", "charging", "maintenance", "offline"]} />
          <FilterSelect label="Manufacturer" value={mfr} onChange={(v) => { setMfr(v as Manufacturer | ""); setPage(1); }}
            options={["DJI", "Skydio", "Autel", "Parrot", "Freefly", "Wingtra"]} />
          <FilterSelect label="Payload" value={payload} onChange={(v) => { setPayload(v as PayloadType | ""); setPage(1); }}
            options={["Mapping", "Inspection", "Delivery", "Surveillance", "Research", "Photogrammetry"]} />
          <FilterSelect label="Camera" value={camera} onChange={(v) => { setCamera(v as CameraType | ""); setPage(1); }}
            options={["RGB 4K", "Thermal + RGB", "Multispectral", "LiDAR", "Cinema 6K", "Zoom 200x"]} />
          <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-surface border border-border text-xs">
            <span className="text-muted-foreground">Min Battery</span>
            <input
              type="range" min={0} max={100} value={minBattery}
              onChange={(e) => { setMinBattery(Number(e.target.value)); setPage(1); }}
              className="accent-primary w-24"
            />
            <span className="tabular-nums text-foreground w-8 text-right">{minBattery}%</span>
          </div>
          <FilterSelect label="Sort" value={sort} onChange={(v) => setSort(v as SortKey)}
            options={["name", "battery", "health", "flightHours"]} noEmpty />
          <button
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="h-9 px-3 rounded-md bg-surface border border-border text-xs hover:bg-surface-elevated"
          >
            {dir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
          <button
            onClick={clear}
            className="h-9 px-3 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        </div>

        <FleetTable drones={pageItems} />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {current} of {totalPages} · {filtered.length} results
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={current === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 grid place-items-center rounded-md border border-border disabled:opacity-40 hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={current === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 grid place-items-center rounded-md border border-border disabled:opacity-40 hover:bg-surface"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function FilterSelect({
  label, value, onChange, options, noEmpty,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; noEmpty?: boolean }) {
  return (
    <label className="flex items-center gap-2 h-9 px-3 rounded-md bg-surface border border-border text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-foreground focus:outline-none cursor-pointer capitalize"
      >
        {!noEmpty && <option value="" className="bg-card">All</option>}
        {options.map((o) => (
          <option key={o} value={o} className="bg-card">{o}</option>
        ))}
      </select>
    </label>
  );
}
