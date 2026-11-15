import { z } from "zod";

const safeWhatsAppUrl = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return url.origin === "https://wa.me" && !url.username && !url.password && /^\/\d+$/.test(url.pathname);
  } catch { return false; }
});
const chatAction = z.object({ href: safeWhatsAppUrl, label: z.string().min(1).max(100) });
const message = z.union([
  z.object({ id: z.number().int().positive(), from: z.enum(["bot", "user"]), text: z.string().max(4000), quick: z.array(z.string().max(100)).max(20).optional(), cta: chatAction.optional() }),
  z.object({ id: z.number().int().positive(), from: z.literal("bot"), kind: z.literal("lead") }),
  z.object({ id: z.number().int().positive(), from: z.literal("bot"), kind: z.literal("link"), href: safeWhatsAppUrl, label: z.string().max(100) }),
]);
export type ChatMessage = z.infer<typeof message>;
const context = z.object({ location: z.string().max(100).optional(), bhk: z.string().regex(/^\d{1,2}$/).optional(), intent: z.enum(["homes", "price", "available", "visit", "brochure", "construction", "interiors", "jointventure"]).optional() });
const session = z.object({ context: context.optional(), msgs: z.array(message).min(1).max(100), topic: z.string().max(150) }).refine((value) => new Set(value.msgs.map((m) => m.id)).size === value.msgs.length);

/** Browser storage may be stale, truncated or changed; never render it unchecked. */
export function readChatSession(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = session.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    return { ...parsed.data, context: parsed.data.context ?? {}, nextId: Math.max(...parsed.data.msgs.map((m) => m.id)) + 1 };
  } catch { return null; }
}
