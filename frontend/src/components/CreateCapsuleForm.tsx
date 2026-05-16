import { FormEvent, useState } from "react";
import type { CreateCapsulePayload } from "../types/capsule";

const initialState = {
  creator: "",
  recipient: "",
  title: "Birthday capsule",
  message: "A little note and a tiny future gift for you. Open it when the time arrives.",
  assetCode: "XLM",
  amount: "75",
  unlockHours: "48",
};

interface Props {
  onCreate: (payload: CreateCapsulePayload) => Promise<void>;
  error?: string | null;
}

export function CreateCapsuleForm({ onCreate, error }: Props) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onCreate({
        creator: form.creator.trim(),
        recipient: form.recipient.trim(),
        title: form.title.trim(),
        message: form.message.trim(),
        assetCode: form.assetCode.trim().toUpperCase(),
        amount: Number(form.amount),
        unlockAt: Math.floor(Date.now() / 1000) + Number(form.unlockHours) * 3600,
      });
      setForm(initialState);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card card-soft">
      <div className="section-heading">
        <p className="kicker">Create capsule</p>
        <h2>Seal a message for the future</h2>
        <p className="muted">
          Capture a note, lock a simple gift amount, and set an unlock time for the
          recipient.
        </p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>Creator wallet</span>
          <input value={form.creator} onChange={(event) => update("creator", event.target.value)} placeholder="G... creator address" required />
        </label>

        <label className="field-group">
          <span>Recipient wallet</span>
          <input value={form.recipient} onChange={(event) => update("recipient", event.target.value)} placeholder="G... recipient address" required />
        </label>

        <label className="field-group">
          <span>Capsule title</span>
          <input value={form.title} onChange={(event) => update("title", event.target.value)} maxLength={80} required />
        </label>

        <label className="field-group">
          <span>Message</span>
          <textarea value={form.message} onChange={(event) => update("message", event.target.value)} rows={5} maxLength={400} required />
        </label>

        <div className="field-row">
          <label className="field-group">
            <span>Asset</span>
            <input value={form.assetCode} onChange={(event) => update("assetCode", event.target.value)} maxLength={12} required />
          </label>

          <label className="field-group">
            <span>Amount</span>
            <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => update("amount", event.target.value)} required />
          </label>
        </div>

        <label className="field-group">
          <span>Unlock in hours</span>
          <input type="number" min="1" step="1" value={form.unlockHours} onChange={(event) => update("unlockHours", event.target.value)} required />
        </label>

        {error ? <div className="notice notice-error">{error}</div> : null}

        <button className="btn-primary" disabled={submitting} type="submit">
          {submitting ? "Sealing..." : "Seal capsule"}
        </button>
      </form>
    </section>
  );
}
