import assert from "node:assert/strict";
import test from "node:test";
import { readChatSession } from "../components/chat/session";
import { findLocation, reply } from "../components/chat/matcher";
import { FALLBACK } from "../content/chatbot";
import { waLink, enquiryMessage } from "../lib/whatsapp";

const saved = (msgs: unknown[], extra = {}) => JSON.stringify({ msgs, topic: "Ambattur", ...extra });

test("invalid or outdated browser storage starts a fresh conversation", () => {
  for (const raw of [null, "", "{", "null", "[]", "{}", saved([]), saved([{ id: 1, text: 42 }])]) {
    assert.equal(readChatSession(raw), null);
  }
});

test("restored conversations derive the next ID from messages, not stale counters", () => {
  const result = readChatSession(saved([
    { id: 9, from: "bot", text: "Welcome", quick: ["Locations"] },
    { id: 12, from: "user", text: "Ambattur" },
    { id: 15, from: "bot", kind: "lead" },
  ], { uid: 2 }));
  assert.equal(result?.nextId, 16);
  assert.equal(result?.topic, "Ambattur");
  assert.equal(result?.msgs.length, 3);
});

test("duplicate IDs and oversized conversations are discarded", () => {
  const message = { id: 1, from: "bot", text: "Hello" };
  assert.equal(readChatSession(saved([message, message])), null);
  assert.equal(readChatSession(saved(Array.from({ length: 101 }, (_, i) => ({ ...message, id: i + 1 })))), null);
});

test("restored action links only allow the expected WhatsApp origin", () => {
  for (const href of ["javascript:alert(1)", "https://wa.me.evil.test/123", "https://evil.test/123", "https://wa.me:8080/123", "https://user@wa.me/123", "http://wa.me/123"]) {
    assert.equal(readChatSession(saved([{ id: 1, from: "bot", kind: "link", href, label: "Open WhatsApp" }])), null);
  }
  assert.ok(readChatSession(saved([{ id: 1, from: "bot", kind: "link", href: "https://wa.me/919500124126?text=Hello", label: "Open WhatsApp" }])));
});

test("location aliases match full words without confusing similar names", () => {
  assert.equal(findLocation("Any homes in Anna Nagar?")?.location, "Anna Nagar");
  assert.equal(findLocation("annanagar")?.location, "Anna Nagar");
  assert.equal(findLocation("Annanur")?.location, "Annanur");
  assert.equal(findLocation("Maduravoil")?.location, "Maduravoyal");
  assert.equal(findLocation("Ambatturian"), undefined);
});

test("keyword fragments do not trigger unrelated chat answers", () => {
  assert.equal(reply("corporate").text, FALLBACK);
  assert.equal(reply("planet").text, FALLBACK);
  assert.equal(reply("How much in Ambattur?").topic, "Ambattur");
  assert.equal(reply("Where is your office in Ambattur?").topic, "Ambattur");
  assert.match(reply("Where is your office in Ambattur?").text, /Our office/);
});

test("property enquiries preserve the no-price UI and handle unsupported sizes", () => {
  const response = reply("4 BHK in Ambattur");
  assert.match(response.text, /don.t currently list 4 BHK/);
  assert.doesNotMatch(response.text, /₹|\d+\s*(lakhs?|cr|crores?)/i);
  assert.equal(reply("Book a site visit").action, "lead");
  assert.equal(reply("Talk on WhatsApp").action, "whatsapp");
});

test("WhatsApp enquiry messages retain punctuation and line breaks", () => {
  const message = enquiryMessage({ name: "A & B", mobile: "9876543210", location: "Anna Nagar", bhk: "3 BHK", message: "Saturday? 10:00\nPlease call", source: "Contact" });
  const url = new URL(waLink(message));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.searchParams.get("text"), message);
  assert.match(message, /Name: A & B/);
  assert.match(message, /Saturday\? 10:00\nPlease call/);
});

test("unrelated questions always return one handoff and no suggestions", () => {
  for (const input of ["What is the weather in Ambattur?", "Tell me a joke about houses", "Who won the cricket match?", "Write Python for a property website", "Best restaurants in Anna Nagar", "Show me rental properties", "Explain quantum physics", "planet", "corporate"]) {
    const result = reply(input, { location: "Ambattur", bhk: "2", intent: "homes" });
    assert.equal(result.text, FALLBACK, input);
    assert.deepEqual(result.quick, [], input);
    assert.equal(result.action, "whatsapp", input);
    assert.equal(result.fallback, true, input);
    assert.equal(result.context, undefined, input);
  }
});

test("home follow-ups retain location and configuration", () => {
  const first = reply("2 BHK in Ambattur");
  assert.equal(first.context?.location, "Ambattur");
  assert.equal(first.context?.bhk, "2");
  const price = reply("What is the price?", first.context);
  assert.match(price.text, /2 BHK flats in Ambattur/);
  assert.doesNotMatch(price.text, /\d+\s*(lakhs?|crores?)/i);
  const brochure = reply("Floor plans", price.context);
  assert.match(brochure.text, /2 BHK.*Ambattur/);
  assert.equal(brochure.action, "whatsapp");
  const differentSize = reply("3 BHK", first.context);
  assert.match(differentSize.text, /3 BHK flats in Ambattur/);
});

test("brochure and service location selections keep the enquiry intent", () => {
  const brochure = reply("I need a brochure");
  const chosen = reply("Annanur", brochure.context);
  assert.equal(chosen.context?.intent, "brochure");
  assert.match(chosen.text, /brochure.*Annanur/);
  const construction = reply("Can you build on my own plot?");
  assert.equal(construction.context?.intent, "construction");
  const site = reply("Ambattur", construction.context);
  assert.equal(site.context?.intent, "construction");
  assert.match(site.text, /construction services/);
  assert.equal(site.action, "whatsapp");
});

test("construction and interior estimates stay relevant without invented prices", () => {
  for (const input of ["Construction estimate", "Interior estimate", "How long does construction take?", "What is your joint venture cost?"]) {
    const result = reply(input);
    assert.equal(result.action, "whatsapp", input);
    assert.doesNotMatch(result.text, /\d+\s*(days|weeks|months|lakhs?|crores?)/i);
    assert.notEqual(result.text, FALLBACK);
  }
  const service = reply("Interior services");
  assert.match(reply("What is the cost?", service.context).text, /Interior estimates/);
});

test("office hours and approvals never imply unconfirmed business facts", () => {
  assert.match(reply("What are your office hours?").text, /confirm office hours/);
  assert.doesNotMatch(reply("Is it RERA approved?").text, /yes|all projects are approved/i);
  assert.match(reply("What is your email address?").text, /sppropertiessp@gmail.com/);
  assert.equal(reply("I want to book a site visit").action, "lead");
});

test("all approved questions and suggested actions can be resolved", async () => {
  const { chatQA, QUICK_REPLIES } = await import("../content/chatbot");
  for (const qa of chatQA) {
    assert.notEqual(reply(qa.question).text, FALLBACK, qa.question);
    for (const followUp of qa.followUps) assert.notEqual(reply(followUp).text, FALLBACK, followUp);
  }
  for (const quick of QUICK_REPLIES) assert.notEqual(reply(quick).text, FALLBACK, quick);
});

test("restored conversation validates attached actions and bounded context", () => {
  const msgs = [{ id: 1, from: "bot", text: FALLBACK, cta: { href: waLink("Hello"), label: "Contact on WhatsApp" } }];
  assert.equal(readChatSession(saved(msgs, { context: { location: "Ambattur", bhk: "2", intent: "homes" } }))?.context.bhk, "2");
  assert.equal(readChatSession(saved(msgs, { context: { intent: "untrusted" } })), null);
  assert.equal(readChatSession(saved([{ ...msgs[0], cta: { href: "javascript:alert(1)", label: "Open" } }])), null);
});

test("common service and home enquiry phrasing remains in scope", () => {
  for (const input of ["What are your services?", "Tell me about your services", "Which services are offered?"]) {
    assert.ok(reply(input).quick.includes("Construction services"), input);
  }
  assert.match(reply("Any units in Ambattur?").text, /flats in Ambattur/);
  assert.notEqual(reply("Do you sell houses?").text, FALLBACK);
  assert.notEqual(reply("What are your charges?").text, FALLBACK);
});
