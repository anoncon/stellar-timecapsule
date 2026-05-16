import { useEffect, useMemo, useState } from "react";
import { CapsuleBoard } from "./components/CapsuleBoard";
import { CreateCapsuleForm } from "./components/CreateCapsuleForm";
import { CapsuleDetailPanel } from "./components/CapsuleDetailPanel";
import { createCapsule, listCapsules } from "./services/api";
import type { Capsule } from "./types/capsule";

function App() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  async function refresh(nextId?: string | null) {
    const data = await listCapsules();
    setCapsules(data);
    const candidate = nextId ?? selectedId ?? data[0]?.id ?? null;
    setSelectedId(data.some((capsule) => capsule.id === candidate) ? candidate : data[0]?.id ?? null);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const selectedCapsule = useMemo(
    () => capsules.find((capsule) => capsule.id === selectedId) ?? null,
    [capsules, selectedId],
  );

  const metrics = useMemo(() => {
    const sealed = capsules.filter((capsule) => capsule.status === "sealed").length;
    const claimable = capsules.filter((capsule) => capsule.status === "claimable").length;
    const opened = capsules.filter((capsule) => capsule.status === "opened").length;
    const volume = capsules.reduce((sum, capsule) => sum + capsule.amount, 0);
    return { sealed, claimable, opened, volume };
  }, [capsules]);

  async function handleCreate(payload: Parameters<typeof createCapsule>[0]) {
    setCreateError(null);
    try {
      await createCapsule(payload);
      await refresh();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create capsule.");
    }
  }

  return (
    <div className="app-shell">
      <header className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">Stellar creative MVP</p>
          <h1>Stellar TimeCapsule</h1>
          <p>
            Seal a future message and a simple token gift for someone else. The capsule stays
            locked until the unlock time, then the recipient can open it.
          </p>
          <div className="hero-tags">
            <span>time-locked gifts</span>
            <span>minimal Soroban path</span>
            <span>strong portfolio-ready UI</span>
          </div>
        </div>

        <div className="hero-panel">
          <h2>Live snapshot</h2>
          <div className="metric-grid">
            <article className="metric-card"><span>Sealed</span><strong>{metrics.sealed}</strong></article>
            <article className="metric-card"><span>Claimable</span><strong>{metrics.claimable}</strong></article>
            <article className="metric-card"><span>Opened</span><strong>{metrics.opened}</strong></article>
            <article className="metric-card"><span>Total gift volume</span><strong>{metrics.volume}</strong></article>
          </div>
        </div>
      </header>

      <section className="feature-rail">
        <article className="feature-card">
          <span>Frontend</span>
          <strong>Warm premium visual direction</strong>
          <p>Built to look more memorable than a default dashboard while still staying lightweight.</p>
        </article>
        <article className="feature-card">
          <span>Backend</span>
          <strong>Small JSON-backed lifecycle API</strong>
          <p>Create, open, and cancel flows are enough to demo a real product without heavy infrastructure.</p>
        </article>
        <article className="feature-card">
          <span>Contract</span>
          <strong>Soroban-ready locking model</strong>
          <p>The contract scaffold mirrors the product idea so later wallet and on-chain work has a clean path.</p>
        </article>
      </section>

      <section className="main-grid">
        <CreateCapsuleForm onCreate={handleCreate} error={createError} />
        <CapsuleDetailPanel capsule={selectedCapsule} onRefresh={refresh} />
      </section>

      <CapsuleBoard capsules={capsules} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  );
}

export default App;
