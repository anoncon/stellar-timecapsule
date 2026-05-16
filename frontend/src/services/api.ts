import type { Capsule, CreateCapsulePayload } from "../types/capsule";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Unexpected API error");
  }
  return body;
}

export async function listCapsules(): Promise<Capsule[]> {
  const response = await fetch(`${API_BASE}/capsules`);
  const body = await parseResponse<{ data: Capsule[] }>(response);
  return body.data;
}

export async function createCapsule(payload: CreateCapsulePayload): Promise<Capsule> {
  const response = await fetch(`${API_BASE}/capsules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await parseResponse<{ data: Capsule }>(response);
  return body.data;
}

export async function openCapsule(id: string, actor: string): Promise<Capsule> {
  const response = await fetch(`${API_BASE}/capsules/${id}/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor }),
  });
  const body = await parseResponse<{ data: Capsule }>(response);
  return body.data;
}

export async function cancelCapsule(id: string, actor: string): Promise<Capsule> {
  const response = await fetch(`${API_BASE}/capsules/${id}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor }),
  });
  const body = await parseResponse<{ data: Capsule }>(response);
  return body.data;
}
