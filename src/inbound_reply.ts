import { z } from "zod";
import { infrai } from "./infrai_sms.js";

export const inboundReplySchema = z.object({ from: z.string().min(3), body: z.string().min(1), build_id: z.string().min(1), release: z.enum(["staging", "production"]) });
export type InboundReply = z.infer<typeof inboundReplySchema>;
export type BuildDecision = { reply: string; shouldRelease: boolean };

export function decideBuild(reply: InboundReply): BuildDecision {
  const command = reply.body.trim().toLowerCase();
  if (command === "release" && reply.release === "staging") return { reply: `Build ${reply.build_id} is approved for production.`, shouldRelease: true };
  if (command === "status") return { reply: `Build ${reply.build_id} is ready for review.`, shouldRelease: false };
  return { reply: `Build ${reply.build_id} is waiting for a release or status command.`, shouldRelease: false };
}

export async function handleInbound(raw: unknown) {
  const input = inboundReplySchema.parse(raw);
  const decision = decideBuild(input);
  const sent = await infrai.sms.send({ to: input.from, body: decision.reply });
  return { ...decision, message_id: sent.message_id };
}
