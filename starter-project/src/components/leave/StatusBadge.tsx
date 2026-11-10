import { LEAVE_STATUS_LABELS, isLeaveStatus } from "@/lib/constants";

// Coloured status pill (design §14): green finished-well, red refused,
// amber waiting, grey withdrawn.
const STYLES: Record<string, string> = {
  AWAITING_SUPERVISOR: "bg-amber-100 text-amber-800",
  SIGNED: "bg-brand-100 text-brand-700",
  AWAITING_HR: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-slate-100 text-slate-500",
};

export function StatusBadge({ status }: { status: string }) {
  const label = isLeaveStatus(status) ? LEAVE_STATUS_LABELS[status] : status;
  const style = STYLES[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
