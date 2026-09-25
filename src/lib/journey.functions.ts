import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  computeJourney,
  type ComputedJourney,
  type PassengerEvidence,
  type RawStep,
} from "./journey-logic";
import {
  FLIGHT_EVENT_TYPES,
  buildFlightEvent,
  type FlightEventType,
  type PassengerSnapshot,
} from "./flight-events";
import { DEMO_PASSENGER, demoDepartureTime } from "./demo-journey";

const PASSENGER_COLUMNS =
  "id, passenger_name, flight_number, airline, origin, destination, departure_time, terminal, gate, seat, cabin, journey_status, flight_status, delay_minutes, is_demo, checked_in_at, arrived_at, baggage_dropped_at, baggage_skipped, security_cleared_at, boarding_started_at, departed_at";

export type JourneyStatus = "ok" | "no_booking" | "error";

export type JourneyPayload = {
  status: JourneyStatus;
  message?: string;
  demo_available?: boolean;
  is_demo: boolean;
  passenger: {
    id: string;
    name: string;
    flight_number: string;
    airline: string;
    origin: string;
    destination: string;
    departure_time: string;
    terminal: string | null;
    gate: string | null;
    seat: string | null;
    cabin: string | null;
    flight_status: string;
    delay_minutes: number;
  } | null;
  journey: ComputedJourney | null;
  /** Single source of truth for "You are here" — the frontend must not recompute it. */
  current_step: { step_key: string; title: string; status: string; description: string } | null;
  progress: number;
  next_action: string | null;
  latestEvent: {
    title: string;
    message: string;
    severity: string;
    requires_action: boolean;
    action: string | null;
    created_at: string;
  } | null;
};

type SupabaseLike = { from: (table: string) => any };

const emptyPayload = (
  status: JourneyStatus,
  message: string,
  demoAvailable = true,
): JourneyPayload => ({
  status,
  message,
  demo_available: demoAvailable,
  is_demo: false,
  passenger: null,
  journey: null,
  current_step: null,
  progress: 0,
  next_action: null,
  latestEvent: null,
});

async function loadJourney(
  supabase: SupabaseLike,
  passengerId?: string,
): Promise<JourneyPayload> {
  let query = supabase
    .from("passengers")
    .select(PASSENGER_COLUMNS)
    .order("departure_time", { ascending: true })
    .limit(1);
  if (passengerId) query = query.eq("id", passengerId);

  const { data: passenger, error } = await query.maybeSingle();
  if (error) return emptyPayload("error", "We couldn't load your journey right now.");
  if (!passenger) return emptyPayload("no_booking", "No active journey found.");

  const { data: steps, error: stepsError } = await supabase
    .from("journey_steps")
    .select("id, step_key, step_order, title, description, status, estimated_time_minutes, completed_at")
    .eq("passenger_id", passenger.id)
    .order("step_order", { ascending: true });
  if (stepsError) return emptyPayload("error", "We couldn't load your journey steps.");

  const { data: events } = await supabase
    .from("journey_events")
    .select("title, message, severity, requires_action, action, created_at")
    .eq("passenger_id", passenger.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const evidence: PassengerEvidence = {
    departure_time: passenger.departure_time,
    checked_in_at: passenger.checked_in_at,
    arrived_at: passenger.arrived_at,
    baggage_dropped_at: passenger.baggage_dropped_at,
    baggage_skipped: passenger.baggage_skipped,
    security_cleared_at: passenger.security_cleared_at,
    boarding_started_at: passenger.boarding_started_at,
    departed_at: passenger.departed_at,
    gate: passenger.gate,
    terminal: passenger.terminal,
  };

  const journey = computeJourney(evidence, (steps ?? []) as RawStep[]);

  // Persist the derived statuses so the stored journey matches what we show.
  await Promise.all(
    journey.steps
      .filter((s, i) => s.status !== (steps ?? [])[i]?.status)
      .map((s) =>
        supabase
          .from("journey_steps")
          .update({ status: s.status, completed_at: s.completed_at })
          .eq("id", s.id),
      ),
  );

  const currentStep = journey.steps.find((s) => s.status === "current") ?? null;
  const latestEvent = events?.[0] ?? null;

  // The latest event that still needs action overrides the derived next action.
  const cancelled = passenger.flight_status === "cancelled";
  const nextAction = cancelled
    ? "Go to the airline service desk to rebook"
    : (latestEvent?.requires_action && latestEvent.action) || journey.nextAction;

  return {
    status: "ok",
    is_demo: !!passenger.is_demo,
    passenger: {
      id: passenger.id,
      name: passenger.passenger_name,
      flight_number: passenger.flight_number,
      airline: passenger.airline,
      origin: passenger.origin,
      destination: passenger.destination,
      departure_time: passenger.departure_time,
      terminal: passenger.terminal,
      gate: passenger.gate,
      seat: passenger.seat,
      cabin: passenger.cabin,
      flight_status: passenger.flight_status ?? "scheduled",
      delay_minutes: passenger.delay_minutes ?? 0,
    },
    journey: { ...journey, nextAction },
    current_step: currentStep
      ? {
          step_key: currentStep.step_key,
          title: currentStep.title,
          status: "current",
          description: currentStep.description,
        }
      : null,
    progress: journey.progress,
    next_action: nextAction,
    latestEvent,
  };
}

export const getMyJourney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ passengerId: z.string().uuid().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseLike;
    try {
      return await loadJourney(supabase, data.passengerId);
    } catch {
      return emptyPayload("error", "We couldn't load your journey right now.");
    }
  });

/** Creates the sample AI101 journey for a signed-in user who has no booking. */
export const startDemoJourney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({}).parse(d ?? {}))
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as SupabaseLike;

    const { data: existing } = await supabase
      .from("passengers")
      .select("id")
      .eq("is_demo", true)
      .limit(1)
      .maybeSingle();
    if (existing?.id) return loadJourney(supabase, existing.id);

    const { data: inserted, error } = await supabase
      .from("passengers")
      .insert({
        user_id: context.userId,
        ...DEMO_PASSENGER,
        departure_time: demoDepartureTime(),
        is_demo: true,
      })
      .select("id")
      .single();
    if (error) return emptyPayload("error", "We couldn't start the demo journey.");

    return loadJourney(supabase, inserted.id);
  });

const FlightInput = z.object({
  passenger_name: z.string().trim().min(1).max(100),
  flight_number: z.string().trim().min(2).max(10),
  airline: z.string().trim().min(2).max(60),
  origin: z.string().trim().min(2).max(60),
  destination: z.string().trim().min(2).max(60),
  departure_time: z.string().min(10).max(40),
  terminal: z.string().trim().max(10).optional().or(z.literal("")),
  gate: z.string().trim().max(10).optional().or(z.literal("")),
  seat: z.string().trim().max(10).optional().or(z.literal("")),
  cabin: z.string().trim().max(30).optional().or(z.literal("")),
});

export const addFlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FlightInput.parse(d))
  .handler(async ({ data, context }) => {
    const departure = new Date(data.departure_time);
    if (Number.isNaN(departure.getTime())) throw new Error("Please enter a valid departure date and time.");

    const { data: inserted, error } = await context.supabase
      .from("passengers")
      .insert({
        user_id: context.userId,
        passenger_name: data.passenger_name,
        flight_number: data.flight_number.toUpperCase(),
        airline: data.airline,
        origin: data.origin,
        destination: data.destination,
        departure_time: departure.toISOString(),
        terminal: data.terminal || null,
        gate: data.gate || null,
        seat: data.seat || null,
        cabin: data.cabin || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return loadJourney(context.supabase as unknown as SupabaseLike, inserted.id);
  });

const MILESTONE_FIELD = {
  check_in: { column: "checked_in_at", title: "Checked in", message: "Check-in confirmed — your boarding pass is ready." },
  arrived: { column: "arrived_at", title: "Arrived at the airport", message: "You're inside the terminal." },
  baggage: { column: "baggage_dropped_at", title: "Bags dropped", message: "Checked baggage handed over." },
  security: { column: "security_cleared_at", title: "Through security", message: "Security screening complete." },
  boarding: { column: "boarding_started_at", title: "Boarding started", message: "Boarding is underway — head to the gate." },
} as const;

export const markMilestone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        passengerId: z.string().uuid(),
        milestone: z.enum(["check_in", "arrived", "baggage", "no_baggage", "security", "boarding", "departed"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const now = new Date().toISOString();
    const patch: {
      baggage_skipped?: boolean;
      departed_at?: string;
      journey_status?: string;
      checked_in_at?: string;
      arrived_at?: string;
      baggage_dropped_at?: string;
      security_cleared_at?: string;
      boarding_started_at?: string;
    } = {};

    let title = "";
    let message = "";

    if (data.milestone === "no_baggage") {
      patch["baggage_skipped"] = true;
      title = "No checked bags";
      message = "Baggage drop skipped — you're travelling with cabin bags only.";
    } else if (data.milestone === "departed") {
      patch["departed_at"] = now;
      patch["journey_status"] = "departed";
      title = "Departed";
      message = "Your flight has departed.";
    } else {
      const field = MILESTONE_FIELD[data.milestone];
      patch[field.column] = now;
      title = field.title;
      message = field.message;
    }

    const { error } = await context.supabase
      .from("passengers")
      .update(patch)
      .eq("id", data.passengerId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);

    await context.supabase.from("journey_events").insert({
      passenger_id: data.passengerId,
      event_type: data.milestone,
      title,
      message,
      severity: "info",
      requires_action: false,
    });

    return loadJourney(context.supabase as unknown as SupabaseLike, data.passengerId);
  });

/**
 * Applies a flight disruption event to one passenger and returns the
 * recalculated journey. Shared by the in-app simulator and the webhook route.
 */
export async function applyFlightEventToPassenger(
  supabase: SupabaseLike,
  passengerId: string,
  event: {
    event_type: FlightEventType;
    old_value?: string | null;
    new_value?: string | null;
    delay_minutes?: number | null;
    note?: string | null;
  },
): Promise<JourneyPayload> {
  const { data: passenger, error } = await supabase
    .from("passengers")
    .select("id, flight_number, gate, terminal, departure_time, delay_minutes, flight_status")
    .eq("id", passengerId)
    .maybeSingle();
  if (error) return emptyPayload("error", "We couldn't reach the journey record.");
  if (!passenger) return emptyPayload("no_booking", "No active journey found.");

  const result = buildFlightEvent(event, passenger as PassengerSnapshot);

  if (Object.keys(result.patch).length > 0) {
    const { error: updateError } = await supabase
      .from("passengers")
      .update(result.patch)
      .eq("id", passengerId);
    if (updateError) return emptyPayload("error", "We couldn't update your flight details.");
  }

  await supabase.from("journey_events").insert({
    passenger_id: passengerId,
    event_type: result.event_type,
    title: result.title,
    message: result.message,
    old_value: result.old_value,
    new_value: result.new_value,
    action: result.action,
    severity: result.severity,
    requires_action: result.requires_action,
  });

  return loadJourney(supabase, passengerId);
}

export const simulateFlightEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        passengerId: z.string().uuid(),
        event_type: z.enum(FLIGHT_EVENT_TYPES),
        new_value: z.string().trim().max(20).optional(),
        delay_minutes: z.number().int().min(0).max(1440).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseLike;
    try {
      return await applyFlightEventToPassenger(supabase, data.passengerId, {
        event_type: data.event_type,
        new_value: data.new_value ?? null,
        delay_minutes: data.delay_minutes ?? null,
      });
    } catch {
      return emptyPayload("error", "We couldn't apply that update.");
    }
  });
