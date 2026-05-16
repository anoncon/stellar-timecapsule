import { z } from "zod";

export const createCapsuleSchema = z.object({
  creator: z.string().min(8),
  recipient: z.string().min(8),
  title: z.string().min(4).max(80),
  message: z.string().min(12).max(400),
  assetCode: z.string().min(2).max(12),
  amount: z.number().positive(),
  unlockAt: z.number().int().positive(),
});

export const capsuleActionSchema = z.object({
  actor: z.string().min(8),
});

export type CreateCapsuleInput = z.infer<typeof createCapsuleSchema>;
export type CapsuleActionInput = z.infer<typeof capsuleActionSchema>;
