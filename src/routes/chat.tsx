import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { askAssistant } from "@/lib/chat.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Multilingual AI Travel Assistant | AeroWay Companion" },
      { name: "description", content: "Ask anything about your flight, terminal or transfers in your own language." },
      { property: "og:title", content: "Multilingual AI Travel Assistant | AeroWay Companion" },
      { property: "og:description", content: "Ask anything about your flight, terminal or transfers in your own language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Chat,
});

type Msg = { id?: string | undefined; role: "user" | "assistant"; content: string; feedback?: number | null };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi there! Flight MAA to DXB is on track. You depart from Gate B12. How can I make your journey smoother today?",
};

const CHIPS = [
  { icon: "luggage", label: "Baggage rules", q: "What are the baggage size rules for economy?" },
  { icon: "coffee", label: "Lounge near B12", q: "Which lounge is closest to Gate B12?" },
  { icon: "sunny", label: "DXB Weather", q: "What's the weather like in Dubai today?" },
  { icon: "shopping_bag", label: "Duty Free", q: "What duty free shops are near my gate?" },
];

function Chat() {
  const { user } = useAuth();
  const ask = useServerFn(askAssistant);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("posts")
      .select("id, role, content, feedback")
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data?.length) setMsgs([GREETING, ...(data as Msg[])]);
      });
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  async function save(m: Msg): Promise<Msg> {
    if (!user) return m;
    const { data } = await supabase
      .from("posts")
      .insert({ user_id: user.id, role: m.role, content: m.content })
      .select("id")
      .single();
    return { ...m, id: data?.id };
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setError(null);
    const userMsg = await save({ role: "user", content: q });
    const next = [...msgs, userMsg];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await ask({
        data: { history: next.slice(-20).map(({ role, content }) => ({ role, content })) },
      });
      if ("error" in res && res.error) setError(res.error);
      else if ("text" in res && res.text) {
        const bot = await save({ role: "assistant", content: res.text });
        setMsgs((p) => [...p, bot]);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function rate(i: number, v: number) {
    const m = msgs[i];
    setMsgs((p) => p.map((x, j) => (j === i ? { ...x, feedback: v } : x)));
    if (m?.id) await supabase.from("posts").update({ feedback: v }).eq("id", m.id);
  }

  return (
    <AppShell title="Chat">
      <div className="flex flex-col w-full gap-space-lg pb-space-xl">
        <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)]">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container">
              <span translate="no" className="notranslate material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Hello, Captain! ✈️</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {user ? "Your chats are saved to your account." : "Sign in to save your chat history."}
              </p>
            </div>
          </div>
          <span className="font-label-sm text-label-sm px-2.5 py-1 bg-surface-container rounded-full text-primary shrink-0">Live 24/7</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CHIPS.map((c) => (
            <button key={c.label} onClick={() => send(c.q)} disabled={busy}
              className="bg-pure-white hover:bg-surface-container-low px-3.5 py-2 rounded-full font-label-md text-label-md text-primary shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] shrink-0 flex items-center gap-1.5 active:scale-95">
              <span translate="no" className="notranslate material-symbols-outlined text-[16px] text-surface-tint">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-space-md">
          {msgs.map((m, i) =>
            m.role === "assistant" ? (
              <div key={m.id ?? i} className="flex items-start gap-space-sm max-w-[88%]">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary">
                  <span translate="no" className="notranslate material-symbols-outlined text-[16px]">smart_toy</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="bg-pure-white p-space-md rounded-xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] text-on-surface font-body-md whitespace-pre-wrap">
                    {m.content}
                  </div>
                  {i > 0 && (
                    <div className="flex gap-1 px-1">
                      {[1, -1].map((v) => (
                        <button key={v} onClick={() => rate(i, v)} aria-label={v > 0 ? "Helpful" : "Not helpful"}
                          className={`material-symbols-outlined text-[16px] ${m.feedback === v ? "text-primary" : "text-on-surface-variant"}`}>
                          {v > 0 ? "thumb_up" : "thumb_down"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={m.id ?? i} className="flex items-start gap-space-sm max-w-[88%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-on-secondary">
                  <span translate="no" className="notranslate material-symbols-outlined text-[16px]">person</span>
                </div>
                <div className="bg-primary text-on-primary p-space-md rounded-xl font-body-md whitespace-pre-wrap">{m.content}</div>
              </div>
            ),
          )}
          {busy && <p className="font-body-sm text-on-surface-variant px-10">AeroWay is typing…</p>}
          {error && <p className="font-body-sm text-error px-10">{error}</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="sticky bottom-20 z-40 bg-pure-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-[0_8px_24px_-4px_rgba(18,35,63,0.12)] flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={2000}
            className="flex-1 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant px-4 py-2.5 rounded-xl font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ask about gate, baggage, food, lounge..." />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send message"
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 active:scale-95">
            <span translate="no" className="notranslate material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
