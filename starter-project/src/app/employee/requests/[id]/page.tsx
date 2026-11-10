import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { FlashMessage } from "@/components/leave/FlashMessage";
import { RequestDetails } from "@/components/leave/RequestDetails";
import { EmployeeRequestActions } from "@/components/leave/EmployeeRequestActions";

// Employee detail (design §13): the full request with the employee's own
// actions (Withdraw, Send to HR). Another employee's request → Not found.
export default async function EmployeeRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string | string[] }>;
}) {
  const user = await requireRole("EMPLOYEE");
  const { id } = await params;
  const { msg } = await searchParams;

  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (!request || request.employeeId !== user.id) notFound();

  const officer = request.hrOfficerId
    ? await prisma.user.findUnique({ where: { id: request.hrOfficerId } })
    : null;

  return (
    <>
      <PageHeader
        title="Leave request"
        action={
          <Link href="/employee" className={buttonClasses("secondary")}>
            My requests
          </Link>
        }
      />
      <FlashMessage msg={msg} />
      <RequestDetails
        leaveType={request.leaveType}
        startDate={request.startDate}
        endDate={request.endDate}
        status={request.status}
        reason={request.reason}
        remarks={request.remarks}
        officerName={officer?.name ?? null}
      />
      <EmployeeRequestActions id={request.id} status={request.status} />
    </>
  );
}
