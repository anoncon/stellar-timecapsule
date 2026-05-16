import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { CapsuleActionInput, CreateCapsuleInput } from "../validation/schemas.js";

export type CapsuleStatus = "sealed" | "claimable" | "opened" | "canceled";

export interface CapsuleEvent {
  id: string;
  type: "created" | "opened" | "canceled";
  actor: string;
  timestamp: number;
}

export interface CapsuleRecord {
  id: string;
  creator: string;
  recipient: string;
  title: string;
  message: string;
  assetCode: string;
  amount: number;
  unlockAt: number;
  createdAt: number;
  openedAt?: number;
  canceledAt?: number;
  events: CapsuleEvent[];
}

const storePath = resolve(process.cwd(), process.env.CAPSULE_STORE_PATH ?? "backend/data/capsules.json");

function ensureStore() {
  const folder = dirname(storePath);
  if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
  if (!existsSync(storePath)) writeFileSync(storePath, "[]\n", "utf8");
}

function readStore(): CapsuleRecord[] {
  ensureStore();
  const raw = readFileSync(storePath, "utf8");
  return JSON.parse(raw) as CapsuleRecord[];
}

function writeStore(records: CapsuleRecord[]) {
  ensureStore();
  writeFileSync(storePath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function currentStatus(capsule: CapsuleRecord): CapsuleStatus {
  if (capsule.canceledAt) return "canceled";
  if (capsule.openedAt) return "opened";
  return Math.floor(Date.now() / 1000) >= capsule.unlockAt ? "claimable" : "sealed";
}

function withStatus(capsule: CapsuleRecord) {
  return {
    ...capsule,
    status: currentStatus(capsule),
    secondsUntilUnlock: Math.max(capsule.unlockAt - Math.floor(Date.now() / 1000), 0),
  };
}

export function listCapsules() {
  return readStore()
    .map(withStatus)
    .sort((left, right) => right.createdAt - left.createdAt);
}

export function getCapsule(id: string) {
  const record = readStore().find((capsule) => capsule.id === id);
  return record ? withStatus(record) : null;
}

export function createCapsule(input: CreateCapsuleInput) {
  if (input.unlockAt <= Math.floor(Date.now() / 1000)) {
    throw new Error("unlockAt must be in the future.");
  }

  const now = Math.floor(Date.now() / 1000);
  const capsule: CapsuleRecord = {
    id: randomUUID(),
    creator: input.creator.trim(),
    recipient: input.recipient.trim(),
    title: input.title.trim(),
    message: input.message.trim(),
    assetCode: input.assetCode.trim().toUpperCase(),
    amount: Number(input.amount.toFixed(2)),
    unlockAt: input.unlockAt,
    createdAt: now,
    events: [
      {
        id: randomUUID(),
        type: "created",
        actor: input.creator.trim(),
        timestamp: now,
      },
    ],
  };

  const records = readStore();
  records.push(capsule);
  writeStore(records);
  return withStatus(capsule);
}

export function openCapsule(id: string, input: CapsuleActionInput) {
  const records = readStore();
  const index = records.findIndex((capsule) => capsule.id === id);
  if (index === -1) throw new Error("Capsule not found.");

  const capsule = records[index];
  if (capsule.recipient !== input.actor.trim()) throw new Error("Only the intended recipient can open this capsule.");
  if (capsule.canceledAt) throw new Error("Canceled capsules cannot be opened.");
  if (capsule.openedAt) throw new Error("Capsule already opened.");
  if (Math.floor(Date.now() / 1000) < capsule.unlockAt) throw new Error("Capsule is still sealed.");

  const now = Math.floor(Date.now() / 1000);
  capsule.openedAt = now;
  capsule.events.push({ id: randomUUID(), type: "opened", actor: input.actor.trim(), timestamp: now });
  records[index] = capsule;
  writeStore(records);
  return withStatus(capsule);
}

export function cancelCapsule(id: string, input: CapsuleActionInput) {
  const records = readStore();
  const index = records.findIndex((capsule) => capsule.id === id);
  if (index === -1) throw new Error("Capsule not found.");

  const capsule = records[index];
  if (capsule.creator !== input.actor.trim()) throw new Error("Only the creator can cancel this capsule.");
  if (capsule.openedAt) throw new Error("Opened capsules cannot be canceled.");
  if (capsule.canceledAt) throw new Error("Capsule already canceled.");

  const now = Math.floor(Date.now() / 1000);
  capsule.canceledAt = now;
  capsule.events.push({ id: randomUUID(), type: "canceled", actor: input.actor.trim(), timestamp: now });
  records[index] = capsule;
  writeStore(records);
  return withStatus(capsule);
}
