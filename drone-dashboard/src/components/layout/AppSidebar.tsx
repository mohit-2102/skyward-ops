import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Map as MapIcon,
  BarChart3,
  Wrench,
  Settings,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/fleet", label: "Fleet", icon: Boxes },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
          <Plane className="h-4 w-4" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Skyward Ops</div>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Fleet Console</div>
        </div>
      </div>
      <nav className="flex-1 px-2.5 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 mx-3 mb-4 rounded-md bg-sidebar-accent/60 border border-sidebar-border">
        <div className="flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-foreground font-medium">Telemetry stream</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">Live · IIT Bombay Airspace</div>
      </div>
    </aside>
  );
}
