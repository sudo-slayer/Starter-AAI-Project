import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { RequestDetails } from "@/components/leave/RequestDetails";

// Admin record screen (design §13): the full record, no buttons that change
// anything, ever (U13).
export default async function AdminRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (!request) notFound();

  const employee = await prisma.user.findUnique({ where: { id: request.employeeId } });
  const supervisor = await prisma.user.findUnique({ where: { id: request.supervisorId } });
  const officer = request.hrOfficerId
    ? await prisma.user.findUnique({ where: { id: request.hrOfficerId } })
    : null;

  return (
    <>
      <PageHeader
        title="Leave record"
        action={
          <Link href="/admin" className={buttonClasses("secondary")}>
            All requests
          </Link>
        }
      />
      <RequestDetails
        employeeName={
          employee && supervisor
            ? `${employee.name} · via ${supervisor.name}`
            : (employee?.name ?? "—")
        }
        leaveType={request.leaveType}
        startDate={request.startDate}
        endDate={request.endDate}
        status={request.status}
        reason={request.reason}
        remarks={request.remarks}
        officerName={officer?.name ?? null}
      />
    </>
  );
}
