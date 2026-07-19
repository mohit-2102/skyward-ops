"use client";

import dynamic from "next/dynamic";
import { ClientOnly } from "@/components/shared/ClientOnly";
import type { Drone } from "@/lib/drone-types";

const DroneMap = dynamic(
  () => import("./DroneMap").then((m) => m.DroneMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-lg border border-border bg-surface grid-bg animate-pulse" />
    ),
  }
);

interface Props {
  drones: Drone[];
  height?: string | number;
}

export function MapPanel({ drones, height = 480 }: Props) {
  return (
    <ClientOnly
      fallback={
        <div
          className="w-full rounded-lg border border-border bg-surface grid-bg animate-pulse"
          style={{ height }}
        />
      }
    >
      <div style={{ height }}>
        <DroneMap drones={drones} height={height} />
      </div>
    </ClientOnly>
  );
}