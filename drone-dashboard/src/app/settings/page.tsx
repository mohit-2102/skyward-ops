"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";



export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "system">("dark");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite" | "light">("dark");
  const [autoCenter, setAutoCenter] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifWarning, setNotifWarning] = useState(true);
  const [notifInfo, setNotifInfo] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);

  return (
    <AppShell>
      <div className="px-6 py-6 space-y-4 max-w-4xl mx-auto">
        <PageHeader title="Settings" description="Console preferences and notification rules." />

        <SettingsGroup title="Appearance">
          <Row label="Theme" description="Interface color scheme.">
            <Segmented value={theme} onChange={setTheme} options={[{ v: "dark", l: "Dark" }, { v: "system", l: "System" }]} />
          </Row>
        </SettingsGroup>

        <SettingsGroup title="Units">
          <Row label="Measurement System" description="Applied to speed, altitude and range.">
            <Segmented value={units} onChange={setUnits} options={[{ v: "metric", l: "Metric" }, { v: "imperial", l: "Imperial" }]} />
          </Row>
        </SettingsGroup>

        <SettingsGroup title="Map Preferences">
          <Row label="Tile Style">
            <Segmented value={mapStyle} onChange={setMapStyle} options={[{ v: "dark", l: "Dark" }, { v: "light", l: "Light" }, { v: "satellite", l: "Satellite" }]} />
          </Row>
          <Row label="Auto-center on active drone" description="Recenter the map to follow selected drone.">
            <Switch checked={autoCenter} onCheckedChange={setAutoCenter} />
          </Row>
          <Row label="Show telemetry overlay" description="Display live speed, altitude and battery labels.">
            <Switch checked={showTelemetry} onCheckedChange={setShowTelemetry} />
          </Row>
        </SettingsGroup>

        <SettingsGroup title="Notifications">
          <Row label="Critical alerts" description="Battery, GPS lock loss, collision events.">
            <Switch checked={notifCritical} onCheckedChange={setNotifCritical} />
          </Row>
          <Row label="Warnings" description="Signal, wind, temperature thresholds.">
            <Switch checked={notifWarning} onCheckedChange={setNotifWarning} />
          </Row>
          <Row label="Informational" description="Firmware, scheduled maintenance, mission completion.">
            <Switch checked={notifInfo} onCheckedChange={setNotifInfo} />
          </Row>
          <Row label="Daily email digest" description="A summary of fleet activity delivered every morning.">
            <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
          </Row>
        </SettingsGroup>

        <div className="text-[11px] text-muted-foreground text-center pt-2">
          Skyward Ops Console · Build 2026.7.18 · Preferences saved locally to this session.
        </div>
      </div>
    </AppShell>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <div className="text-sm text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`px-3 h-7 text-xs rounded ${value === o.v ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
