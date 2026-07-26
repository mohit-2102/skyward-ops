# ARCHITECTURE.md

> This document defines the architecture of the Drone Fleet Management Dashboard.
> Any new feature should follow this architecture unless there is a strong engineering reason to change it.

---

# High-Level Architecture

The application consists of two independent applications.

```
Frontend (Next.js)
        │
        │ REST API
        ▼
Backend (Express)
        │
        │ Prisma
        ▼
 PostgreSQL

        ▲
        │
Socket.IO
```

The frontend never communicates directly with the database.

All data flows through the backend.

---

# Tech Stack

## Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Leaflet

---

## Backend

- Express
- TypeScript
- Prisma v7
- PostgreSQL
- Socket.IO
- Zod

---

# Backend Architecture

The backend follows a feature-based architecture.

```
src/

features/
config/
middleware/
lib/
types/
app.ts
server.ts
```

Each feature owns everything related to itself.

Example

```
features/

drone/

drone.routes.ts

drone.controller.ts

drone.service.ts

drone.validation.ts

drone.types.ts
```

Never mix unrelated business logic.

---

# Layer Responsibilities

## Routes

Responsibilities

- Register endpoints
- Connect middleware
- Call controllers

Nothing else.

---

## Controllers

Responsibilities

- Read request
- Validate request
- Call service
- Return response

Controllers should stay thin.

Never place business logic here.

---

## Services

Responsibilities

- Business rules
- Database operations
- Complex calculations
- Transactions

This is where the application logic lives.

---

## Prisma

Responsibilities

- Database access

Never expose Prisma directly to the frontend.

Use the shared Prisma client.

```
src/lib/prisma.ts
```

---

# Frontend Architecture

```
app/

components/

hooks/

store/

lib/

types/
```

---

# State Management

## Zustand

Use only for UI state.

Examples

Sidebar

Theme

Selected drone

Filters

---

## React Query

Use only for server state.

Examples

Drone list

Maintenance records

Analytics

Telemetry

Never duplicate server state inside Zustand.

---

# Folder Philosophy

Every folder should have a clear purpose.

Avoid utility folders becoming dumping grounds.

Avoid generic helper functions.

If a helper is only used by one feature, keep it inside that feature.

---

# Database Flow

```
Request

↓

Route

↓

Controller

↓

Service

↓

Prisma

↓

PostgreSQL
```

---

# Real-Time Flow

```
Simulator

↓

Socket.IO

↓

Frontend

↓

Dashboard updates
```

---

# Error Flow

```
Throw Error

↓

Error Middleware

↓

HTTP Response

↓

Frontend
```

Never return stack traces.

---

# Authentication (Future)

JWT

↓

Middleware

↓

Protected Routes

↓

Services

---

# Feature Development Workflow

Every new feature should follow this order.

1.

Database

↓

2.

Validation

↓

3.

Service

↓

4.

Controller

↓

5.

Route

↓

6.

Frontend Integration

↓

7.

Testing

Never skip validation.

Never start from the frontend.

---

# Coding Philosophy

Prefer simplicity.

Avoid abstractions until needed.

Optimize for maintainability.

Every architectural decision should have a clear justification.
