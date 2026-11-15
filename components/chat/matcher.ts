import { chatQA, FALLBACK, QUICK_REPLIES, WELCOME, WHATSAPP_LABEL, type ChatContext, type ChatIntent } from "@/content/chatbot";
import { projects, type Project } from "@/content/projects";

export type BotReply = { text: string; quick: string[]; action?: "lead" | "whatsapp"; topic?: string; context?: ChatContext; fallback?: boolean };
const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
const containsPhrase = (text: string, phrase: string) => ` ${text} `.includes(` ${norm(phrase)} `);
const aliases = (p: Project) => {
  const name = norm(p.location);
  return [name, name.replace(/\s/g, ""), ...(name === "maduravoyal" ? ["maduravoil", "madurayoal"] : []), ...(name === "thirumullaivoyal" ? ["thirumullaivayal", "thirumullai voyal"] : [])];
};
export function findLocation(text: string): Project | undefined {
  const t = norm(text);
  return projects.find((p) => aliases(p).some((alias) => containsPhrase(t, alias)));
}
const fallback = (): BotReply => ({ text: FALLBACK, quick: [], action: "whatsapp", fallback: true });
const serviceIntents = ["construction", "interiors", "jointventure"];
const intentFor = (id: string): ChatIntent | undefined => ({ offer: "homes", bhk: "homes", villas: "homes", where: "homes", price: "price", available: "available", visit: "visit", brochure: "brochure", construction: "construction", interiors: "interiors", jointventure: "jointventure" } as Record<string, ChatIntent>)[id];

function propertyReply(p: Project, bhk: string | undefined, context: ChatContext): BotReply {
  const listed = p.configurations.filter((c) => !bhk || String(c.bhk) === bhk);
  const sizes = (listed.length ? listed : p.configurations).map((c) => `${c.bhk} BHK`).join(" and ");
  const prefix = !listed.length && bhk ? `We don't currently list ${bhk} BHK in ${p.location}. ` : "";
  return {
    text: `${prefix}We list ${sizes} homes in ${p.location}. Our team can confirm current pricing and availability.`,
    quick: ["Book a site visit", "Floor plans", WHATSAPP_LABEL],
    topic: p.location, context,
  };
}

/** Bounded, approved replies: never guess prices, availability, approvals or appointment confirmations. */
export function reply(input: string, previous: ChatContext = {}): BotReply {
  const t = norm(input).slice(0, 500);
  if (!t) return fallback();
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|vanakkam|namaste|help|i need help|can you help|hello sp properties)$/.test(t)) return { text: WELCOME, quick: QUICK_REPLIES };
  if (/^(thanks|thank you|thank you very much|ok thanks|okay thanks|nandri|bye|goodbye)$/.test(t)) return { text: "Thank you for contacting SP Properties. Our team is available on WhatsApp if you need further assistance.", quick: [WHATSAPP_LABEL] };
  if (["talk on whatsapp", "contact on whatsapp", "open whatsapp"].includes(t)) return { text: "Contact our team on WhatsApp to continue your enquiry. Your selected home details will be included.", quick: [], action: "whatsapp" };
  if (["leave my number", "request a callback"].includes(t)) return { text: "Share your details below. Continue on WhatsApp to request a callback from our team.", quick: [], action: "lead" };
  // A location or a shared word must not turn an unrelated request into a property answer.
  if (/\b(weather|temperature|forecast|cricket|football|sports|score|politics|president|election|recipe|cooking|movie|movies|song|songs|lyrics|joke|jokes|poem|poetry|horoscope|astrology|python|javascript|coding|programming|homework|exam|essay|bitcoin|crypto|stock|stocks|trading|restaurant|restaurants|hotel|hotels|flight|flights|train|trains|hospital|doctor|medicine|medical|news|job|jobs|career|careers|hiring|rent|rental|rentals|ignore instructions|system prompt|white house)\b/.test(t)) return fallback();
  if (["services", "service", "your services", "what services", "what services are available", "what services do you offer"].includes(t) || ["your services", "services offered", "what services", "which services"].some((phrase) => containsPhrase(t, phrase))) return { text: "Choose the service you would like to discuss.", quick: ["Construction services", "Interior services", "Joint ventures", "Apartments"] };
  if (t === "locations") return { text: "Select a Chennai location to explore its listed homes.", quick: projects.map((p) => p.location), context: { ...previous, intent: "homes" } };

  const explicitLocation = findLocation(t);
  const explicitBhk = t.match(/\b(\d{1,2})\s*(?:bhk|bedrooms?|bed\s*rooms?)\b/)?.[1] ?? (previous.intent && /^(2|3)$/.test(t) ? t : undefined);
  const location = explicitLocation ?? projects.find((p) => p.location === previous.location);
  const bhk = explicitBhk ?? previous.bhk;
  const ranked = chatQA.map((qa) => ({ qa, score: qa.keywords.reduce((score,k) => score + (containsPhrase(t,k) ? k.length : 0),0) })).sort((a,b) => b.score-a.score);
  let best = ranked[0]?.score ? ranked[0].qa : undefined;
  // Full office-hours questions are more specific than the shared word "office".
  if (chatQA.find((qa) => qa.id === "hours")!.keywords.some((k) => containsPhrase(t,k))) best = chatQA.find((qa) => qa.id === "hours");
  const bareLocation = explicitLocation && aliases(explicitLocation).some((alias) => [alias,`in ${alias}`,`${alias} please`,`${alias} chennai`].includes(t));
  const moreDetails = ["details", "more details", "tell me more", "more information"].includes(t);
  if (moreDetails && previous.intent) best = chatQA.find((qa) => qa.id === (previous.intent === "homes" ? "offer" : previous.intent));
  if (!best && !bareLocation && !explicitBhk) return fallback();
  const explicitService = ranked.find(({qa,score}) => score && serviceIntents.includes(qa.id))?.qa.id;
  const activeService = explicitService ?? (previous.intent && serviceIntents.includes(previous.intent) ? previous.intent : undefined);
  const pricing = chatQA.find((qa) => qa.id === "price")!.keywords.some((k) => containsPhrase(t,k));
  const timing = chatQA.find((qa) => qa.id === "available")!.keywords.some((k) => containsPhrase(t,k));
  if (activeService && (pricing || timing)) {
    const scope = activeService === "construction" ? "Construction estimates and schedules depend on your plot, design, materials and scope." : activeService === "interiors" ? "Interior estimates and schedules depend on the rooms, materials, finishes and scope." : "Joint venture feasibility and proposed terms depend on your site and development scope.";
    return { text: `${scope} Share your location and requirements with our team for a project-specific discussion.`, quick: [], action: "whatsapp", topic: activeService === "jointventure" ? "Landowner joint venture" : activeService === "interiors" ? "Interior services" : "Home construction", context: { ...previous, location: location?.location, intent: activeService as ChatIntent } };
  }
  if (!best && bareLocation && previous.intent && serviceIntents.includes(previous.intent)) {
    const service = chatQA.find((qa) => qa.id === previous.intent)!;
    return { text: `For ${explicitLocation!.location}: ${service.answer}`, quick: [], action: "whatsapp", topic: explicitLocation!.location, context: { ...previous, location: explicitLocation!.location } };
  }
  const intent = best ? intentFor(best.id) : (bareLocation && previous.intent === "brochure" ? "brochure" : "homes");
  const context: ChatContext = { ...previous, ...(location ? { location: location.location } : {}), ...(explicitBhk ? { bhk: explicitBhk } : {}), ...(intent ? { intent } : {}) };
  if (best?.id === "visit") return { text: best.answer, quick: [], action: "lead", topic: location?.location, context };
  if (best?.id === "talk") return { text: best.answer, quick: [], action: "whatsapp", context };
  if ((best?.id === "brochure" || (!best && intent === "brochure")) && location) return { text: `Ask our team for the ${bhk ? `${bhk} BHK ` : ""}brochure, floor plans and size details for ${location.location}. They will confirm the documents relevant to your enquiry.`, quick: [], action: "whatsapp", topic: location.location, context };
  const homeIntent = !best || ["offer", "bhk", "where", "price", "available", "villas"].includes(best.id);
  if (location && homeIntent && !explicitService) return propertyReply(location,bhk,context);
  if (explicitBhk && homeIntent) {
    if (!["2","3"].includes(explicitBhk)) return { text: `We list 2 and 3 BHK homes. We don't currently list ${explicitBhk} BHK homes. Contact our team to discuss your requirements.`, quick: ["2 BHK", "3 BHK", WHATSAPP_LABEL], context };
    const matches = projects.filter((p) => p.configurations.some((c) => String(c.bhk) === explicitBhk));
    return { text: `${explicitBhk} BHK homes are listed in ${matches.length} Chennai locations. Choose a location for details.`, quick: matches.map((p) => p.location), context };
  }
  if (best) return { text: best.answer, quick: best.id === "where" ? projects.map((p) => p.location) : best.followUps, topic: location?.location ?? (explicitService ? best.question : undefined), context };
  return fallback();
}
