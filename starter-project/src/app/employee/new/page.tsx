import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { todayIso } from "@/lib/constants";
import { LeaveRequestForm } from "@/components/leave/LeaveRequestForm";

// The new request form (design §14). The supervisor dropdown lists only
// supervisors from the employee's own division (AC-11); the server action
// checks everything again on submit.
export default async function NewLeaveRequestPage() {
  const user = await requireRole("EMPLOYEE");

  const supervisors = await prisma.user.findMany({
    where: { role: "SUPERVISOR", division: user.division },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <PageHeader
        title="New leave request"
        description="Weekends are not counted. The reason is optional."
        action={
          <Link href="/employee" className={buttonClasses("secondary")}>
            My requests
          </Link>
        }
      />
      <Card className="p-5 sm:p-6">
        <LeaveRequestForm supervisors={supervisors} today={todayIso()} />
      </Card>
    </>
  );
}
