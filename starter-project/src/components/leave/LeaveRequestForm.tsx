"use client";

import { useActionState, useRef, useState } from "react";
import { submitLeaveRequestAction } from "@/app/actions";
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from "@/lib/constants";
import { Button } from "../ui/Button";
import { ErrorMessage, HelpText, Label, fieldClass } from "../ui/Field";
import { ConfirmDialog } from "../ui/ConfirmDialog";

// The new request form (design §14). Submit asks for confirmation first,
// then the server action checks everything again and redirects with a
// success banner (AC-10..AC-13).
export function LeaveRequestForm({
  supervisors,
  today,
}: {
  supervisors: { id: number; name: string }[];
  today: string;
}) {
  const [state, formAction, pending] = useActionState(submitLeaveRequestAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const [confirming, setConfirming] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (confirmed.current) {
      confirmed.current = false; // this submit already passed the confirmation
      return;
    }
    e.preventDefault(); // native validation ran first, so the fields are filled
    setConfirming(true);
  }

  return (
    <>
      <form ref={formRef} action={formAction} onSubmit={onSubmit} className="space-y-5">
        <ErrorMessage message={state.error} />

        <div>
          <Label htmlFor="leaveType">Leave type</Label>
          <select id="leaveType" name="leaveType" required className={fieldClass()}>
            <option value="">Choose a type…</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {LEAVE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="from">From</Label>
            <input id="from" name="from" type="date" required min={today} className={fieldClass()} />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <input id="to" name="to" type="date" required min={today} className={fieldClass()} />
          </div>
        </div>
        <HelpText>Days are counted as working days, Monday to Friday.</HelpText>

        <div>
          <Label htmlFor="supervisorId">Supervisor</Label>
          <select id="supervisorId" name="supervisorId" required className={fieldClass()}>
            <option value="">Choose a supervisor…</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {supervisors.length === 0 ? (
            <HelpText>No supervisor exists for your division, so a request cannot be sent.</HelpText>
          ) : null}
        </div>

        <div>
          <Label htmlFor="reason">Reason</Label>
          <textarea id="reason" name="reason" rows={3} className={fieldClass()} />
          <HelpText>Optional — your own words for the people deciding.</HelpText>
        </div>

        <Button type="submit" disabled={pending || supervisors.length === 0}>
          {pending ? "Submitting…" : "Submit request"}
        </Button>
      </form>

      <ConfirmDialog
        open={confirming}
        title="Submit this request?"
        message="It will be sent to your supervisor for a decision."
        confirmLabel="Submit"
        onConfirm={() => {
          setConfirming(false);
          confirmed.current = true;
          formRef.current?.requestSubmit();
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
