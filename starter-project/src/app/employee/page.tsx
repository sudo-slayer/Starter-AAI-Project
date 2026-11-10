import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/Icons";
import { RequestTable } from "@/components/leave/RequestTable";
import { FlashMessage } from "@/components/leave/FlashMessage";

// Employee home (design §13): your own requests, newest first, plus the
// way in to the form. Only Employee users can open it.
export default async function EmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string | string[] }>;
}) {
  const user = await requireRole("EMPLOYEE");
  const { msg } = await searchParams;

  const requests = await prisma.leaveRequest.findMany({
    where: { employeeId: user.id },
    orderBy: { id: "desc" },
  });

  return (
    <>
      <PageHeader
        title="My leave requests"
        description="Your requests, newest first, from submission to decision."
        action={
          <Link href="/employee/new" className={buttonClasses("primary")}>
            <PlusIcon /> New request
          </Link>
        }
      />
      <FlashMessage msg={msg} />
      <Card>
        {requests.length === 0 ? (
          <EmptyState
            title="No requests yet."
            description="Press New request to make your first."
          />
        ) : (
          <RequestTable
            rows={requests}
            role="employee"
            linkTo={(id) => `/employee/requests/${id}`}
          />
        )}
      </Card>
    </>
  );
}
