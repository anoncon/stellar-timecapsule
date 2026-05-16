import cors from "cors";
import "dotenv/config";
import express from "express";
import { cancelCapsule, createCapsule, getCapsule, listCapsules, openCapsule } from "./services/capsuleStore.js";
import { capsuleActionSchema, createCapsuleSchema } from "./validation/schemas.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ service: "stellar-timecapsule-backend", status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/capsules", (_req, res) => {
  res.json({ data: listCapsules() });
});

app.get("/api/capsules/:id", (req, res) => {
  const capsule = getCapsule(req.params.id);
  if (!capsule) {
    res.status(404).json({ error: "Capsule not found." });
    return;
  }
  res.json({ data: capsule });
});

app.post("/api/capsules", (req, res) => {
  const parsed = createCapsuleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid capsule payload." });
    return;
  }

  try {
    const capsule = createCapsule(parsed.data);
    res.status(201).json({ data: capsule });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create capsule." });
  }
});

app.post("/api/capsules/:id/open", (req, res) => {
  const parsed = capsuleActionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid actor." });
    return;
  }

  try {
    res.json({ data: openCapsule(req.params.id, parsed.data) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to open capsule." });
  }
});

app.post("/api/capsules/:id/cancel", (req, res) => {
  const parsed = capsuleActionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid actor." });
    return;
  }

  try {
    res.json({ data: cancelCapsule(req.params.id, parsed.data) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to cancel capsule." });
  }
});

app.listen(port, () => {
  console.log(`Stellar TimeCapsule API listening on http://localhost:${port}`);
});
