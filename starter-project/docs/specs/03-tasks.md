# Login – Tasks

> **In what order, and how to check.** Build one task at a time, in order.
> After each task: the AI builds it → a reviewer agent tests it → **you check it
> in the browser**.
>
> If a check fails, **fix the spec first** (requirements or design), then ask
> the AI to rebuild. The requirements and design are the source of truth.
>
> These tasks are **already done** in the starter app – they show what a task
> list looks like. In Session 2, add the Leave Request tasks after Task 6.

**Core and Stretch.** **Core** tasks must be finished first: the app is not
usable without them. **Stretch** tasks are nice extras. Do them only if time is
left, and only if you ask for them. All the login tasks are Core, because login
has to work before anything else.

**Before you start:** `npm install`, then `cp .env.example .env`
(Windows: `copy .env.example .env`).

| # | Task | Core / Stretch | Checks (from requirements §4) |
|---|------|----------------|-------------------------------|
| 1 | Set up the app | Core | – |
| 2 | Database table and demo users | Core | – |
| 3 | Log in and log out | Core | AC-01, AC-02, AC-03, AC-06 |
| 4 | Role protection and home pages | Core | AC-04, AC-05, AC-07 |
| 5 | Top bar | Core | AC-08, AC-09 |
| 6 | Final check and README | Core | All |
| 7 | Leave data: table, statuses, day count | Core | – |
| 8 | Employee request list | Core | AC-14 |
| 9 | New request form and submit | Core | AC-10, AC-11, AC-12, AC-13 |
| 10 | Employee detail: Withdraw and Send to HR | Core | AC-17, AC-21, AC-23 |
| 11 | Supervisor list and decision screen | Core | AC-15, AC-16 |
| 12 | HR queue and decision screen | Core | AC-18, AC-19, AC-20 |
| 13 | Admin read-only view | Core | AC-22 |
| 14 | Final check and README | Core | All Leave (AC-10–AC-23) |

---

## Task 1 – Set up the app *(Core)*

- **Goal:** A Next.js + TypeScript app with Tailwind CSS that starts.
- **Files:** `package.json`, `next.config.ts`, `tsconfig.json`,
  `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
  (starts with `@import "tailwindcss";` – no Tailwind config file needed).
- **Check:** `npm run dev` starts, and http://localhost:3000 shows a page.

## Task 2 – Database table and demo users *(Core)*

- **Goal:** Prisma with SQLite, the `User` table from design Part A, and the
  demo users from design §6 with hashed passwords.
- **Files:** `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`,
  `src/lib/db.ts`, `src/lib/constants.ts`, `.env.example`, the `db:seed`
  script in `package.json`.
- **Check:** `npm run db:migrate` creates `prisma/dev.db`. `npm run db:seed`
  prints the 7 demo users, and `npm run db:studio` shows them.

## Task 3 – Log in and log out *(Core)*

- **Goal:** Login page, signed session cookie, and logout with a confirmation
  box. After login, go to the role's home page.
- **Files:** `src/lib/auth.ts` (`getCurrentUser`, `startSession`, `endSession`,
  `roleHome`), `src/app/actions.ts` (`loginAction`, `logoutAction`),
  `src/app/login/page.tsx`, `src/components/LoginForm.tsx`,
  `src/components/LogoutButton.tsx`, `src/components/ui/` (Button, Field,
  dialogs).
- **Check:** AC-01, AC-02, AC-03, AC-06.

## Task 4 – Role protection and home pages *(Core)*

- **Goal:** A `requireRole(...)` helper used at the top of every page, so each
  role sees only its own screens, and a home page for each role with only a short hint line.
- **Files:** `src/lib/auth.ts`, `src/app/employee/page.tsx`,
  `src/app/supervisor/page.tsx`, `src/app/hr/page.tsx`,
  `src/app/admin/page.tsx`.
- **Check:** AC-04, AC-05, AC-07.

## Task 5 – Top bar *(Core)*

- **Goal:** The top bar from design §4 (app name, who is logged in, **Log
  out**), and the **Not found** page.
- **Files:** `src/components/AppShell.tsx`, `src/components/LogoutButton.tsx`,
  `src/components/ui/`, `src/app/not-found.tsx`.
- **Check:** AC-08, AC-09.

## Task 6 – Final check and README *(Core)*

- **Goal:** Run `npm run db:seed`, then walk through the whole acceptance
  checklist as each role. Make sure `README.md` explains how to install, run
  and test.
- **Check:** Every AC box ticked; `npm run lint` and `npm run build` pass.

---

## Leave Request tasks (7–14)

Added in Session 2, after the login tasks. All are **Core**, and all are
small: one thing each, buildable and checkable in one sitting, the app
still working after each. Order = dependency: data first, then the
employee's side (the request must exist before anyone can decide on it),
then the decision makers, then the final walk-through. U14 *Filter my list*
(Stretch, AC-24) has **no task**: only if you ask, and only after every
Core task is done.

Checks come from requirements §9; screens from design §13–§14.

## Task 7 – Leave data: table, statuses, day count *(Core)*

- **Goal:** The `LeaveRequest` table from design §9 exists, with the six
  statuses and the four types as plain-text lists, and the working-days
  helper. Seed clears requests (rule 13).
- **Files:** `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`,
  `src/lib/constants.ts` (`LEAVE_TYPES`, `LEAVE_STATUSES` + labels),
  `src/lib/leave.ts` (day counting).
- **Check:** `npm run db:migrate` creates the table (visible in
  `npm run db:studio`, 0 rows). `npm run db:seed` still prints the 7 demo
  users. `npm run lint` passes. (No AC yet — there is no screen until
  Task 8.)

## Task 8 – Employee request list *(Core)*

- **Goal:** `/employee` replaces its hint line with the plain table of
  **your own** requests (Type, From–To, Days, Status; newest first), using
  `Card`, `PageHeader`, `EmptyState` and the status badge.
- **Files:** `src/app/employee/page.tsx`,
  `src/components/leave/RequestTable.tsx`,
  `src/components/leave/StatusBadge.tsx`.
- **Check:** AC-14. The top bar and login still behave (AC-01, AC-08 still
  pass on this page).

## Task 9 – New request form and submit *(Core)*

- **Goal:** `/employee/new` with the five fields from design §14; the
  supervisor dropdown lists only the employee's own division; the server
  checks dates and required fields (rule 7); confirmation box first, green
  success banner after; the row appears on `/employee`.
- **Files:** `src/app/employee/new/page.tsx`,
  `src/components/leave/LeaveRequestForm.tsx`, `src/app/actions.ts`
  (`submitLeaveRequestAction`), `src/lib/leave.ts` (submit checks).
- **Check:** AC-10, AC-11, AC-12, AC-13.

## Task 10 – Employee detail: Withdraw and Send to HR *(Core)*

- **Goal:** `/employee/requests/[id]` (reusing `RequestDetails`) shows the
  reason, remarks and deciding officer; **Withdraw** appears in the three
  open statuses; **Send to HR** only when *Signed by supervisor*; both ask
  first and show success; another employee's id → Not found.
- **Files:** `src/app/employee/requests/[id]/page.tsx`,
  `src/components/leave/RequestDetails.tsx`, `src/app/actions.ts`
  (`withdrawLeaveAction`, `sendToHrAction`).
- **Check:** AC-17, AC-21, AC-23. Table rows link to this screen.

## Task 11 – Supervisor list and decision screen *(Core)*

- **Goal:** `/supervisor` lists rows where `supervisorId` is you (columns
  add Employee); `/supervisor/requests/[id]` shows the full data and, only
  while *Awaiting supervisor*, **Sign off** or **Reject** with a required
  reason — all re-checked on the server.
- **Files:** `src/app/supervisor/page.tsx`,
  `src/app/supervisor/requests/[id]/page.tsx`, `src/app/actions.ts`
  (`supervisorSignOffAction`, `supervisorRejectAction`).
- **Check:** AC-15, AC-16.

## Task 12 – HR queue and decision screen *(Core)*

- **Goal:** `/hr` lists every request (the queue = *Awaiting HR* rows;
  columns include Decided by); `/hr/requests/[id]` lets **any** HR officer
  **Approve** or **Reject** with a required remark, records the officer,
  and leaves the other officer with no buttons (first to act wins).
- **Files:** `src/app/hr/page.tsx`, `src/app/hr/requests/[id]/page.tsx`,
  `src/app/actions.ts` (`hrApproveAction`, `hrRejectAction`).
- **Check:** AC-18, AC-19, AC-20.

## Task 13 – Admin read-only view *(Core)*

- **Goal:** `/admin` lists every request (Employee, Type, From–To, Days,
  Status, Decided by) and `/admin/requests/[id]` shows the full record —
  with no button that changes anything.
- **Files:** `src/app/admin/page.tsx`,
  `src/app/admin/requests/[id]/page.tsx`.
- **Check:** AC-22.

## Task 14 – Final check and README *(Core)*

- **Goal:** `npm run db:seed`, then walk the whole Leave checklist
  (AC-10 → AC-23) as each role, in order, so each check creates what the
  next one needs. Update `README.md`: the new screens and how to try the
  module.
- **Check:** Every Core Leave AC box ticked; `npm run lint` and
  `npm run build` pass; the login checks (AC-01–AC-09) still pass.
