"use client";

import { useState, useTransition } from "react";
import { supervisorRejectAction, supervisorSignOffAction } from "@/app/actions";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorMessage, Label, fieldClass } from "../ui/Field";

// The supervisor's decision screen controls (design §14): Sign off, or
// Reject with a required reason. Shown only while Awaiting supervisor; the
// server checks again anyway.
export function SupervisorDecision({ id }: { id: number }) {
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState<null | "signoff" | "reject">(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function askReject() {
    if (reason.trim().length === 0) {
      setError("A reason is required to reject.");
      return;
    }
    setError(undefined);
    setConfirming("reject");
  }

  function confirm() {
    const action = confirming;
    setConfirming(null);
    if (!action) return;
    startTransition(async () => {
      const res =
        action === "signoff"
          ? await supervisorSignOffAction(id)
          : await supervisorRejectAction(id, reason);
      if (res?.error) setError(res.error); // success redirects with a banner
    });
  }

  return (
    <Card className="mt-6 p-5">
      <h2 className="text-sm font-semibold text-slate-900">Your decision</h2>
      <div className="mt-3">
        <ErrorMessage message={error} />
        <div className="mt-3">
          <Label htmlFor="rejectReason">Reason (required to reject)</Label>
          <textarea
            id="rejectReason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={fieldClass()}
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Button variant="danger" disabled={pending} onClick={askReject}>
            Reject
          </Button>
          <Button variant="success" disabled={pending} onClick={() => setConfirming("signoff")}>
            Sign off
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirming !== null}
        danger={confirming === "reject"}
        title={confirming === "reject" ? "Reject this request?" : "Sign off this request?"}
        message={
          confirming === "reject"
            ? "The employee will see your reason."
            : "The employee can then send it to HR."
        }
        confirmLabel={confirming === "reject" ? "Reject" : "Sign off"}
        onConfirm={confirm}
        onCancel={() => setConfirming(null)}
      />
    </Card>
  );
}
