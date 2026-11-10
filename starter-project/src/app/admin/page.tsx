import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequestTable } from "@/components/leave/RequestTable";
import { userNamesByIds } from "@/lib/leave";

// Admin home (design §13): every request, read-only — no button anywhere
// changes data.
export default async function AdminPage() {
  await requireRole("ADMIN");

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
        title="All leave requests"
        description="Every leave record in the system. View only."
      />
      <Card>
        {requests.length === 0 ? (
          <EmptyState title="No leave records." />
        ) : (
          <RequestTable
            rows={requests.map((r) => ({
              ...r,
              employeeName: names.get(r.employeeId),
              officerName: r.hrOfficerId ? (names.get(r.hrOfficerId) ?? null) : null,
            }))}
            role="admin"
            linkTo={(id) => `/admin/requests/${id}`}
          />
        )}
      </Card>
    </>
  );
}
