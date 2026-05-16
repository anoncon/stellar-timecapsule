import { useMemo, useState } from "react";
import { cancelCapsule, openCapsule } from "../services/api";
import type { Capsule } from "../types/capsule";

function formatTimestamp(value?: number) {
  if (!value) return "-";
  return new Date(value * 1000).toLocaleString();
}

interface Props {
  capsule: Capsule | null;
  onRefresh: (nextId?: string | null) => Promise<void>;
}

export function CapsuleDetailPanel({ capsule, onRefresh }: Props) {
  const [actor, setActor] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const canOpen = useMemo(() => capsule?.status === "claimable", [capsule]);
  const canCancel = useMemo(() => capsule?.status === "sealed", [capsule]);

  if (!capsule) {
    return <section className="card empty-card">Choose a capsule to inspect its timeline and actions.</section>;
  }

  const activeCapsule = capsule;

  async function handleOpen() {
    setWorking(true);
    setError(null);
    setMessage(null);
    try {
      await openCapsule(activeCapsule.id, actor.trim());
      await onRefresh(activeCapsule.id);
      setMessage("Capsule opened successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open capsule.");
    } finally {
      setWorking(false);
    }
  }

  async function handleCancel() {
    setWorking(true);
    setError(null);
    setMessage(null);
    try {
      await cancelCapsule(activeCapsule.id, actor.trim());
      await onRefresh(activeCapsule.id);
      setMessage("Capsule canceled successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel capsule.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="card detail-card">
      <div className="section-heading">
        <p className="kicker">Capsule detail</p>
        <h2>{activeCapsule.title}</h2>
        <p className="muted">{activeCapsule.message}</p>
      </div>

      <div className="detail-grid">
        <article>
          <span>Creator</span>
          <strong>{activeCapsule.creator.slice(0, 10)}...</strong>
        </article>
        <article>
          <span>Recipient</span>
          <strong>{activeCapsule.recipient.slice(0, 10)}...</strong>
        </article>
        <article>
          <span>Unlocks at</span>
          <strong>{formatTimestamp(activeCapsule.unlockAt)}</strong>
        </article>
        <article>
          <span>Asset gift</span>
          <strong>{activeCapsule.amount} {activeCapsule.assetCode}</strong>
        </article>
      </div>

      <label className="field-group">
        <span>Action wallet</span>
        <input value={actor} onChange={(event) => setActor(event.target.value)} placeholder="Use creator to cancel or recipient to open" />
      </label>

      <div className="button-row">
        <button className="btn-primary" type="button" disabled={working || !canOpen || actor.trim().length === 0} onClick={handleOpen}>Open capsule</button>
        <button className="btn-ghost" type="button" disabled={working || !canCancel || actor.trim().length === 0} onClick={handleCancel}>Cancel capsule</button>
      </div>

      {message ? <div className="notice notice-success">{message}</div> : null}
      {error ? <div className="notice notice-error">{error}</div> : null}

      <div className="timeline-block">
        <h3>Activity</h3>
        <div className="timeline-list">
          {activeCapsule.events.map((event) => (
            <article key={event.id} className="timeline-item">
              <strong>{event.type}</strong>
              <span>{event.actor.slice(0, 10)}...</span>
              <span>{formatTimestamp(event.timestamp)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
