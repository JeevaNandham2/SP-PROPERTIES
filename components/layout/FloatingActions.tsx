"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { waLink, track } from "@/lib/whatsapp";

/** The chatbox is loaded only when opened, so it never slows down the first page load. */
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget").then((m) => m.ChatWidget), { ssr: false });

export function FloatingActions() {
  const [chatOpen, setChatOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const openChat = () => {
    setLoaded(true);
    setChatOpen(true);
    track("chat_opened");
  };

  return (
    <>
      {!chatOpen && (
        <>
          <button
            type="button"
            id="chat-launcher"
            aria-label="Open chat"
            onClick={openChat}
            className="floating-chat fixed bottom-[92px] right-5 z-[60] flex h-[58px] w-[58px] items-center justify-center rounded-full border-2 border-gold bg-navy text-gold shadow-float transition hover:-translate-y-0.5 md:right-6"
          >
            <MessageSquareText className="h-6 w-6" aria-hidden />
          </button>
          <a
            href={waLink("Hi SP Properties, I'm interested in your projects.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with SP Properties on WhatsApp"
            onClick={() => track("whatsapp_clicked", { source: "floating" })}
            className="floating-whatsapp fixed bottom-5 right-5 z-[60] inline-flex min-h-[54px] items-center gap-2 rounded-full bg-gold px-5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-navy shadow-float transition hover:bg-gold-hover md:bottom-6 md:right-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" />
            </svg>
            <span className="floating-whatsapp-label">WhatsApp</span>
          </a>
        </>
      )}
      {loaded && <ChatWidget open={chatOpen} onClose={() => { setChatOpen(false); setTimeout(() => document.getElementById("chat-launcher")?.focus(), 0); }} />}
    </>
  );
}
