# Login – Design

> **How it is built.** This document turns the requirements into a plan a
> builder (person or AI) can follow without asking the business again.
> [01-requirements.md](01-requirements.md) is the source of truth for
> *behaviour*; if the two disagree, fix the requirements first, then this file.
>
> - **Part A – Data design** (sections 1–2): **you own and review this.**
> - **Part B – App design** (sections 3–8): the AI drafts this; you check it.

---

# Part A – Data design (you review)

## 1. Tables

The app stores data in one table so far. Every row gets a number (`id`)
automatically. The Leave Request module adds one more table – see §9 below.

### `User` – one row per person who can log in

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the user |
| `email` | text | yes, unique | Used to log in, stored in lowercase, e.g. `employee-1@budiman.com` |
| `name` | text | yes | Full name shown on screen, with the division in brackets, e.g. "Employee 1 (Finance & Administration)" |
| `passwordHash` | text | yes | Scrambled password – never the real one |
| `role` | text | yes | `EMPLOYEE`, `SUPERVISOR`, `HR` or `ADMIN` |
| `identificationNo` | text | yes | Staff ID: `00-1` then 5 digits, e.g. `00-148291` |
| `designation` | text | yes | Job title, one of the list in rule 4, e.g. `Administrative Officer` |
| `division` | text | yes | Department, one of the list in rule 4, e.g. `Finance & Administration` |
| `createdAt` | date + time | auto | When the user was created |

> **Why is role plain text?** SQLite (our database) does not support a fixed
> list of choices ("enums"). So the allowed values are listed in
> `src/lib/constants.ts`, and the app checks them.

## 2. Business rules

1. **Emails.** Every email is a company address ending in `@budiman.com`. It is
   stored in lowercase and is unique, so login ignores capitals.
2. **Passwords.** Stored only as a hash (bcrypt). A wrong email and a wrong
   password give the **same** message, so nobody can find out which emails exist.
3. **Roles.** Each user has exactly one role. The role decides which pages they
   can open (§4).
4. **Divisions and designations** are chosen from fixed lists, kept in
   `src/lib/constants.ts`:
   - **Division:** Software Development, Quality Assurance, IT Infrastructure &
     Operations, Cybersecurity, Data & Analytics, Product & Design, Customer
     Support, Human Resources, Finance & Administration, Management.
   - **Designation:** Software Engineer, QA Engineer, System Administrator,
     IT Support Technician, Data Analyst, UI/UX Designer, Team Lead, HR Officer,
     Administrative Officer, Director. The designation is only a job title;
     the role decides what someone can do.
5. **Sessions.** A login lasts 7 days on the same browser, then the user must
   log in again.

---

# Part B – App design (AI drafts, you check)

## 3. Technology

Chosen so everyone can run the app on their own laptop with no extra accounts.

| Part | Choice | In plain words |
|------|--------|----------------|
| Web framework | **Next.js** (App Router) + **TypeScript** | Builds both the screens and the server logic in one project. |
| Database | **SQLite** via **Prisma 6** | The database is a single file; Prisma lets the code read and write it. |
| Login | Signed **session cookie** | After login the browser keeps a signed note saying who you are (7 days). JavaScript on the page can't read it (`httpOnly`). |
| Passwords | **bcryptjs** | Stores a scrambled version of each password. |
| Styling | **Tailwind CSS v4** | Styles are written as class names, e.g. `text-sm`. No config file needed. |
| Buttons and forms | **Server actions** | Pressing a button calls a function on the server, which checks the user before doing anything. There are no separate `/api` routes. |

## 4. Screens (routes)

After login, each user is sent to their role's home page. Opening a page for
another role sends you back to your own home page.

| Route | Who | What it shows |
|-------|-----|---------------|
| `/` | anyone | Sends you to your home page, or to `/login`. |
| `/login` | anyone | Email and password form. A logged-in user is sent to their home page. |
| `/employee` | Employee | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/supervisor` | Supervisor | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/hr` | HR | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/admin` | Admin | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |

A page that doesn't exist shows **Not found**, with a button back to your
home page.

**Layout:** no sidebar. A top bar across every page shows the app name
(Budiman HRMS) on the left. On the right it shows who is logged in (name and
role) and a **Log out** button. On a phone it shows the user's initials
instead of the name and role. The page below the top bar is empty apart from a short hint line.

**Feedback:** **Log out** opens a confirmation box first. Errors are shown in
red above the form.

## 5. Where the code lives

| Folder / file | What's in it |
|---------------|--------------|
| `prisma/schema.prisma` | The tables from Part A. |
| `prisma/migrations/` | Steps that create the tables. |
| `prisma/seed.ts` | The demo users (§6). |
| `src/lib/constants.ts` | Roles, divisions, designations, time zone, date helpers. |
| `src/lib/auth.ts` | Login cookie, `getCurrentUser()`, `requireRole()`, `roleHome()`. |
| `src/lib/db.ts` | The single database connection. |
| `src/app/actions.ts` | Server actions: `loginAction`, `logoutAction`. |
| `src/app/login/` | The login page. |
| `src/app/<role>/` | One folder per role's screens (pages with only a hint for now). |
| `src/components/` | Screen pieces: app frame (top bar), login form and log out button. |
| `src/components/ui/` | Small building blocks used everywhere: Button, Card, PageHeader, EmptyState, Avatar, Icons, form field styles, dialogs, and the overlay page scrollbar. Use these when you build the module. |
| `src/app/globals.css` | Brand colours (the `brand-…` and `navy` colours). Change them here. |

## 6. Demo data

`npm run db:seed` deletes all users and creates:

| Email (`@budiman.com`) | Name | Role | ID no. | Designation | Division |
|----------|------|------|--------|-------------|----------|
| `employee-1@` | Employee 1 (Finance & Administration) | Employee | 00-148291 | Administrative Officer | Finance & Administration |
| `employee-2@` | Employee 2 (Software Development) | Employee | 00-173604 | Software Engineer | Software Development |
| `supervisor-1@` | Supervisor 1 (Finance & Administration) | Supervisor | 00-159827 | Team Lead | Finance & Administration |
| `supervisor-2@` | Supervisor 2 (Software Development) | Supervisor | 00-126418 | Team Lead | Software Development |
| `hr-1@` | HR 1 (Human Resources) | HR | 00-191356 | HR Officer | Human Resources |
| `hr-2@` | HR 2 (Human Resources) | HR | 00-184072 | HR Officer | Human Resources |
| `admin@` | Admin (Management) | Admin | 00-105739 | Director | Management |

All use the password `password123` (workshop only). There are two users for
each of Employee, Supervisor and HR, in different divisions, so the module you
build can be tested with more than one person per role.

## 7. Security (in plain words)

- Every page checks who is logged in and their role (`requireRole`).
- Every server action checks again on the server – hiding a button is not enough.
- The login cookie is signed with `AUTH_SECRET` from `.env`, so it can't be faked.
- Passwords are stored only as a hash.

## 8. Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the app at http://localhost:3000 |
| `npm run db:migrate` | Create or update the database tables |
| `npm run db:seed` | Reset the demo users |
| `npm run db:studio` | Open a browser view of the database |
| `npm run lint` | Check the code for common mistakes |
| `npm run build` | Check the whole app compiles |

---

# Leave Request – Design

> **How it is built.** The Leave Request counterpart of the login design
> above; section numbers continue from §8.
> [01-requirements.md](01-requirements.md) §6–§11 stays the source of truth
> for *behaviour*: if the two disagree, fix the requirements first.
>
> - **Part A – Data design** (sections 9–12): **you own this** – approved.
> - **Part B – App design** (sections 13–18): the AI drafted this; **you
>   check it.**

---

# Part A – Data design (you review)

## 9. Tables

The module adds **one** new table. No others: leave types and statuses are
fixed lists kept in `src/lib/constants.ts`, the same way roles and divisions
are (SQLite has no enums).

### `LeaveRequest` – one row per leave request

One row is **one employee's leave request**, from the moment it is submitted
until it ends as approved, rejected or withdrawn. Rows are never deleted.

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the request |
| `employeeId` | number | yes | Who submitted it – a link to `User.id` |
| `supervisorId` | number | yes | The supervisor chosen at submission – a link to `User.id`, from the employee's own division. Never changes |
| `leaveType` | text | yes | `ANNUAL`, `SICK`, `EMERGENCY` or `UNPAID` (list in `src/lib/constants.ts`) |
| `startDate` | date | yes | First day of leave, e.g. 2026-11-16 |
| `endDate` | date | yes | Last day of leave; never before `startDate` |
| `reason` | text | no | The employee's own words; may be empty |
| `status` | text | yes | One of the six statuses in §10 |
| `remarks` | text | no | The rejection reason. Only written when the request is rejected – see rule 11 |
| `hrOfficerId` | number | no | Which HR officer decided – a link to `User.id`. Only filled when HR approved or rejected |

**Days is not a field.** The tables show a Days column, but the app works the
number out from the two dates every time (weekdays Mon–Fri, both days
included). Nothing can change the dates after submission, so the number can
never go out of date.

## 10. Statuses

`status` holds one of six words. This table is also the **only** allowed
movement: a request may change status only where it says so here. The words
shown on screen are the plain ones; both lists live in
`src/lib/constants.ts`.

| Status (stored) | Shown as | How a request gets here | Where it can go next |
|-----------------|----------|--------------------------|----------------------|
| `AWAITING_SUPERVISOR` | Awaiting supervisor | Employee submits | `SIGNED` (supervisor signs) · `REJECTED` (supervisor rejects, with reason) · `WITHDRAWN` (employee withdraws) |
| `SIGNED` | Signed by supervisor | Supervisor signs off | `AWAITING_HR` (employee sends) · `WITHDRAWN` |
| `AWAITING_HR` | Awaiting HR | Employee sends to HR | `APPROVED` (any HR officer) · `REJECTED` (HR, with remark) · `WITHDRAWN` |
| `APPROVED` | Approved | HR approves | nowhere – finished |
| `REJECTED` | Rejected | Supervisor (from `AWAITING_SUPERVISOR`) or HR (from `AWAITING_HR`) rejects | nowhere – finished |
| `WITHDRAWN` | Withdrawn | Employee withdraws before any decision | nowhere – finished |

## 11. Business rules

Numbering continues from the login rules 1–5.

6. **Leave types.** Only the four values in §9. The list lives in
   `src/lib/constants.ts`, and the app checks every submission against it.
7. **Dates.** Both dates are required; `endDate` is never before `startDate`;
   neither may be in the past – "today" is the day in the app's zone
   (Asia/Brunei, as in the login constants). Two requests may cover the same
   dates; nothing is unique except `id`.
8. **Days.** The Mon–Fri count between the dates, both days included.
   Weekends are never consumed; public holidays are *not* skipped (out of
   scope, requirements §10). The app computes it; nobody types it in.
9. **Supervisor.** Chosen at submission from the users whose role is
   `SUPERVISOR` **and** whose division equals the employee's division, then
   fixed for good. (Every demo employee's division has a supervisor.)
10. **Status changes.** Only the arrows in §10 — nothing else.
    - The **employee** causes `AWAITING_SUPERVISOR` (submit), `AWAITING_HR`
      (send, only from `SIGNED`) and `WITHDRAWN` (withdraw, only from the
      three open statuses) — on their own requests only.
    - The **supervisor** changes only rows where `supervisorId` is them and
      the status is `AWAITING_SUPERVISOR` (to `SIGNED` or `REJECTED`).
    - **Any HR officer** changes only `AWAITING_HR` rows (to `APPROVED` or
      `REJECTED`). The first one to act wins; the other sees no buttons left.
    - The **admin** changes nothing, ever.
11. **A rejection always says why.** Whenever a request becomes `REJECTED`,
    `remarks` is required — an empty reason is refused with an error and
    nothing is saved. The employee sees the remark in the request's details.
    Who rejected is clear from the record: `hrOfficerId` filled means HR,
    empty means the supervisor.
12. **The deciding officer.** `hrOfficerId` is filled the moment an HR
    officer approves or rejects, links to that person's `User`, and is never
    changed afterwards. Supervisors and admins can never fill it.
13. **No editing, no deleting.** After submission the dates, type, supervisor
    and reason are fixed — a mistake is corrected by withdrawing and
    submitting a new request. No row is ever deleted, not even when
    withdrawn. `npm run db:seed` is the only thing that clears requests
    (together with the users), so every check run starts from an empty list.

## 12. Who can see what

| Role | Sees | Can change |
|------|------|------------|
| **Employee** | Their own requests, every status, on `/employee` | Adds a new request; withdraws their own while it is still open |
| **Supervisor** | Rows where `supervisorId` is them — including ones already sent to HR or decided | Signs off or rejects (reason required) their rows that are `AWAITING_SUPERVISOR` — no others |
| **HR** | **Every** request: the queue is the `AWAITING_HR` rows, the rest is history | Approves or rejects (remark required) the `AWAITING_HR` rows; the decision records them as `hrOfficerId` |
| **Admin** | Every request, with its status and deciding officer | Nothing — no button on their page changes any data |

Two reminders the checks lean on:

- Only the employee whose `employeeId` it is may withdraw a request, and
  only from the three open statuses.
- Everything in the "Can change" column is re-checked **on the server** when
  the button is pressed — hiding a button is not enough (login design §7).

---

# Part B – App design (AI drafts, you check)

## 13. Screens (routes)

**One screen per role action**, built on the login layout: every page keeps
the same top bar (`AppShell`), and the four home pages keep their route but
replace their one-line hint with the requests table. The login routes are
untouched.

The protection rules are the login's (design §4): logged-out → `/login`;
right page, wrong role → sent back to your own home page. On the detail
routes there is one more case: **a request outside your view (design §12)
shows Not found** — the same page as an unknown address, with the button
back to your home page.

| Route | Who | Screen |
|-------|-----|--------|
| `/employee` | Employee | Table of **your own** requests: Type, From–To, Days, Status; newest first; each row links to its detail. **New request** button. |
| `/employee/new` | Employee | New request form (U6). **Submit** with confirmation, then a success message. |
| `/employee/requests/[id]` | Employee, own rows only | Request detail + the employee's actions: **Withdraw** (any open status, U8) and **Send to HR** (only when *Signed by supervisor*, U9). Another employee's id → Not found. |
| `/supervisor` | Supervisor | Table of rows where `supervisorId` is you: Employee, Type, From–To, Days, Status. Rows link to the decision screen. |
| `/supervisor/requests/[id]` | Supervisor, your rows only | Detail + decision (U10): **Sign off** or **Reject** with a required reason — shown only while the status is *Awaiting supervisor*. |
| `/hr` | HR | Every request (design §12); the queue is the *Awaiting HR* rows. Columns: Employee, Type, From–To, Days, Status, Decided by. Rows link to the decision screen. |
| `/hr/requests/[id]` | Any HR officer | Detail + decision (U12): **Approve** or **Reject** with a required remark — shown only while the status is *Awaiting HR*. Once decided: the officer's name is shown, no buttons. |
| `/admin` | Admin | Every request, read-only: Employee, Type, From–To, Days, Status, Decided by. Rows link to the record screen. |
| `/admin/requests/[id]` | Admin | The full record. No button that changes anything, ever (U13). |

## 14. What each screen shows

**The form** (`/employee/new`), fields in this order, using the `ui/Field`
styles: Leave type (dropdown of the four), From (date), To (date),
Supervisor (dropdown of the supervisors in *your* division), Reason (a few
lines, marked *Optional*). **Submit** → confirmation box → on `/employee` a
green success banner. Errors in red above the form, like login.

**Buttons only when it is your turn** (statuses §10, rights §12):

- Employee rows: **Withdraw** in the three open statuses; **Send to HR**
  only when *Signed by supervisor*. Confirmation box first, success banner
  after.
- Supervisor detail: **Sign off** and **Reject** only while *Awaiting
  supervisor*. Reject shows a reason box; empty → red error, nothing saved.
- HR detail: **Approve** and **Reject** only while *Awaiting HR*. Reject
  shows a remark box with the same rule. First officer to act wins.
- Admin: never a button.
- Any *Approved*, *Rejected* or *Withdrawn* row shows its status and no
  buttons anywhere.

**Empty, error and success states** (all from `src/components/ui/`):

- No rows: `EmptyState` — employees see "No requests yet. Press **New
  request** to make your first."; supervisors and HR see "Nothing here."
- Success: a green banner at the top of the table after each action —
  "Request submitted" · "Signed off" · "Rejected" · "Sent to HR" ·
  "Approved" · "Withdrawn".
- Errors: red above the form or the decision box (bad dates, missing
  reason).
- Status column: a coloured `StatusBadge` with the plain word from §10
  (green approved, red rejected/withdrawn, amber waiting) using the brand
  colours in `globals.css`.

**The detail/decision screen** is one shared component (`RequestDetails`)
used by all four roles: a Card with the person on leave (name and division),
type, From–To, Days, the reason, then the status badge — plus remarks and the
deciding officer when they exist — and finally the action buttons *for that
role only*.

## 15. Where the code lives

No new tools or packages — the same stack as login (design §3).

| Folder / file | What's in it |
|---------------|--------------|
| `prisma/schema.prisma` | The `LeaveRequest` table from §9. |
| `src/lib/constants.ts` | Add `LEAVE_TYPES`, `LEAVE_STATUSES` and their plain labels, next to the existing lists. |
| `src/lib/leave.ts` | New: the working-days helper and the server-side checks (dates, allowed status change, who may act on which row). |
| `src/app/actions.ts` | Server actions added beside the login ones: `submitLeaveRequestAction`, `withdrawLeaveAction`, `sendToHrAction`, `supervisorSignOffAction`, `supervisorRejectAction`, `hrApproveAction`, `hrRejectAction`. |
| `src/app/employee/` | Home page becomes the table; new `new/` (form) and `requests/[id]/` (detail) folders. Same pattern for `supervisor/`, `hr/`, `admin/`. |
| `src/components/leave/` | New pieces: `RequestTable.tsx` (one component, columns per role), `StatusBadge.tsx`, `RequestDetails.tsx`, `LeaveRequestForm.tsx`, and the action buttons with their confirmations. |
| `src/components/ui/` | **Reused, not reinvented:** Button, Card, PageHeader, EmptyState, Field, dialogs. |

## 16. Demo data

`npm run db:seed` stays as it is: 7 users and **no** leave requests (rule
13), so the pages start empty (`EmptyState`) and every check builds its own
requests through the screens, in checklist order. The 7 demo users are
enough for every check: two employees in different divisions, one supervisor
for each of their divisions, two HR officers (shared queue and deciding
officer), one admin.

## 17. Security (in plain words)

- Every new page starts with `requireRole(...)` — same helper as login.
- Detail pages and every server action check again that the row is yours to
  see or to act on (design §12); otherwise Not found / refused.
- Actions receive only the request id from the form — never a status. The
  server re-reads the row and checks role, ownership, current status and the
  §10 arrows before writing.
- Rejections are refused on the server too when the reason/remark is empty,
  not just by the browser.

## 18. Commands

Nothing new. `npm run db:migrate` creates the new table; `npm run db:seed`
resets users *and* requests (rule 13); `dev`, `lint` and `build` are
unchanged (design §8).
