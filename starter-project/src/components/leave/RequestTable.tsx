import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/Icons";
import { formatTimestamp, isLeaveType, LEAVE_TYPE_LABELS } from "@/lib/constants";
import { workingDays } from "@/lib/leave";
import { StatusBadge } from "./StatusBadge";

// One table component for all four roles (design §13): the plain four
// columns Type, From–To, Days, Status, with extra columns per role —
// Employee for supervisors, plus Decided by for HR and Admin.
export type RequestRow = {
  id: number;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  employeeName?: string;
  officerName?: string | null;
};

const HEADERS: Record<string, string[]> = {
  employee: ["Type", "From – To", "Days", "Status"],
  supervisor: ["Employee", "Type", "From – To", "Days", "Status"],
  hr: ["Employee", "Type", "From – To", "Days", "Status", "Decided by"],
  admin: ["Employee", "Type", "From – To", "Days", "Status", "Decided by"],
};

export function RequestTable({
  rows,
  role,
  linkTo,
}: {
  rows: RequestRow[];
  role: "employee" | "supervisor" | "hr" | "admin";
  linkTo?: (id: number) => string;
}) {
  const cell = "px-5 py-3 align-middle";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {HEADERS[role].map((h) => (
              <th key={h} className={`${cell} font-medium`}>
                {h}
              </th>
            ))}
            {linkTo ? <th className="w-10" /> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {role !== "employee" ? (
                <td className={cell}>{row.employeeName ?? "—"}</td>
              ) : null}
              <td className={cell}>
                {isLeaveType(row.leaveType) ? LEAVE_TYPE_LABELS[row.leaveType] : row.leaveType}
              </td>
              <td className={cell}>
                {formatTimestamp(row.startDate)} – {formatTimestamp(row.endDate)}
              </td>
              <td className={cell}>{workingDays(row.startDate, row.endDate)}</td>
              <td className={cell}>
                <StatusBadge status={row.status} />
              </td>
              {role === "hr" || role === "admin" ? (
                <td className={cell}>{row.officerName ?? "—"}</td>
              ) : null}
              {linkTo ? (
                <td className={`${cell} text-right`}>
                  <Link
                    href={linkTo(row.id)}
                    className="inline-flex items-center text-slate-400 hover:text-brand-600"
                    aria-label={`Open request ${row.id}`}
                  >
                    <ChevronRightIcon />
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
