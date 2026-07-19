import type { DroneStatus } from "./drone-types";

export function statusMeta(status: DroneStatus): { label: string; color: string; hex: string; dot: string } {
  switch (status) {
    case "in-flight":
      return { label: "In Flight", color: "text-info", hex: "#4aa3ff", dot: "bg-info" };
    case "available":
      return { label: "Available", color: "text-success", hex: "#3ecf8e", dot: "bg-success" };
    case "charging":
      return { label: "Charging", color: "text-warning", hex: "#f5b74a", dot: "bg-warning" };
    case "maintenance":
      return { label: "Maintenance", color: "text-destructive", hex: "#ff6b6b", dot: "bg-destructive" };
    case "offline":
      return { label: "Offline", color: "text-muted-foreground", hex: "#6b7280", dot: "bg-muted-foreground" };
  }
}

export function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
