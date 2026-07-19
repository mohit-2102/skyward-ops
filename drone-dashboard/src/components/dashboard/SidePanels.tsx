import { useFleet } from "@/lib/fleet-store";
import { statusMeta, formatRelative } from "@/lib/drone-utils";
import { AlertTriangle, Activity, Info, XCircle } from "lucide-react";
import Link from "next/link";

export function FleetStatusPanel() {
  const { drones } = useFleet();
  const groups = (["in-flight", "available", "charging", "maintenance", "offline"] as const).map((s) => ({
    status: s,
    count: drones.filter((d) => d.status === s).length,
  }));
  const total = drones.length;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Fleet Status</h3>
        <span className="text-[11px] text-muted-foreground">{total} drones</span>
      </div>
      <div className="space-y-2.5">
        {groups.map(({ status, count }) => {
          const m = statusMeta(status);
          const pct = total ? (count / total) * 100 : 0;
          return (
            <div key={status}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                  <span className="text-foreground">{m.label}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">{count}</span>
              </div>
              <div className="h-1 rounded-full bg-surface overflow-hidden">
                <div className={`h-full ${m.dot}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RecentActivityPanel() {
  const { activity } = useFleet();
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="max-h-72 overflow-y-auto scrollbar-thin">
        {activity.slice(0, 10).map((a) => (
          <Link
            key={a.id}
            href={`/fleet/${a.droneId}`}
            className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface/60 transition-colors border-b border-border/50 last:border-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-info mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-foreground truncate">
                <span className="font-mono text-muted-foreground mr-1.5">{a.droneId}</span>
                {a.action}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{formatRelative(a.time)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CriticalAlertsPanel() {
  const { alerts } = useFleet();
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Critical Alerts</h3>
        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
      </div>
      <div className="max-h-72 overflow-y-auto scrollbar-thin">
        {alerts.slice(0, 8).map((a) => {
          const Icon = a.severity === "critical" ? XCircle : a.severity === "warning" ? AlertTriangle : Info;
          const color =
            a.severity === "critical" ? "text-destructive" : a.severity === "warning" ? "text-warning" : "text-info";
          return (
            <Link
              key={a.id}
              href={`/fleet/${a.droneId}`}
              className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface/60 transition-colors border-b border-border/50 last:border-0"
            >
              <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground">
                  <span className="font-mono text-muted-foreground mr-1.5">{a.droneId}</span>
                  {a.message}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{formatRelative(a.time)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
