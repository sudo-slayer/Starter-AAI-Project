import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { RequestDetails } from "@/components/leave/RequestDetails";
import { HrDecision } from "@/components/leave/HrDecision";

// HR decision screen (design §13): Approve / Reject with a required remark
// for any HR officer, only while Awaiting HR. Once decided the officer's
// name shows and there are no buttons (first to act wins).
export default async function HrRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("HR");
  const { id } = await params;

  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (!request) notFound();

  const employee = await prisma.user.findUnique({ where: { id: request.employeeId } });
  const officer = request.hrOfficerId
    ? await prisma.user.findUnique({ where: { id: request.hrOfficerId } })
    : null;

  return (
    <>
      <PageHeader
        title="Decide this request"
        action={
          <Link href="/hr" className={buttonClasses("secondary")}>
            HR queue
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
      {request.status === "AWAITING_HR" ? <HrDecision id={request.id} /> : null}
    </>
  );
}
