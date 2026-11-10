# Login – Requirements

> **What and why.** This document says what the login must do and why. It is
> the source of truth for behaviour: when something needs to change, update this
> document **first**. New to specs? Read [README.md](README.md) first.

## 1. The problem

Budiman Company is building an HR Management System. Before anyone can use
it, the system has to know **who is using it** and **what they are allowed to
do**.

This first part of the system provides:

1. A **login** with each person's company email and password.
2. A **home page for each role**, so everyone lands in the right place.
3. **Protection**, so nobody can open another role's pages.

## 2. Who uses it (roles)

| Role | Home page | What they will do (built in Session 2) |
|------|-----------|-----------------------------------------|
| **Employee** | `/employee` | Apply for leave and track their requests. |
| **Supervisor** | `/supervisor` | Decide on requests sent to them. |
| **HR** | `/hr` | Decide on requests sent to HR. |
| **Admin** | `/admin` | See every leave record. |

Each user has exactly one role.

## 3. User stories

Format: *As a [role], I can [do something] so that [benefit].*

- **U1. Log in** *(Core)*. As any user, I can log in with my company email and
  password so that I see the screens for my role.
- **U2. Land on my home page** *(Core)*. As any user, after logging in I go
  straight to my role's home page, so I don't have to look for it.
- **U3. Stay logged in** *(Core)*. As any user, I stay logged in for up to 7
  days on the same browser, so I don't have to log in every time.
- **U4. Log out** *(Core)*. As any user, I can log out when I'm done, so the
  next person on this computer can't use my account.
- **U5. Only my own screens** *(Core)*. As any user, I can only open the pages
  for my own role, so nobody can act as someone else.

## 4. Acceptance checklist

The login is done when every box is ticked. Use the demo accounts (password
`password123`): `employee-1` and `employee-2` (Employees), `supervisor-1` and
`supervisor-2` (Supervisors), `hr-1` and `hr-2` (HR), `admin` (Admin). Each
logs in with that name followed by `@budiman.com`, e.g.
`employee-1@budiman.com`; the checks below use the short name.
Run `npm run db:seed` first to start from clean data.

| ✓ | ID | Check | How to test |
|---|----|-------|-------------|
| [ ] | AC-01 | A user can log in and lands on their role's home page. | Log in as `employee-1` → you are on `/employee`, a page with only a short hint line. Repeat for `supervisor-1` (`/supervisor`), `hr-1` (`/hr`), `admin` (`/admin`). |
| [ ] | AC-02 | A wrong password or an unknown email shows an error. | Log in as `employee-1` with password `wrong` → "Invalid email or password." Try `nobody@budiman.com` → the same message. |
| [ ] | AC-03 | Empty fields are not sent. | Click **Log in** with the boxes empty → the browser asks you to fill them in. |
| [ ] | AC-04 | A logged-out user is sent to the login page. | Log out, then type `/employee` in the address bar → you are on `/login`. |
| [ ] | AC-05 | A logged-in user who opens the login page goes to their home page. | Logged in as `hr-1`, type `/login` → you are on `/hr`. |
| [ ] | AC-06 | Logging out asks first, then returns to the login page. | Click **Log out** in the top bar → a confirmation box → confirm → you are on `/login`. |
| [ ] | AC-07 | A user cannot open another role's pages. | As `employee-1`, type `/hr` or `/admin` → you are sent back to `/employee`. As `admin`, type `/employee` → you are sent back to `/admin`. |
| [ ] | AC-08 | Every page shows who is logged in. | The top bar shows the user's name and role. On a phone, it shows the user's initials instead. |
| [ ] | AC-09 | An unknown page shows "Not found". | Type `/something-else` → "Not found", with a button back to your home page. |
## 5. Not included (for now)

These are **out of scope** for the login:

- Signing up, or resetting a forgotten password.
- Adding, editing or deleting user accounts (only the demo data creates users).
- The Leave Request module itself – that is what you build in Session 2.

---

# Leave Request – Requirements

> **What and why.** This section says what the Leave Request module must do
> and why. Sections 1–5 above (login) stay as they are; this section continues
> the numbering. If something needs to change, update this document **first**
> (golden rule: fix the spec, not the code).

## 6. The problem

Budiman Company still processes leave on paper: the employee fills in a form,
the supervisor signs it, and HR receives a copy and types it into a
spreadsheet. This causes three problems:

1. Forms get lost or delayed between the employee, the supervisor and HR.
2. Employees can't see where their request is: waiting for the supervisor,
   with HR, or decided.
3. HR has no single list of requests waiting for a decision.

Goal: one request, one system, visible from submission to decision. A request
moves **Employee → Supervisor → HR queue → decision**, and every person sees
exactly the requests they need to act on.

## 7. Who uses it (roles)

The four roles are the ones from §2. In this module:

| Role | Home page | In this module they… |
|------|-----------|----------------------|
| **Employee** | `/employee` | Submit requests, track them (status, reason, remarks), withdraw an undecided one, and send a signed request to the HR queue. |
| **Supervisor** | `/supervisor` | Sign off or reject the requests sent to them — only their own division's. A rejection needs a reason. |
| **HR** | `/hr` | See every request waiting for HR in one shared list. Any HR officer may approve or reject; a rejection needs a remark, and the deciding officer is recorded. |
| **Admin** | `/admin` | See every leave record. View only — changes nothing. |

Rules of the route (from the brief):

- Employees apply; supervisors and HR only decide.
- The employee chooses the supervisor from **their own division** at submission.
- Every request passes the supervisor first. Only after it is signed can the
  employee send it to the HR queue.
- Every action (submit, sign off, reject, send to HR, approve, withdraw) asks
  for confirmation first and shows a success message after.

## 8. User stories

Format: *As a [role], I can [do something] so that [benefit].*

- **U6. Apply for leave** *(Core)*. As an Employee, I can submit a leave
  request (type, from–to dates, my supervisor, an optional reason) so that my
  leave is asked for properly without any paper.
- **U7. Track my requests** *(Core)*. As an Employee, I can see all my
  requests with their status, days, reason and remarks, so that I know where
  each one is and what was said about it.
- **U8. Withdraw a request** *(Core)*. As an Employee, I can withdraw my own
  request at any time before a decision, so that a mistake is corrected by
  submitting a new one.
- **U9. Send to HR** *(Core)*. As an Employee, I can send a signed request to
  the shared HR queue, so that HR can make the final decision.
- **U10. Decide as Supervisor** *(Core)*. As a Supervisor, I can sign off or
  reject the requests sent to me (a rejection needs a reason), so that leave
  in my division is checked before HR sees it.
- **U11. See the HR queue** *(Core)*. As HR, I can see every request waiting
  for a decision in one shared list, so that nothing gets lost.
- **U12. Decide as HR** *(Core)*. As HR, I can approve or reject any request in
  the queue (a rejection needs a remark; my name is recorded as the deciding
  officer), so that decisions are made and traceable.
- **U13. See everything as Admin** *(Core)*. As an Admin, I can see every
  leave request in the system, so that there is one complete record — and I
  change nothing.
- **U14. Filter my list** *(Stretch)*. As any user, I can filter my table by
  status, so that I find requests quickly when the list grows.

Decided during the interview: four leave types (**Annual, Sick, Emergency,
Unpaid**); the reason is optional; days are counted as **working days
(Mon–Fri, weekends not consumed)**; each role's home page is one plain table
(**Type, From–To, Days, Status**) of the requests that concern that role;
finished requests **stay in the same list** with their final status.

## 9. Acceptance checklist

The module is done when every box is ticked. Use the same demo accounts and
password as in §4 (`employee-1`, `employee-2`, `supervisor-1`,
`supervisor-2`, `hr-1`, `hr-2`, `admin`, password `password123`, each logging
in as that name + `@budiman.com`). Run `npm run db:seed` first: it resets the
demo users **and clears all leave requests**, so every run starts with an
empty list. Checks that need more than one open request say so.

| ✓ | ID | Check | How to test |
|---|----|-------|-------------|
| [ ] | AC-10 | An employee can submit a request and it appears with the right status and days. | As `employee-1`, open `/employee` → **New request** → type *Annual leave*, pick a coming Monday to Friday, supervisor shows **Supervisor 1**, leave reason blank → **Submit** → confirm in the box → success message. The table shows the row: Annual, the dates, **Days 5**, status **Awaiting supervisor**. |
| [ ] | AC-11 | The supervisor list only offers supervisors from the employee's own division. | Open the form as `employee-1` → the Supervisor dropdown contains **Supervisor 1** only (no Supervisor 2). As `employee-2` → it contains **Supervisor 2** only. |
| [ ] | AC-12 | Invalid forms are not saved; overlapping requests are allowed. | Open the form as `employee-1`: click **Submit** with empty fields → you are asked to fill them. Set **To** before **From** → red error above the form, nothing saved. Set **From** to yesterday → red error. Then submit a second request covering exactly the dates of AC-10's → it is accepted (overlap is fine). |
| [ ] | AC-13 | Cancelling a confirmation changes nothing. | On any action (e.g. **Submit**, **Withdraw**), click **Cancel** in the confirmation box → no success message and the list/status is unchanged. |
| [ ] | AC-14 | An employee only ever sees their own requests. | As `employee-2`, open `/employee` → none of `employee-1`'s requests appear. |
| [ ] | AC-15 | A supervisor signs off a request and only sees their division's. | As `supervisor-1`, open `/supervisor` → `employee-1`'s requests are listed, `employee-2`'s (Supervisor 2's) are not. Click **Sign off** → confirm → success → status becomes **Signed by supervisor**. |
| [ ] | AC-16 | A supervisor's rejection needs a reason, and the employee sees it. | As `supervisor-1`, click **Reject** on one of `employee-1`'s requests → leave the reason empty → an error says it is required. Type a reason → confirm → success → status **Rejected**. As `employee-1`, the row shows status **Rejected** and the reason text. |
| [ ] | AC-17 | Only a signed request can be sent to HR. | As `employee-1`: a request still **Awaiting supervisor** shows **no** *Send to HR* button. On the one just signed (AC-15), **Send to HR** appears → click → confirm → success → status **Awaiting HR**. |
| [ ] | AC-18 | The HR queue is shared by both officers. | As `hr-1`, open `/hr` → the **Awaiting HR** request is listed. Log in as `hr-2` → the same request is listed too. |
| [ ] | AC-19 | HR approval is recorded with the officer's name. | As `hr-1`, **Approve** the request → confirm → success → status **Approved**, the row shows the deciding officer (`hr-1`). As `hr-2` and as `employee-1` the row shows the same. `hr-2`'s row has no buttons left. |
| [ ] | AC-20 | HR rejection needs a remark, records the officer, and the employee sees it. | First have `employee-1` send a second request all the way to **Awaiting HR** (as AC-10, AC-15, AC-17, with another supervisor if needed). As `hr-2`, **Reject** it → empty remark → error → type a remark → confirm → success. Status **Rejected** with the remark and officer `hr-2`, visible to `employee-1`. |
| [ ] | AC-21 | An employee can withdraw only their own undecided requests. | Have `employee-1` submit a new request, then click **Withdraw** → confirm → success → status **Withdrawn**. As `supervisor-1` that row shows **Withdrawn** and has no *Sign off*/*Reject* buttons. On `employee-1`'s **Approved** request there is no *Withdraw* button. |
| [ ] | AC-22 | The admin sees every request and changes nothing. | As `admin`, open `/admin` → all requests of both employees are listed with their statuses and deciding officers. Nowhere on the page is there an action button (only viewing). |
| [ ] | AC-23 | The reason and remarks are visible. | As `employee-1`, open the request rejected in AC-16 (click its row) → the details show your reason and the supervisor's rejection reason. |
| [ ] | AC-24 | *(Stretch)* Filtering by status works. | On any role's table, choose a status filter (e.g. *Awaiting HR*) → only rows with that status remain; clear the filter → all rows are back. |

## 10. Not included (for now)

These are **out of scope** for the module:

- Leave balances or quotas (no "X days left"; approvals are not limited by any
  allowance).
- Public holidays — only Saturdays and Sundays are skipped when counting days.
- Editing a submitted request (withdraw it and submit a new one instead).
- Notifications: no email or reminders; users check the pages themselves.
- Deleting records — *Withdraw* is the closest thing, and it keeps the row.
- Attachments such as medical certificates.
- A supervisor acting on another division's requests, or a second supervisor
  in the chain. The chain is fixed: one supervisor, then HR.

## 11. Assumptions (please confirm)

1. **Statuses** are exactly: `Awaiting supervisor → Signed by supervisor →
   Awaiting HR → Approved / Rejected`, plus `Withdrawn`. A supervisor's
   rejection and HR's rejection both show as **Rejected**; who rejected is
   visible in the details. Final field values are fixed in design Part A.
2. **No past dates** is measured against *today* in the app's time zone
   (Asia/Brunei, as in `src/lib/constants.ts`).
3. **Days** = weekdays (Mon–Fri) from start to end inclusive. A range with no
   weekday gives 0 days and is not blocked beyond the agreed date rules
   (validation is dates-only).
4. **Withdraw** is available in all three open statuses (`Awaiting supervisor`,
   `Signed by supervisor`, `Awaiting HR`) — anywhere before a decision.
5. `npm run db:seed` deletes all leave requests along with the users; demo
   users and passwords are unchanged from §4.
6. Reason and remarks are shown in a **request details view** opened from the
   row; the exact mechanism is decided in design Part B.
7. Every employee's division has at least one supervisor (true for the demo
   users). If it didn't, the dropdown would simply be empty.
8. One supervisor per request, chosen by the employee at submission and fixed
   afterwards.
9. Tables are sorted newest first.

