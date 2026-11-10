// The green success banner shown after each action (requirements: every
// action shows a success message). Server actions redirect with ?msg=…
const FLASH: Record<string, string> = {
  submitted: "Request submitted — waiting for your supervisor.",
  withdrawn: "Request withdrawn.",
  sent: "Sent to HR — waiting for a decision.",
  signed: "Signed off — the employee can now send it to HR.",
  supervisor_rejected: "Rejected — the employee can see your reason.",
  approved: "Approved — recorded with your name.",
  hr_rejected: "Rejected — your remark was saved.",
};

export function FlashMessage({ msg }: { msg?: string | string[] }) {
  const key = Array.isArray(msg) ? msg[0] : msg;
  const text = key ? FLASH[key] : undefined;
  if (!text) return null;
  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {text}
    </div>
  );
}
