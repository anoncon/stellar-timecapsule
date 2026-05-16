export type CapsuleStatus = "sealed" | "claimable" | "opened" | "canceled";

export interface CapsuleEvent {
  id: string;
  type: "created" | "opened" | "canceled";
  actor: string;
  timestamp: number;
}

export interface Capsule {
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
  status: CapsuleStatus;
  secondsUntilUnlock: number;
  events: CapsuleEvent[];
}

export interface CreateCapsulePayload {
  creator: string;
  recipient: string;
  title: string;
  message: string;
  assetCode: string;
  amount: number;
  unlockAt: number;
}
