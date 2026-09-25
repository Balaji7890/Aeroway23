import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FLIGHT_EVENT_TYPES } from "@/lib/flight-events";
import { applyFlightEventToPassenger } from "@/lib/journey.functions";

const EventBody = z.object({
  event_type: z.enum(FLIGHT_EVENT_TYPES),
  flight_number: z.string().trim().min(2).max(10).optional(),
  passenger_id: z.string().uuid().optional(),
  old_value: z.string().trim().max(40).nullish(),
  new_value: z.string().trim().max(40).nullish(),
  delay_minutes: z.number().int().min(0).max(1440).nullish(),
  note: z.string().trim().max(300).nullish(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

/**
 * Airline / airport webhook. Receives one flight event, finds every affected
 * passenger, records a journey event, updates the journey and returns the
 * personalised action for each passenger.
 */
export const Route = createFileRoute("/api/public/flight-events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["FLIGHT_EVENTS_SECRET"];
        if (!secret) {
          return json({ status: "error", message: "Flight event intake is not configured." }, 503);
        }
        const provided =
          request.headers.get("x-flight-events-secret") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";
        if (provided !== secret) {
          return json({ status: "error", message: "Invalid credentials." }, 401);
        }

        let parsed;
        try {
          parsed = EventBody.parse(await request.json());
        } catch {
          return json({ status: "error", message: "Invalid event payload." }, 400);
        }
        if (!parsed.flight_number && !parsed.passenger_id) {
          return json({ status: "error", message: "flight_number or passenger_id is required." }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let lookup = supabaseAdmin.from("passengers").select("id").neq("journey_status", "departed");
        lookup = parsed.passenger_id
          ? lookup.eq("id", parsed.passenger_id)
          : lookup.eq("flight_number", parsed.flight_number!.toUpperCase());

        const { data: affected, error } = await lookup;
        if (error) return json({ status: "error", message: "Could not look up passengers." }, 500);
        if (!affected || affected.length === 0) {
          return json({ status: "no_passengers", message: "No affected passengers found." }, 404);
        }

        const results = [];
        for (const row of affected) {
          try {
            const payload = await applyFlightEventToPassenger(supabaseAdmin as never, row.id, {
              event_type: parsed.event_type,
              old_value: parsed.old_value ?? null,
              new_value: parsed.new_value ?? null,
              delay_minutes: parsed.delay_minutes ?? null,
              note: parsed.note ?? null,
            });
            results.push({
              passenger_id: row.id,
              status: payload.status,
              current_step: payload.current_step,
              progress: payload.progress,
              action: payload.next_action,
              message: payload.latestEvent?.message ?? null,
              severity: payload.latestEvent?.severity ?? null,
              requires_action: payload.latestEvent?.requires_action ?? false,
            });
          } catch {
            results.push({ passenger_id: row.id, status: "error" });
          }
        }

        return json({
          status: "ok",
          event_type: parsed.event_type,
          affected_passengers: results.length,
          results,
        });
      },
    },
  },
});
