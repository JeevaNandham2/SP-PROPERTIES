"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, X, RotateCcw, MessageCircle, ArrowUpRight } from "lucide-react";
import { QUICK_REPLIES, WELCOME, WHATSAPP_LABEL, type ChatContext } from "@/content/chatbot";
import { locations } from "@/content/projects";
import { site } from "@/content/site";
import { enquiryMessage, forwardEnquiry, track, waLink } from "@/lib/whatsapp";
import { reply } from "./matcher";
import { readChatSession, type ChatMessage as Msg } from "./session";
import { enquirySchema } from "@/lib/validation";
import "./chat.css";

const KEY = "sp-chat-v2";
const intentLabels: Record<string,string> = { homes: "Home enquiry", price: "Pricing", available: "Availability", visit: "Site visit", brochure: "Brochure and floor plans", construction: "House construction", interiors: "Interior services", jointventure: "Landowner joint venture" };
function handoff(context: ChatContext, question?: string) {
  return waLink(["Hello SP Properties, I would like assistance.", context.location ? `Location: ${context.location}` : "", context.bhk ? `Configuration: ${context.bhk} BHK` : "", context.intent ? `Interested in: ${intentLabels[context.intent]}` : "", question ? `Enquiry: ${question}` : ""].filter(Boolean).join("\n"));
}

export function ChatWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [topic, setTopic] = useState("General enquiry");
  const [text, setText] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const uid = useRef(1);
  const contextRef = useRef<ChatContext>({});
  const processing = useRef(false);
  const pending = useRef(new Set<number>());
  const dialogRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = readChatSession(sessionStorage.getItem(KEY));
      if (saved) {
        setMsgs(saved.msgs); setTopic(saved.topic); contextRef.current = saved.context; uid.current = saved.nextId; setHydrated(true); return;
      }
    } catch { /* Browser storage is optional. */ }
    uid.current = 2;
    setMsgs([{ id: 1, from: "bot", text: WELCOME, quick: QUICK_REPLIES }]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(KEY, JSON.stringify({ msgs, topic, context: contextRef.current })); } catch { /* Browser storage is optional. */ }
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [msgs, topic, hydrated, isReplying]);

  useEffect(() => {
    const timers = pending.current;
    return () => { timers.forEach(clearTimeout); timers.clear(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key !== "Tab") return;
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)') ?? []).filter((item) => item.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; };
  }, [open, onClose]);

  const ask = (question: string) => {
    const q = question.trim().slice(0, 500);
    if (!q || !hydrated || processing.current) return;
    processing.current = true; setIsReplying(true);
    const user: Msg = { id: uid.current++, from: "user", text: q };
    setMsgs((m) => [...m, user].slice(-100));
    const r = reply(q, contextRef.current);
    if (r.context) contextRef.current = r.context;
    const nextTopic = contextRef.current.location ?? r.topic ?? "General enquiry";
    setTopic(nextTopic);
    const href = r.action === "whatsapp" ? handoff(contextRef.current, q) : undefined;
    const timer = window.setTimeout(() => {
      pending.current.delete(timer);
      const next: Msg[] = [{ id: uid.current++, from: "bot", text: r.text, quick: r.quick, ...(href ? { cta: { href, label: WHATSAPP_LABEL } } : {}) }];
      if (r.action === "lead") next.push({ id: uid.current++, from: "bot", kind: "lead" });
      if (r.fallback) track("fallback_shown", { source: "chat" });
      setMsgs((m) => [...m, ...next].slice(-100));
      processing.current = false; setIsReplying(false);
    }, 300);
    pending.current.add(timer);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); if (processing.current) return; ask(text); setText(""); };
  const restart = () => {
    pending.current.forEach(clearTimeout); pending.current.clear(); processing.current = false; setIsReplying(false);
    contextRef.current = {}; setTopic("General enquiry"); setText("");
    setMsgs([{ id: uid.current++, from: "bot", text: WELCOME, quick: QUICK_REPLIES }]); inputRef.current?.focus();
  };
  if (!open) return null;
  const lastId = msgs[msgs.length - 1]?.id;
  return (
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Chat with ${site.name}`} className="sp-chat">
      <header className="sp-chat-header"><span className="sp-chat-brand" aria-hidden="true" /><div><p>{site.name}</p><span>Property &amp; construction assistant</span></div><button type="button" onClick={restart} aria-label="Restart chat"><RotateCcw size={16} /></button><button type="button" onClick={onClose} aria-label="Close chat"><X size={20} /></button></header>
      <div className="sp-chat-service-note">Homes · Construction · Interiors · Joint ventures</div>
      <div ref={logRef} role="log" aria-live="polite" aria-relevant="additions" className="sp-chat-log">
        {msgs.map((m) => {
          if ("kind" in m && m.kind === "lead") return <LeadForm key={m.id} topic={topic} />;
          if ("kind" in m && m.kind === "link") return <a key={m.id} href={m.href} target="_blank" rel="noopener noreferrer" className="sp-chat-whatsapp" onClick={() => track("whatsapp_clicked", { source: "chat" })}><MessageCircle size={16} />{m.label}</a>;
          const msg = m as Extract<Msg, { text: string }>;
          return <div key={msg.id} className={`sp-chat-turn ${msg.from === "user" ? "is-user" : "is-assistant"}`} data-sender={msg.from}>
            <p className="sp-chat-message">{msg.text}</p>
            {msg.cta && <a href={msg.cta.href} target="_blank" rel="noopener noreferrer" className="sp-chat-whatsapp" onClick={() => track("whatsapp_clicked", { source: "chat" })}><MessageCircle size={16} />{msg.cta.label}<ArrowUpRight size={15} /></a>}
            {msg.quick && msg.id === lastId && !isReplying && msg.quick.length > 0 && <div className="sp-chat-suggestions" role="group" aria-label="Suggested replies">{msg.quick.map((q) => q === WHATSAPP_LABEL ? <a key={q} href={handoff(contextRef.current)} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_clicked", { source: "chat" })}><MessageCircle size={13} />{q}</a> : <button key={q} type="button" onClick={() => ask(q)}>{q}</button>)}</div>}
          </div>;
        })}
        {isReplying && <div role="status" className="sp-chat-typing"><span /><span /><span /><span className="sr-only">Preparing your reply</span></div>}
      </div>
      <form onSubmit={submit} className="sp-chat-composer"><label htmlFor="chat-input" className="sr-only">Type your question</label><input id="chat-input" ref={inputRef} value={text} maxLength={500} onChange={(e) => setText(e.target.value)} autoComplete="off" placeholder="Ask about a home or service" /><button type="submit" aria-label="Send" disabled={!hydrated || !text.trim() || isReplying}><Send size={18} /></button></form>
      <p className="sp-chat-footer">Automated guidance. Project details confirmed by our team.</p>
    </section>
  );
}

function LeadForm({ topic }: { topic: string }) {
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ name: string; href: string } | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const mobile = String(f.get("mobile") || "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    if (!enquirySchema.shape.name.safeParse(name).success || !enquirySchema.shape.mobile.safeParse(mobile).success) { setError("Please enter your name (2–80 characters) and a valid 10-digit mobile number."); return; }
    const location = String(f.get("location") || "");
    if (!locations.includes(location)) { setError("Please select a location for your enquiry."); return; }
    const enquiry = { name, mobile, location, bhk: String(f.get("bhk")), message: f.get("day") ? `Preferred visit day: ${f.get("day")}` : "", source: "Website chat" };
    const href = waLink(enquiryMessage(enquiry));
    track("lead_submitted", { source: "chat" });
    void forwardEnquiry(enquiry);
    setSent({ name, href });
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (sent)
    return (
      <div className="flex flex-col gap-2">
        <p className="max-w-[86%] rounded-2xl rounded-bl-sm bg-soft px-3.5 py-2.5 text-[15px] text-navy">
          Thank you, {sent.name}. Send your details on WhatsApp to complete your request. Our team will confirm any appointment directly.
        </p>
        <a href={sent.href} target="_blank" rel="noopener noreferrer" className="self-start rounded-full bg-gold px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-navy">Send on WhatsApp</a>
      </div>
    );

  const inp = "min-h-[44px] min-w-0 rounded-md border border-line bg-white px-2.5 text-base";
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-2 rounded-xl bg-soft p-3" aria-label="Leave your details">
      <input name="name" aria-label="Your name" placeholder="Your name *" autoComplete="name" className={inp} />
      <input name="mobile" aria-label="Mobile number" placeholder="10-digit mobile *" inputMode="numeric" autoComplete="tel" className={inp} />
      <select name="location" aria-label="Location" defaultValue={locations.includes(topic) ? topic : ""} required className={inp}>
        <option value="" disabled>Select a location</option>{locations.map((l) => (<option key={l}>{l}</option>))}
      </select>
      <select name="bhk" aria-label="Configuration" className={inp}><option>2 BHK</option><option>3 BHK</option><option>Not sure</option></select>
      <input name="day" aria-label="Preferred visit day (optional)" placeholder="Preferred visit day (optional)" className={inp} />
      {error && <p role="alert" className="text-[13px] text-error">{error}</p>}
      <button type="submit" className="min-h-[42px] rounded-full bg-gold text-[12px] font-semibold uppercase tracking-[0.16em] text-navy">Send on WhatsApp</button>
    </form>
  );
}
