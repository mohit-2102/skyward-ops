# CODING_GUIDELINES.md

---

# General Rules

- Write production-quality code.
- Prioritize readability.
- Avoid clever code.
- Keep functions focused.
- Prefer explicit over implicit behavior.

---

# TypeScript

- Never use any.
- Prefer strict typing.
- Use enums where appropriate.
- Use interfaces/types consistently.
- Let TypeScript infer types where obvious.

---

# Express

- Thin controllers.
- Business logic belongs in services.
- Validation before services.
- Centralized error handling.
- Consistent HTTP responses.

---

# Prisma

- Use Prisma Client only.
- Avoid raw SQL unless justified.
- Use transactions when needed.
- Prefer relations over duplicated data.
- Add indexes where appropriate.

---

# React

- Server Components first.
- Client Components only when necessary.
- Prefer composition.
- Avoid deeply nested props.
- Build reusable UI.

---

# Zustand

Only for UI state.

Never store API data.

---

# React Query

Only for server state.

Do not duplicate cache.

---

# Naming

Files

kebab-case

Components

PascalCase

Functions

camelCase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

Enums

PascalCase

Enum Values

UPPER_CASE

---

# Comments

Explain why.

Not what.

Bad

// Increment i

Good

// Retry because the drone may temporarily lose connectivity

---

# Code Reviews

Always consider

- Performance
- Security
- Scalability
- Readability
- Maintainability

before accepting a solution.

---

# Philosophy

Every line of code should have a purpose.

If something feels unnecessarily complicated, simplify it.