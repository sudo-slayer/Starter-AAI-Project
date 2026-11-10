"use client";

import { useState, useTransition } from "react";
import { sendToHrAction, withdrawLeaveAction } from "@/app/actions";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorMessage } from "../ui/Field";
import { OPEN_LEAVE_STATUSES } from "@/lib/leave";

// The employee's own actions on a request (design §14): Withdraw in the
// three open statuses, Send to HR only when Signed by supervisor. Both ask
// for confirmation first; the server checks again anyway.
export function EmployeeRequestActions({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const canWithdraw = (OPEN_LEAVE_STATUSES as readonly string[]).includes(status);
  const canSend = status === "SIGNED";
  const [confirming, setConfirming] = useState<null | "withdraw" | "send">(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  if (!canWithdraw && !canSend) return null;

  function ask(next: "withdraw" | "send") {
    setError(undefined);
    setConfirming(next);
  }

  function confirm() {
    const action = confirming;
    setConfirming(null);
    if (!action) return;
    startTransition(async () => {
      const res = action === "withdraw" ? await withdrawLeaveAction(id) : await sendToHrAction(id);
      if (res?.error) setError(res.error); // success redirects with a banner
    });
  }

  return (
    <div className="mt-6">
      <ErrorMessage message={error} />
      <div className="mt-3 flex flex-wrap justify-end gap-3">
        {canWithdraw ? (
          <Button variant="danger" disabled={pending} onClick={() => ask("withdraw")}>
            Withdraw
          </Button>
        ) : null}
        {canSend ? (
          <Button disabled={pending} onClick={() => ask("send")}>
            Send to HR
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirming !== null}
        danger={confirming === "withdraw"}
        title={confirming === "withdraw" ? "Withdraw this request?" : "Send this request to HR?"}
        message={
          confirming === "withdraw"
            ? "It stops here and cannot be reopened. You can submit a new request instead."
            : "It joins the shared HR queue for a final decision."
        }
        confirmLabel={confirming === "withdraw" ? "Withdraw" : "Send to HR"}
        onConfirm={confirm}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}
