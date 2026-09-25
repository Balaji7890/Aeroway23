import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function HelpRequestForm() {
  const { user } = useAuth();
  const [f, setF] = useState({ name: "", contact: "", category: "General", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.contact.trim() || !f.message.trim()) return;
    setState("sending");
    const { error } = await supabase.from("help_requests").insert({
      user_id: user?.id ?? null,
      name: f.name.trim().slice(0, 100),
      contact: f.contact.trim().slice(0, 200),
      category: f.category,
      message: f.message.trim().slice(0, 2000),
    });
    setState(error ? "error" : "done");
    if (!error) setF({ name: "", contact: "", category: "General", message: "" });
  }

  const cls = "w-full bg-surface-container-low rounded-xl px-3 py-2.5 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary";
  return (
    <form onSubmit={submit} className="bg-pure-white rounded-2xl p-space-md flex flex-col gap-3 shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)]">
      <h4 className="font-headline-sm text-headline-sm text-on-surface">Request help from the desk</h4>
      <input className={cls} placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
      <input className={cls} placeholder="Phone or email" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} required />
      <select className={cls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
        {["General", "Airline", "Airport", "Medical", "Emergency", "Lost baggage"].map((c) => <option key={c}>{c}</option>)}
      </select>
      <textarea className={cls} rows={3} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required />
      <button disabled={state === "sending"} className="bg-primary text-on-primary py-2.5 rounded-xl font-label-lg disabled:opacity-50">
        {state === "sending" ? "Sending…" : "Send request"}
      </button>
      {state === "done" && <p className="font-body-sm text-status-emerald">Sent! A desk agent will contact you shortly.</p>}
      {state === "error" && <p className="font-body-sm text-error">Couldn't send. Please try again.</p>}
    </form>
  );
}
