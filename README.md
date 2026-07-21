
```
Drone Next
├─ backend
│  ├─ .env.example
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ prisma
│  │  ├─ helpers
│  │  │  ├─ constants.ts
│  │  │  ├─ generators.ts
│  │  │  └─ random.ts
│  │  ├─ migrations
│  │  │  ├─ 20260720072400_init
│  │  │  │  └─ migration.sql
│  │  │  └─ migration_lock.toml
│  │  ├─ schema.prisma
│  │  ├─ seed.ts
│  │  └─ seeds
│  │     ├─ alerts.ts
│  │     ├─ drones.ts
│  │     ├─ maintenance.ts
│  │     ├─ manufacturers.ts
│  │     ├─ missions.ts
│  │     └─ telemetry.ts
│  ├─ prisma.config.ts
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ config
│  │  ├─ features
│  │  │  └─ drone
│  │  │     ├─ drone.controller.ts
│  │  │     ├─ drone.mapper.ts
│  │  │     ├─ drone.routes.ts
│  │  │     ├─ drone.service.ts
│  │  │     ├─ drone.types.ts
│  │  │     ├─ drone.validation.ts
│  │  │     └─ index.ts
│  │  ├─ lib
│  │  │  └─ prisma.ts
│  │  ├─ middleware
│  │  │  └─ errorHandler.ts
│  │  ├─ server.ts
│  │  ├─ simulator
│  │  ├─ test-db.ts
│  │  └─ types
│  └─ tsconfig.json
└─ drone-dashboard
   ├─ .env.example
   ├─ AGENTS.md
   ├─ CLAUDE.md
   ├─ eslint.config.mjs
   ├─ next.config.ts
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.mjs
   ├─ public
   │  ├─ file.svg
   │  ├─ globe.svg
   │  ├─ next.svg
   │  ├─ vercel.svg
   │  └─ window.svg
   ├─ README.md
   ├─ src
   │  ├─ app
   │  │  ├─ analytics
   │  │  │  └─ page.tsx
   │  │  ├─ favicon.ico
   │  │  ├─ fleet
   │  │  │  ├─ page.tsx
   │  │  │  └─ [id]
   │  │  │     └─ page.tsx
   │  │  ├─ globals.css
   │  │  ├─ layout.tsx
   │  │  ├─ maintenance
   │  │  │  └─ page.tsx
   │  │  ├─ map
   │  │  │  └─ page.tsx
   │  │  ├─ page.tsx
   │  │  ├─ providers.tsx
   │  │  └─ settings
   │  │     └─ page.tsx
   │  ├─ components
   │  │  ├─ dashboard
   │  │  │  └─ SidePanels.tsx
   │  │  ├─ fleet
   │  │  │  └─ FleetTable.tsx
   │  │  ├─ layout
   │  │  │  ├─ AppShell.tsx
   │  │  │  ├─ AppSidebar.tsx
   │  │  │  └─ Topbar.tsx
   │  │  ├─ map
   │  │  │  ├─ DroneMap.tsx
   │  │  │  └─ MapPanel.tsx
   │  │  ├─ shared
   │  │  │  ├─ BatteryBar.tsx
   │  │  │  ├─ ClientOnly.tsx
   │  │  │  ├─ KpiCard.tsx
   │  │  │  ├─ PageHeader.tsx
   │  │  │  └─ StatusBadge.tsx
   │  │  └─ ui
   │  │     ├─ accordion.tsx
   │  │     ├─ alert-dialog.tsx
   │  │     ├─ alert.tsx
   │  │     ├─ aspect-ratio.tsx
   │  │     ├─ avatar.tsx
   │  │     ├─ badge.tsx
   │  │     ├─ breadcrumb.tsx
   │  │     ├─ button.tsx
   │  │     ├─ calendar.tsx
   │  │     ├─ card.tsx
   │  │     ├─ carousel.tsx
   │  │     ├─ chart.tsx
   │  │     ├─ checkbox.tsx
   │  │     ├─ collapsible.tsx
   │  │     ├─ command.tsx
   │  │     ├─ context-menu.tsx
   │  │     ├─ dialog.tsx
   │  │     ├─ drawer.tsx
   │  │     ├─ dropdown-menu.tsx
   │  │     ├─ form.tsx
   │  │     ├─ hover-card.tsx
   │  │     ├─ input-otp.tsx
   │  │     ├─ input.tsx
   │  │     ├─ label.tsx
   │  │     ├─ menubar.tsx
   │  │     ├─ navigation-menu.tsx
   │  │     ├─ pagination.tsx
   │  │     ├─ popover.tsx
   │  │     ├─ progress.tsx
   │  │     ├─ radio-group.tsx
   │  │     ├─ resizeable.tsx
   │  │     ├─ scroll-area.tsx
   │  │     ├─ select.tsx
   │  │     ├─ separator.tsx
   │  │     ├─ sheet.tsx
   │  │     ├─ sidebar.tsx
   │  │     ├─ skeleton.tsx
   │  │     ├─ slider.tsx
   │  │     ├─ sonner.tsx
   │  │     ├─ switch.tsx
   │  │     ├─ table.tsx
   │  │     ├─ tabs.tsx
   │  │     ├─ text-area.tsx
   │  │     ├─ toggle-group.tsx
   │  │     ├─ toggle.tsx
   │  │     └─ tooltip.tsx
   │  ├─ hooks
   │  │  └─ use-mobile.tsx
   │  └─ lib
   │     ├─ drone-types.ts
   │     ├─ drone-utils.ts
   │     ├─ error-capture.ts
   │     ├─ error-page.ts
   │     ├─ fleet-store.ts
   │     ├─ lovable-error-reporting.ts
   │     ├─ mock-data.ts
   │     └─ utils.ts
   └─ tsconfig.json

```