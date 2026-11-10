import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { RequestDetails } from "@/components/leave/RequestDetails";
import { SupervisorDecision } from "@/components/leave/SupervisorDecision";

// Supervisor decision screen (design §13): the full data plus Sign off /
// Reject, only while Awaiting supervisor. Rows for other supervisors show
// Not found.
export default async function SupervisorRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("SUPERVISOR");
  const { id } = await params;

  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (!request || request.supervisorId !== user.id) notFound();

  const employee = await prisma.user.findUnique({ where: { id: request.employeeId } });
  const officer = request.hrOfficerId
    ? await prisma.user.findUnique({ where: { id: request.hrOfficerId } })
    : null;

  return (
    <>
      <PageHeader
        title="Decide this request"
        action={
          <Link href="/supervisor" className={buttonClasses("secondary")}>
            Sent to me
          </Link>
        }
      />
      <RequestDetails
        employeeName={employee?.name ?? "—"}
        leaveType={request.leaveType}
        startDate={request.startDate}
        endDate={request.endDate}
        status={request.status}
        reason={request.reason}
        remarks={request.remarks}
        officerName={officer?.name ?? null}
      />
      {request.status === "AWAITING_SUPERVISOR" ? <SupervisorDecision id={request.id} /> : null}
    </>
  );
}
