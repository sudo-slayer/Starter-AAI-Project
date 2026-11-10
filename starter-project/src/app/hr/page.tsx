import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequestTable } from "@/components/leave/RequestTable";
import { FlashMessage } from "@/components/leave/FlashMessage";
import { userNamesByIds } from "@/lib/leave";

// HR home (design §12/§13): every request — the queue is the Awaiting HR
// rows, the rest is history. Shared by both HR officers.
export default async function HrPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string | string[] }>;
}) {
  await requireRole("HR");
  const { msg } = await searchParams;

  const requests = await prisma.leaveRequest.findMany({
    orderBy: { id: "desc" },
  });
  const names = await userNamesByIds([
    ...requests.map((r) => r.employeeId),
    ...requests.map((r) => r.hrOfficerId ?? 0),
  ]);

  return (
    <>
      <PageHeader
        title="HR leave queue"
        description="Every request — the queue is the ones waiting for HR to decide."
      />
      <FlashMessage msg={msg} />
      <Card>
        {requests.length === 0 ? (
          <EmptyState title="Nothing here." />
        ) : (
          <RequestTable
            rows={requests.map((r) => ({
              ...r,
              employeeName: names.get(r.employeeId),
              officerName: r.hrOfficerId ? (names.get(r.hrOfficerId) ?? null) : null,
            }))}
            role="hr"
            linkTo={(id) => `/hr/requests/${id}`}
          />
        )}
      </Card>
    </>
  );
}
