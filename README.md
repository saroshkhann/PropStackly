# PropStackly V2

Multi-tenant real estate CRM SaaS for Pakistani real estate agencies.

**Status:** Batch A — frontend prototype (app shell + dashboard) on typed demo data. No backend, auth, database,
billing, or trial enforcement yet. See [CLAUDE.md](CLAUDE.md) for product rules and architecture.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 (redirects to `/dashboard`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc --noEmit` |
| `npm run build` | Production build |
| `npm run check` | Lint, typecheck, and build in sequence |
