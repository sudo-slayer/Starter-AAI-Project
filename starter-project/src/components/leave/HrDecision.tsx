"use client";

import { useState, useTransition } from "react";
import { hrApproveAction, hrRejectAction } from "@/app/actions";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorMessage, Label, HelpText, fieldClass } from "../ui/Field";

// The HR decision controls (design §14): Approve or Reject with a required
// remark; the officer who acts is recorded. Shown only while Awaiting HR;
// the server checks again, and the first officer to act wins.
export function HrDecision({ id }: { id: number }) {
  const [remark, setRemark] = useState("");
  const [confirming, setConfirming] = useState<null | "approve" | "reject">(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function askReject() {
    if (remark.trim().length === 0) {
      setError("A remark is required to reject.");
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
        action === "approve" ? await hrApproveAction(id) : await hrRejectAction(id, remark);
      if (res?.error) setError(res.error); // success redirects with a banner
    });
  }

  return (
    <Card className="mt-6 p-5">
      <h2 className="text-sm font-semibold text-slate-900">Your decision</h2>
      <div className="mt-3">
        <ErrorMessage message={error} />
        <div className="mt-3">
          <Label htmlFor="hrRemark">Remark (required to reject)</Label>
          <textarea
            id="hrRemark"
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className={fieldClass()}
          />
          <HelpText>Your name is recorded as the deciding officer.</HelpText>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Button variant="danger" disabled={pending} onClick={askReject}>
            Reject
          </Button>
          <Button variant="success" disabled={pending} onClick={() => setConfirming("approve")}>
            Approve
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirming !== null}
        danger={confirming === "reject"}
        title={confirming === "reject" ? "Reject this request?" : "Approve this request?"}
        message={
          confirming === "reject"
            ? "The employee will see your remark."
            : "This finishes the request. Your name is recorded."
        }
        confirmLabel={confirming === "reject" ? "Reject" : "Approve"}
        onConfirm={confirm}
        onCancel={() => setConfirming(null)}
      />
    </Card>
  );
}
