import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(30),
  flightNumber: z.string().trim().max(10).optional(),
});

/** Look up any flight mentioned in the conversation so the answer uses real data. */
async function liveFlightContext(history: { role: string; content: string }[], pinned?: string) {
  const { extractFlightNumbers, fetchFlights, summariseFlight } = await import("./aviationstack.server");

  const recent = history
    .slice(-4)
    .map((m) => m.content)
    .join(" ");
  const candidates = [...new Set([...(pinned ? [pinned.replace(/[\s-]/g, "").toUpperCase()] : []), ...extractFlightNumbers(recent)])].slice(0, 2);
  if (!candidates.length) return "";

  const summaries: string[] = [];
  for (const flightIata of candidates) {
    const res = await fetchFlights({ flightIata, limit: 1 });
    if (res.ok && res.flights.length) summaries.push(summariseFlight(res.flights[0]!));
  }
  if (!summaries.length) return "";
  return `\n\nLive airline data (Aviationstack, fetched just now — prefer it over anything else):\n- ${summaries.join("\n- ")}`;
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key },
    });

    let flightContext = "";
    try {
      flightContext = await liveFlightContext(data.history, data.flightNumber);
    } catch (e) {
      console.error("live flight lookup failed", e);
    }

    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        system:
          "You are AeroWay, a friendly multilingual airport travel assistant. The traveller is on flight MAA→DXB from Gate B12, boarding 01:55. " +
          "When live airline data is provided below, quote the real gate, terminal, times, delays and baggage belt from it, and say the data is live. " +
          "If a traveller asks about a flight and no live data is provided, say you could not fetch live data for it. " +
          "Reply in the user's language, concisely (under 120 words)." +
          flightContext,
        messages: data.history,
        maxRetries: 0,
        providerOptions: {
          openai: { forceReasoning: true, reasoningEffort: "low", store: false },
        },
      });
      const text = await result.text;
      if (!text) return { error: "The assistant couldn't answer that." };
      return { text };
    } catch (e: any) {
      const status = e?.statusCode ?? e?.status;
      if (status === 429) return { error: "Too many requests — please wait a moment." };
      if (status === 402) return { error: "AI credits are used up. Please add credits to continue." };
      console.error(e);
      return { error: "The assistant is unavailable right now." };
    }
  });
