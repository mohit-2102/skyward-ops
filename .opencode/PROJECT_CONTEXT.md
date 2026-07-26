# PROJECT_CONTEXT.md

# Drone Fleet Management Dashboard

> Single source of truth for this project.
>
> Read this document before making architectural or implementation decisions.

---

# Project Vision

This project is a production-style Drone Fleet Management Dashboard designed to showcase professional full-stack engineering skills.

The objective is NOT to build a simple CRUD application.

The project should resemble software used by companies that monitor and manage fleets of autonomous drones.

Primary goals:

- Professional architecture
- Clean code
- Realistic backend
- Modern frontend
- Real-time updates
- Scalable design
- Production-quality engineering

This project is part of a portfolio intended for software engineering internships and full-time roles.

---

# Core Principles

Whenever writing code, follow these principles.

1. Readability over cleverness.

2. Keep functions small.

3. Single Responsibility Principle.

4. Strong typing.

5. Avoid duplication.

6. Feature-first organization.

7. Business logic belongs in services.

8. Controllers should stay thin.

9. Never over-engineer.

10. Always optimize for maintainability.

---

# Technology Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Leaflet
- Lucide Icons

Routing:

Next.js App Router

NOT React Router.

NOT TanStack Router.

---

## Backend

- Express.js
- TypeScript
- Prisma v7
- PostgreSQL
- Socket.IO
- Zod

No NestJS.

No FastAPI.

---

# Database

Database:

PostgreSQL

ORM:

Prisma v7

Driver:

@prisma/adapter-pg

Native PostgreSQL driver:

pg

Prisma Client is shared through:

src/lib/prisma.ts

Datasource configuration is stored in:

prisma.config.ts

NOT inside schema.prisma.

---

# Repository Structure

Drone Next/

backend/

drone-dashboard/

docs/

README.md

.gitignore

---

Backend Structure

backend/

src/

features/

config/

middleware/

lib/

types/

app.ts

server.ts

prisma/

schema.prisma

migrations/

seed.ts

---

Frontend Structure

Next.js App Router.

Organize by:

app/

components/

hooks/

lib/

store/

types/

Do not create unnecessarily deep folder structures.

---

# Architecture

Feature-first architecture.

Each feature owns:

Routes

Controller

Service

Validation

Types

Example:

features/

drone/

drone.routes.ts

drone.controller.ts

drone.service.ts

drone.validation.ts

drone.types.ts

Never place business logic inside controllers.

---

# Coding Standards

Always:

Use async/await.

Prefer arrow functions only where appropriate.

Use descriptive variable names.

Avoid nested if statements.

Use early returns.

Keep files focused.

Avoid files over 300 lines unless justified.

Use interfaces or types appropriately.

Never use any.

Never disable TypeScript errors.

---

# Backend Guidelines

Controllers:

Only:

- Parse request
- Call service
- Return response

Nothing else.

Services:

Contain all business logic.

Validation:

Use Zod.

Database:

Only accessed through Prisma.

Never write raw SQL unless performance absolutely requires it.

---

# Frontend Guidelines

Server Components by default.

Use Client Components only when necessary.

Use Zustand for:

UI state.

Use React Query for:

Server state.

Avoid prop drilling.

Keep components reusable.

Prefer composition over inheritance.

---

# Database Design Principles

Use enums.

Use indexes where appropriate.

Avoid unnecessary nullable fields.

Always define relationships clearly.

Prefer normalization.

Use cascade behavior intentionally.

Avoid duplicated information.

Use timestamps consistently.

---

# Naming Conventions

Variables:

camelCase

Functions:

camelCase

Types:

PascalCase

Interfaces:

PascalCase

Enums:

PascalCase

Enum values:

UPPER_CASE

Database models:

PascalCase

Database columns:

camelCase

Files:

kebab-case

---

# Error Handling

Never swallow errors.

Return meaningful HTTP status codes.

Use centralized error handling middleware.

Avoid exposing internal errors.

Log unexpected failures.

---

# API Design

RESTful.

Plural resources.

Examples:

/api/drones

/api/missions

/api/maintenance

/api/alerts

/api/telemetry

Use proper HTTP verbs.

GET

POST

PATCH

DELETE

---

# Git

Follow Conventional Commits.

Examples:

feat:

fix:

docs:

refactor:

perf:

test:

chore:

---

# Current Features

Frontend Dashboard

Fleet Page

Map

Analytics

Maintenance

Settings

Sidebar

Dashboard

KPIs

Filtering

Pagination

Search

Status indicators

---

Backend Progress

Completed

✔ Express setup

✔ TypeScript

✔ PostgreSQL

✔ Prisma installation

✔ Prisma adapter

✔ prisma.config.ts

✔ Shared Prisma client

Remaining

Database schema

Migration

Seed

REST APIs

Socket.IO

Simulator

Frontend integration

Deployment

---

# Planned Database Models

Manufacturer

Drone

Telemetry

Mission

MaintenanceRecord

Alert

Relationships

Manufacturer

↓

Drone

↓

Telemetry

Mission

MaintenanceRecord

Alert

---

# Planned Enums

DroneStatus

ONLINE

OFFLINE

IN_FLIGHT

CHARGING

MAINTENANCE

MissionStatus

PLANNED

ACTIVE

COMPLETED

FAILED

ABORTED

AlertSeverity

LOW

MEDIUM

HIGH

CRITICAL

AlertType

LOW_BATTERY

GPS_SIGNAL

COMMUNICATION

SYSTEM

OBSTACLE

---

# Seed Data

Create realistic drone data.

Manufacturers:

DJI

Skydio

Autel

Parrot

Yuneec

Generate:

20–30 drones

Each with:

Random battery

Random coordinates

Random altitude

Random speed

Random status

Random firmware

Random telemetry

Dashboard should immediately feel alive.

---

# Future Features

Authentication

Role-based access

Mission planner

Drone simulator

Notifications

Historical telemetry

Charts

Live updates

WebSockets

Analytics

AI-powered anomaly detection

---

# Explicitly Avoid

Do NOT introduce Redux.

Do NOT introduce NestJS.

Do NOT introduce raw SQL.

Do NOT use any.

Do NOT over-engineer.

Do NOT create unnecessary abstractions.

Do NOT create utility functions unless reused.

Do NOT create generic repositories.

Do NOT build for imaginary future requirements.

Keep solutions simple.

---

# How Claude Should Behave

Act as a Senior Software Engineer.

Challenge poor architectural decisions.

Explain tradeoffs.

Prefer maintainability.

Suggest improvements when justified.

Do not blindly agree.

Prioritize production-quality code.

When writing code:

Think first.

Then design.

Then implement.

Never rush into coding before understanding the architecture.

---

# Current Milestone

Backend Foundation.

Current task:

Design the entire Prisma schema before implementing any API.

Goals:

Finalize models.

Finalize relationships.

Finalize enums.

Create migration.

Seed database.

Only after that should API development begin.

---

# Definition of Done

A feature is considered complete only if:

✔ Type-safe

✔ Validated

✔ Tested

✔ Documented

✔ Responsive (Frontend)

✔ Error handled

✔ Follows project architecture

✔ Uses proper naming

✔ No unnecessary code

✔ Ready for production
