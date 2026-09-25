import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function BookButton({ airline, route, price, label, compact }: { airline: string; route: string; price: string; label?: string; compact?: boolean }) {
  const { user, signIn } = useAuth();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function book() {
    if (!user) { signIn(); return; }
    setState("saving");
    const { error } = await supabase.from("bookings").insert({ user_id: user.id, airline, route, price });
    setState(error ? "error" : "saved");
  }

  const text = state === "saved" ? "Saved to your trips ✓" : state === "saving" ? "Saving…" : state === "error" ? "Try again" : !user ? "Sign in to book" : label ?? `Book with ${airline}`;
  if (compact)
    return <button onClick={book} disabled={state === "saving" || state === "saved"} className="font-label-sm text-label-sm text-status-emerald underline hover:text-primary">{text}</button>;
  return (
    <button onClick={book} disabled={state === "saving" || state === "saved"} className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary-container active:scale-95 transition-all disabled:opacity-70">
      <span>{text}</span>
    </button>
  );
}
