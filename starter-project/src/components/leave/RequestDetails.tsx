import { Card } from "../ui/Card";
import { DetailList } from "../ui/DetailSection";
import { formatTimestamp, isLeaveType, LEAVE_TYPE_LABELS } from "@/lib/constants";
import { workingDays } from "@/lib/leave";
import { StatusBadge } from "./StatusBadge";

// The shared detail card for every role (design §14): person, request,
// status, reason, remarks and the deciding officer. Action buttons are
// added by each page, for that role only.
export function RequestDetails({
  employeeName,
  leaveType,
  startDate,
  endDate,
  status,
  reason,
  remarks,
  officerName,
}: {
  employeeName?: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  reason?: string | null;
  remarks?: string | null;
  officerName?: string | null;
}) {
  const days = workingDays(startDate, endDate);
  const rows = [
    ...(employeeName ? [{ label: "Person on leave", value: employeeName }] : []),
    {
      label: "Leave type",
      value: isLeaveType(leaveType) ? LEAVE_TYPE_LABELS[leaveType] : leaveType,
    },
    { label: "From", value: formatTimestamp(startDate) },
    { label: "To", value: formatTimestamp(endDate) },
    { label: "Days", value: `${days} working ${days === 1 ? "day" : "days"}` },
    { label: "Status", value: <StatusBadge status={status} /> },
    { label: "Reason", value: reason && reason.length > 0 ? reason : "—", wide: true },
    ...(remarks
      ? [{ label: "Remarks from the decision", value: remarks, wide: true }]
      : []),
    ...(officerName ? [{ label: "Decided by", value: officerName }] : []),
  ];
  return (
    <Card className="p-5">
      <DetailList rows={rows} />
    </Card>
  );
}
