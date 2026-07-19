import { useSyncExternalStore } from "react";
import type { Drone, Alert, ActivityItem } from "./drone-types";
import { INITIAL_DRONES, INITIAL_ALERTS, INITIAL_ACTIVITY } from "./mock-data";

interface State {
  drones: Drone[];
  alerts: Alert[];
  activity: ActivityItem[];
}

let state: State = {
  drones: INITIAL_DRONES,
  alerts: INITIAL_ALERTS,
  activity: INITIAL_ACTIVITY,
};

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const activityLines = [
  "Waypoint reached",
  "Altitude adjusted",
  "Signal reacquired",
  "Battery threshold hit",
  "Camera reoriented",
  "Mission checkpoint saved",
  "Wind compensation applied",
];
const alertLines: { severity: Alert["severity"]; msg: string }[] = [
  { severity: "warning", msg: "Wind gust exceeds 12 m/s" },
  { severity: "info", msg: "Return-to-home suggested (low battery projection)" },
  { severity: "critical", msg: "Obstacle detected — evasive maneuver executed" },
  { severity: "warning", msg: "Signal degradation" },
];

function tick() {
  const drones = state.drones.map((d) => {
    if (d.status !== "in-flight" && d.status !== "charging") return d;
    const jitter = (n: number) => (Math.random() - 0.5) * n;
    const battery =
      d.status === "charging"
        ? Math.min(100, d.battery + Math.random() * 1.2)
        : Math.max(0, d.battery - Math.random() * 0.6);
    const speed = d.status === "in-flight" ? Math.max(0, Math.min(d.maxSpeed, d.speed + jitter(1.5))) : 0;
    const lat = d.status === "in-flight" ? d.lat + jitter(0.0006) : d.lat;
    const lng = d.status === "in-flight" ? d.lng + jitter(0.0006) : d.lng;
    const altitude = d.status === "in-flight" ? Math.max(20, Math.min(d.maxAltitude, d.altitude + jitter(4))) : 0;
    const signal = Math.max(40, Math.min(100, d.signal + jitter(3)));
    return { ...d, battery, speed: +speed.toFixed(1), lat, lng, altitude: Math.round(altitude), signal: Math.round(signal), lastUpdated: new Date().toISOString() };
  });

  let alerts = state.alerts;
  let activity = state.activity;

  if (Math.random() < 0.5) {
    const d = drones[Math.floor(Math.random() * drones.length)]!;
    activity = [
      {
        id: `V${Date.now()}`,
        droneId: d.id,
        action: activityLines[Math.floor(Math.random() * activityLines.length)]!,
        time: new Date().toISOString(),
      },
      ...activity,
    ].slice(0, 40);
  }

  if (Math.random() < 0.18) {
    const d = drones[Math.floor(Math.random() * drones.length)]!;
    const a = alertLines[Math.floor(Math.random() * alertLines.length)]!;
    alerts = [
      { id: `A${Date.now()}`, droneId: d.id, severity: a.severity, message: a.msg, time: new Date().toISOString() },
      ...alerts,
    ].slice(0, 30);
  }

  state = { drones, alerts, activity };
  emit();
}

let started = false;
export function startSimulation() {
  if (started || typeof window === "undefined") return;
  started = true;
  setInterval(tick, 2500);
}

const getSnapshot = () => state;
const getServerSnapshot = () => state;

export function useFleet() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getDroneById(id: string): Drone | undefined {
  return state.drones.find((d) => d.id === id);
}
