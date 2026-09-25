import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(30),
});

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
    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        system:
          "You are AeroWay, a friendly multilingual airport travel assistant. The traveller is on flight MAA→DXB from Gate B12, boarding 01:55. Reply in the user's language, concisely (under 120 words).",
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
