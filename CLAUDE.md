# PropStackly V2 — project context for Claude

@AGENTS.md

PropStackly is a premium, multi-tenant real estate CRM SaaS for Pakistani real estate agencies, property dealers,
builders, and sales teams. This is a new project; do not reuse code or assumptions from other projects.

## Product rules (agreed — do not re-litigate)

- **One shared SaaS app, one shared PostgreSQL database**, hosted on a single VPS initially. Never separate installs.
- Every agency is an isolated tenant. Agency owners invite and manage employees.
- New agencies get a **72-hour free trial** (`TRIAL_DURATION_HOURS` in `src/config/app.ts`). After it ends the agency
  must activate a paid subscription to keep making changes. **Expired agencies keep read-only access** until an
  admin-defined retention policy applies.
- Payments are approved **manually by the platform admin** at first; a payment gateway comes later.
- **Subscription pricing is configurable data**, never hardcoded.
- Currency **PKR** (quote prices in Lakh/Crore — see `formatPKRCompact`). Default timezone **Asia/Karachi**; design for
  per-agency timezones (`Agency.timezone`).
- Roles: Platform Super Admin (separate panel), Agency Owner, Agency Manager, Agent.

## Multi-tenancy (critical)

- Every tenant-owned record carries `agencyId` (`TenantScoped` in `src/domain/tenancy.ts`).
- Tenant authorization is enforced **on the server** — verify the session user's membership and permissions for the
  requested agency on every read and write. Never rely on frontend filtering.
- Cross-tenant access is prohibited everywhere: APIs, exports, attachments, background jobs, n8n integrations.
- Use composite unique constraints / foreign keys that include `agency_id` so cross-tenant relations are impossible.
  Evaluate PostgreSQL row-level security as defense in depth.
- Data loaders take `agencyId` explicitly (see `getDashboardData(agencyId, userId)`); keep that shape when Prisma
  replaces the mocks.

## Stack

Next.js 16 (App Router, Cache Components + Partial Prefetching enabled), React 19, TypeScript strict, Tailwind CSS v4,
shadcn/ui (Radix base, `radix-nova` style), Lucide icons, Motion, Recharts 3, TanStack Table v9, React Hook Form + Zod 4.
Planned: PostgreSQL + Prisma, Better Auth, REST route handlers + server services, Docker Compose, n8n.
Architecture is a **modular monolith** — no microservices.

Version notes:
- Next.js 16 differs from older versions; read `node_modules/next/dist/docs/` before using an unfamiliar API.
  With Cache Components: don't call `Date.now()`/`Math.random()` in server render paths; read `params` inside a
  `<Suspense>` boundary; `dynamicParams` is unavailable; redirects for `/` live in `next.config.ts`.
- TanStack Table v9 uses `useTable` + `tableFeatures(...)` (not v8's `useReactTable`). Guides ship in
  `node_modules/@tanstack/*-table/skills/`.
- shadcn components import `cn` from the `cn` package; app code imports it from `@/lib/utils`.

## Folder structure

```
src/
  app/                    routes only — thin pages that load data and render feature views
    (workspace)/          authenticated agency workspace (shell layout, dashboard, planned modules)
  components/
    ui/                   shadcn primitives (generated; edit sparingly)
    layout/               app shell: sidebar, top bar, menus, trial status
    shared/               reusable product components (SectionCard, StatusBadge, EmptyState, …)
    charts/               chart chrome shared across features (tooltip, legend, sparkline)
  config/                 app constants and navigation
  domain/                 framework-free types and business rules (tenancy, trial, leads, deals, …)
  features/<module>/      feature slices: components/, data/ (loaders + read models), lib/ (pure logic)
  mocks/                  typed, deterministic demo data (replaced by Prisma later)
  lib/                    formatting, demo helpers, utils
```

Keep domain logic out of components: compute in `domain/` or `features/*/lib/`, render in components.

Module conventions (follow for new modules):
- `features/<module>/data/` — `get-*.ts` read models taking `agencyId` first, plus `types.ts` for list/detail shapes.
- `features/<module>/lib/` — filters, metrics, and Zod form schemas (`z.input`/`z.output` with `zodResolver`).
- Forms use React Hook Form + `FormField` (label, hint, error, aria wiring) and `useWatch` (not `watch`).
- Tables use TanStack Table v9 `useTable` with explicit `tableFeatures`; filtering happens before data reaches the
  table; facet filters use `FacetFilter`; overview KPIs use `StatCard`.
- Dynamic routes: `generateStaticParams` from the read model, read `params` inside `<Suspense>`, `notFound()` for ids
  outside the agency, plus `loading.tsx`, `error.tsx` (`RouteError`), and `not-found.tsx`.

## Design system

- Premium **light theme by default**. Tokens live in `src/app/globals.css` (`:root`): ink-navy brand, cool neutrals,
  semantic `success | warning | danger | info` with `-soft` variants, `shadow-card` / `shadow-raised`.
- Charts use the validated categorical slots `--chart-1` (blue), `--chart-2` (orange), `--chart-3` (aqua) in that
  fixed order. Single-series charts use `--chart-1`. One y-axis only; hairline solid grid; value-led tooltips;
  every chart has a legend (≥2 series) and an `sr-only` data table.
- Status is never colour-only: badges carry text, meters carry labels.
- Avoid heavy gradients, decorative motion, and generic admin-template styling. Entrance animation is CSS-only so
  server HTML is visible before hydration; respect `prefers-reduced-motion`.
- Responsive: mobile sheet nav < `md`, icon rail `md`–`lg`, full collapsible sidebar ≥ `lg`; multi-column dashboard
  rows from `xl`. No horizontal page scroll at any width.

## Prototype honesty

- Data comes from `src/mocks` relative to a frozen `DEMO_NOW` (`src/config/app.ts`). Names, phone numbers, and
  agencies are fictional — never add real customer data.
- Any UI-only action must call `notifyDemoAction()` (toast saying nothing was saved) or be visibly labelled demo /
  simulated / planned. Never imply persistence that doesn't exist.
- Interactive prototype edits (add lead/contact, assign, change status, log notes, schedule follow-ups) update local
  component state only, mark new records with `isDraft` ("Draft" / "Not saved" tags), and toast that the change resets
  on reload. Draft records have no detail page.
- Property pages share a `PropertySessionProvider` (properties layout) so drafts and edits survive client navigation
  within the module until reload. Uploaded photos are local object-URL previews only — never sent anywhere — and are
  revoked when the provider unmounts. Sample listing photos are generated artwork labelled "sample".
- Pipeline drag-and-drop uses native HTML5 DnD on `md+`; every move is also available from each card's menu (keyboard
  and touch), and phones get a one-stage-at-a-time list. Moving to Closed lost always asks for a reason.
- Tasks and site visits are the sources of truth; `ScheduleItem` (dashboard agenda, lead follow-ups, nav badge) is a
  derived read model built in `mocks/schedule.ts`. Visit outcomes can only be logged once the visit has started.
- Areas are stored with their unit (`marla | kanal | sqft | sqyd`); convert with `domain/area.ts`. `MARLA_SQFT`
  (225, Lahore society standard) lives in `config/app.ts` and will become an agency setting.
- Phone, WhatsApp, and email quick actions use `ContactActions`, which explains the integration isn't connected and
  offers to log the interaction instead. Never open `tel:`/`wa.me` links with demo data.

## Workflow

- Build in batches; **stop after each batch for review** and wait for explicit approval before the next module.
  Done: Batch A (shell + dashboard), Batch B (leads + contacts), Batch C (properties), Batch D (pipeline, tasks,
  site visits).
- Before finishing work run `npm run check` (lint → typecheck → production build) and fix what you broke.
- Commit only when asked.
