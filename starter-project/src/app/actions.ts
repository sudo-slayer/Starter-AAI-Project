"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { startSession, endSession, roleHome, getCurrentUser } from "@/lib/auth";
import { isLeaveType, todayIso, type Role } from "@/lib/constants";
import { OPEN_LEAVE_STATUSES, parseDateOnly } from "@/lib/leave";

// Server actions: functions that run on the server when a button is pressed.
// Every action re-checks the session, the row and the status on the server —
// hiding a button is not enough (design §17).

export type ActionResult = { error?: string; ok?: boolean; message?: string };

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await startSession(user);
  // The sidebar frame lives in the root layout; without this the client can
  // reuse the cached logged-out layout and land on the dashboard with no frame.
  revalidatePath("/", "layout");
  redirect(roleHome(user.role as Role));
}

export async function logoutAction(): Promise<void> {
  await endSession();
  // The sidebar frame lives in the root layout; without this the client can
  // reuse the cached logged-in layout and show the frame around the login page.
  revalidatePath("/", "layout");
  redirect("/login");
}

// ---------- Leave Request actions (design §17, rules 7–13) ----------

// Submit a new request (U6). Rules 6–7: valid type, real dates, end not
// before start, no past dates (today is Asia/Brunei), supervisor from the
// employee's own division. The status is set here — nothing else can.
export async function submitLeaveRequestAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "EMPLOYEE") {
    return { error: "You must be logged in as an employee to submit a request." };
  }

  const type = String(formData.get("leaveType") ?? "");
  if (!isLeaveType(type)) return { error: "Choose a leave type." };

  const fromStr = String(formData.get("from") ?? "");
  const toStr = String(formData.get("to") ?? "");
  const from = parseDateOnly(fromStr);
  const to = parseDateOnly(toStr);
  if (!from || !to) return { error: "Fill in both dates (YYYY-MM-DD)." };
  if (to < from) return { error: "The end date cannot be before the start date." };
  if (fromStr < todayIso()) return { error: "Dates cannot be in the past." };

  const supervisorId = Number(formData.get("supervisorId"));
  if (!Number.isInteger(supervisorId) || supervisorId <= 0) {
    return { error: "Choose a supervisor." };
  }
  const supervisor = await prisma.user.findFirst({
    where: { id: supervisorId, role: "SUPERVISOR", division: user.division },
  });
  if (!supervisor) {
    return { error: "Choose a supervisor from your own division." };
  }

  const reason = String(formData.get("reason") ?? "").trim();
  await prisma.leaveRequest.create({
    data: {
      employeeId: user.id,
      supervisorId: supervisor.id,
      leaveType: type,
      startDate: from,
      endDate: to,
      reason: reason.length > 0 ? reason : null,
      status: "AWAITING_SUPERVISOR",
    },
  });

  revalidatePath("/employee");
  redirect("/employee?msg=submitted");
}

// Withdraw own request (U8): only the owner, only from an open status.
export async function withdrawLeaveAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "EMPLOYEE") return { error: "Not allowed." };
  const res = await prisma.leaveRequest.updateMany({
    where: { id, employeeId: user.id, status: { in: [...OPEN_LEAVE_STATUSES] } },
    data: { status: "WITHDRAWN" },
  });
  if (res.count === 0) return { error: "This request can no longer be withdrawn." };
  revalidatePath("/employee");
  redirect("/employee?msg=withdrawn");
}

// Send to HR (U9): only the owner, only after the supervisor signed.
export async function sendToHrAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "EMPLOYEE") return { error: "Not allowed." };
  const res = await prisma.leaveRequest.updateMany({
    where: { id, employeeId: user.id, status: "SIGNED" },
    data: { status: "AWAITING_HR" },
  });
  if (res.count === 0) return { error: "Only a signed request can be sent to HR." };
  revalidatePath("/employee");
  redirect("/employee?msg=sent");
}

// Supervisor signs (U10): only their own row, only while Awaiting supervisor.
export async function supervisorSignOffAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERVISOR") return { error: "Not allowed." };
  const res = await prisma.leaveRequest.updateMany({
    where: { id, supervisorId: user.id, status: "AWAITING_SUPERVISOR" },
    data: { status: "SIGNED" },
  });
  if (res.count === 0) return { error: "This request is no longer waiting for you." };
  revalidatePath("/supervisor");
  redirect("/supervisor?msg=signed");
}

// Supervisor rejects (U10): reason required here, not just in the browser
// (rule 11).
export async function supervisorRejectAction(
  id: number,
  reason: string,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERVISOR") return { error: "Not allowed." };
  if (reason.trim().length === 0) return { error: "A reason is required to reject." };
  const res = await prisma.leaveRequest.updateMany({
    where: { id, supervisorId: user.id, status: "AWAITING_SUPERVISOR" },
    data: { status: "REJECTED", remarks: reason.trim() },
  });
  if (res.count === 0) return { error: "This request is no longer waiting for you." };
  revalidatePath("/supervisor");
  redirect("/supervisor?msg=supervisor_rejected");
}

// Any HR officer approves (U12): only from the shared queue; the first
// officer to act wins and is recorded (rule 12).
export async function hrApproveAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "HR") return { error: "Not allowed." };
  const res = await prisma.leaveRequest.updateMany({
    where: { id, status: "AWAITING_HR" },
    data: { status: "APPROVED", hrOfficerId: user.id },
  });
  if (res.count === 0) return { error: "This request has already been decided." };
  revalidatePath("/hr");
  redirect("/hr?msg=approved");
}

// Any HR officer rejects (U12): remark required (rule 11), officer recorded.
export async function hrRejectAction(id: number, remark: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "HR") return { error: "Not allowed." };
  if (remark.trim().length === 0) return { error: "A remark is required to reject." };
  const res = await prisma.leaveRequest.updateMany({
    where: { id, status: "AWAITING_HR" },
    data: { status: "REJECTED", remarks: remark.trim(), hrOfficerId: user.id },
  });
  if (res.count === 0) return { error: "This request has already been decided." };
  revalidatePath("/hr");
  redirect("/hr?msg=hr_rejected");
}
