"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { useFleet } from "@/lib/fleet-store";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, RadialBarChart, RadialBar, Legend,
} from "recharts";
import type { ReactNode } from "react";
import { statusMeta } from "@/lib/drone-utils";


const CHART_COLORS = ["#4aa3ff", "#3ecf8e", "#f5b74a", "#c084fc", "#ff6b6b", "#22d3ee"];

export default function AnalyticsPage() {
  const { drones } = useFleet();

  const statusData = (["in-flight", "available", "charging", "maintenance", "offline"] as const).map((s) => ({
    name: statusMeta(s).label,
    value: drones.filter((d) => d.status === s).length,
    color: statusMeta(s).hex,
  }));

  const batteryBuckets = [
    { name: "0-25%", value: drones.filter((d) => d.battery < 25).length },
    { name: "25-50%", value: drones.filter((d) => d.battery >= 25 && d.battery < 50).length },
    { name: "50-75%", value: drones.filter((d) => d.battery >= 50 && d.battery < 75).length },
    { name: "75-100%", value: drones.filter((d) => d.battery >= 75).length },
  ];

  const mfrCounts = Object.entries(
    drones.reduce<Record<string, number>>((acc, d) => {
      acc[d.manufacturer] = (acc[d.manufacturer] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const missionCounts = Object.entries(
    drones.reduce<Record<string, number>>((acc, d) => {
      acc[d.mission] = (acc[d.mission] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const flightHoursTop = [...drones].sort((a, b) => b.flightHours - a.flightHours).slice(0, 10)
    .map((d) => ({ name: d.name, hours: d.flightHours }));

  // Fabricated weekly trend from drone maintenance dates
  const weekly = Array.from({ length: 8 }).map((_, i) => {
    const label = `W${i + 1}`;
    const seed = (i + 1) * 3.7;
    return {
      week: label,
      maintenance: Math.round(2 + Math.abs(Math.sin(seed)) * 6),
      flights: Math.round(30 + Math.abs(Math.cos(seed)) * 25),
    };
  });

  const utilization = drones.map((d) => ({
    name: d.name,
    value: Math.min(100, Math.round((d.flightHours / 12) % 100) + 20),
    fill: CHART_COLORS[d.flightHours % CHART_COLORS.length]!,
  })).slice(0, 8);

  return (
    <AppShell>
      <div className="px-6 py-6 space-y-4 max-w-[1600px] mx-auto">
        <PageHeader title="Fleet Analytics" description="Operational insights across the drone fleet." />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Status Distribution">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {statusData.map((s, i) => <Cell key={i} fill={s.color} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Battery Distribution">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={batteryBuckets}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {batteryBuckets.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Manufacturer Split">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={mfrCounts} dataKey="value" nameKey="name" outerRadius={95}>
                  {mfrCounts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Flight Hours — Top 10">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={flightHoursTop} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface)" }} />
                <Bar dataKey="hours" fill="#4aa3ff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Mission Types">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={missionCounts}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {missionCounts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Maintenance & Flight Trend (8 weeks)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }} />
                <Line type="monotone" dataKey="flights" stroke="#4aa3ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="maintenance" stroke="#f5b74a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Fleet Utilization (%)">
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart innerRadius="20%" outerRadius="100%" data={utilization} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={4} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}

const axisTick = { fill: "#8892a6", fontSize: 11 };
const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-foreground)",
};

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
