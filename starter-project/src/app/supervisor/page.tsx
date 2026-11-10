import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequestTable } from "@/components/leave/RequestTable";
import { FlashMessage } from "@/components/leave/FlashMessage";
import { userNamesByIds } from "@/lib/leave";

// Supervisor home (design §13): only rows where the supervisorId is them,
// including ones already sent to HR or decided.
export default async function SupervisorPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string | string[] }>;
}) {
  const user = await requireRole("SUPERVISOR");
  const { msg } = await searchParams;

  const requests = await prisma.leaveRequest.findMany({
    where: { supervisorId: user.id },
    orderBy: { id: "desc" },
  });
  const names = await userNamesByIds(requests.map((r) => r.employeeId));

  return (
    <>
      <PageHeader title="Requests sent to me" description="Your division's requests, newest first." />
      <FlashMessage msg={msg} />
      <Card>
        {requests.length === 0 ? (
          <EmptyState title="Nothing here." />
        ) : (
          <RequestTable
            rows={requests.map((r) => ({ ...r, employeeName: names.get(r.employeeId) }))}
            role="supervisor"
            linkTo={(id) => `/supervisor/requests/${id}`}
          />
        )}
      </Card>
    </>
  );
}
