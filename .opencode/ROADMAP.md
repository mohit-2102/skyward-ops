# ROADMAP.md

> Living roadmap for the Drone Fleet Management Dashboard.

---

# Project Status

Current Phase

Backend Foundation

---

# Completed

## Repository

- Project initialized
- GitHub repository created
- Nested Git repository issue fixed
- Root .gitignore configured
- Environment files organized

---

## Frontend

- Lovable-generated UI migrated to Next.js
- App Router migration complete
- Fleet page
- Dashboard
- Sidebar
- Analytics
- Map
- Maintenance
- Settings

---

## Backend

- Express setup
- TypeScript
- Prisma installed
- PostgreSQL connected
- Prisma adapter configured
- Shared Prisma client created

---

# Current Milestone

Design database schema.

---

# Current Tasks

- Finalize Prisma models
- Finalize relationships
- Create migration
- Generate Prisma client
- Seed realistic data

---

# Upcoming Tasks

## Database

- Manufacturer
- Drone
- Telemetry
- Mission
- Maintenance
- Alert

---

## APIs

Drone APIs

Telemetry APIs

Maintenance APIs

Mission APIs

Analytics APIs

Alert APIs

---

## Simulator

Drone movement

Battery drain

Random alerts

GPS updates

Telemetry generation

Mission simulation

---

## Socket.IO

Live telemetry

Drone movement

Battery updates

Alerts

Mission status

---

## Frontend Integration

Connect APIs

Connect WebSockets

Replace mock data

Loading states

Error states

---

## Authentication

JWT

Roles

Permissions

Protected routes

---

## Deployment

Docker

Docker Compose

Railway

Render

CI/CD

---

# Stretch Goals

Mission planner

Flight history

Analytics dashboard

Drone health scoring

AI-powered anomaly detection

Offline support

---

# Technical Debt

None currently.

Keep migrations clean.

Avoid unnecessary abstractions.

---

# Definition of Done

Every completed feature must include

- Validation
- Error handling
- Type safety
- Responsive UI
- Documentation
- Tests (where appropriate)

---

# Next Immediate Step

Design the complete Prisma schema before implementing any business logic.

No controllers or APIs should be written until the schema is finalized.