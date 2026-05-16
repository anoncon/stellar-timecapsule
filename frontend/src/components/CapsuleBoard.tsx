import type { Capsule } from "../types/capsule";

function formatTime(seconds: number) {
  if (seconds <= 0) return "Ready now";
  const hours = Math.ceil(seconds / 3600);
  if (hours < 24) return `${hours}h left`;
  const days = Math.ceil(hours / 24);
  return `${days}d left`;
}

interface Props {
  capsules: Capsule[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CapsuleBoard({ capsules, selectedId, onSelect }: Props) {
  return (
    <section className="card">
      <div className="section-heading">
        <p className="kicker">Capsule board</p>
        <h2>Live sealed drops</h2>
      </div>

      <div className="capsule-grid">
        {capsules.map((capsule) => (
          <button
            key={capsule.id}
            className={`capsule-card ${selectedId === capsule.id ? "capsule-card-active" : ""}`}
            type="button"
            onClick={() => onSelect(capsule.id)}
          >
            <div className="capsule-topline">
              <span className={`status-pill status-${capsule.status}`}>{capsule.status}</span>
              <span>{formatTime(capsule.secondsUntilUnlock)}</span>
            </div>
            <strong>{capsule.title}</strong>
            <p>{capsule.message.slice(0, 92)}{capsule.message.length > 92 ? "..." : ""}</p>
            <div className="capsule-meta">
              <span>{capsule.amount} {capsule.assetCode}</span>
              <span>Recipient {capsule.recipient.slice(0, 6)}...</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
