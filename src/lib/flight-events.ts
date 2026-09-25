/**
 * Flight disruption events.
 *
 * Pure mapping from an incoming airport/airline event to:
 *  - the patch applied to the passenger record
 *  - the journey_event row we store
 *  - the personalised message + action returned to the app
 *
 * No database access here so the logic stays testable and shared between the
 * public webhook route and the in-app simulation server function.
 */

export const FLIGHT_EVENT_TYPES = [
  "gate_change",
  "delay",
  "cancellation",
  "terminal_change",
  "boarding_started",
  "boarding_gate_open",
  "boarding_gate_closed",
  "security_delay",
  "baggage_issue",
] as const;

export type FlightEventType = (typeof FLIGHT_EVENT_TYPES)[number];

export type FlightEventSeverity = "info" | "low" | "medium" | "high" | "critical";

export type FlightEventInput = {
  event_type: FlightEventType;
  flight_number?: string;
  passenger_id?: string;
  old_value?: string | null;
  new_value?: string | null;
  delay_minutes?: number | null;
  note?: string | null;
};

export type PassengerSnapshot = {
  id: string;
  flight_number: string;
  gate: string | null;
  terminal: string | null;
  departure_time: string;
  delay_minutes: number;
  flight_status: string;
};

export type PassengerPatch = {
  gate?: string | null;
  terminal?: string | null;
  departure_time?: string;
  delay_minutes?: number;
  flight_status?: string;
  boarding_started_at?: string;
  journey_status?: string;
};

export type FlightEventResult = {
  event_type: FlightEventType;
  severity: FlightEventSeverity;
  requires_action: boolean;
  title: string;
  message: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  patch: PassengerPatch;
};

const gateLabel = (gate: string | null | undefined) => (gate ? `Gate ${gate}` : "your gate");

/** Translate one raw event into the stored record + passenger-facing wording. */
export function buildFlightEvent(
  input: FlightEventInput,
  passenger: PassengerSnapshot,
  nowMs: number = Date.now(),
): FlightEventResult {
  const now = new Date(nowMs).toISOString();

  switch (input.event_type) {
    case "gate_change": {
      const from = input.old_value ?? passenger.gate ?? null;
      const to = input.new_value ?? null;
      const toGate = to ?? passenger.gate;
      return {
        event_type: "gate_change",
        severity: "high",
        requires_action: true,
        title: "Gate changed",
        message: from
          ? `Your gate changed from ${from} to ${to ?? "a new gate"}.`
          : `Your gate is now ${to ?? "being assigned"}.`,
        action: `Proceed to ${gateLabel(toGate)}`,
        old_value: from,
        new_value: to,
        patch: to ? { gate: to } : {},
      };
    }

    case "terminal_change": {
      const from = input.old_value ?? passenger.terminal ?? null;
      const to = input.new_value ?? null;
      return {
        event_type: "terminal_change",
        severity: "high",
        requires_action: true,
        title: "Terminal changed",
        message: from
          ? `Your flight moved from Terminal ${from} to Terminal ${to ?? "a new terminal"}.`
          : `Your flight now departs from Terminal ${to ?? "TBC"}.`,
        action: to ? `Travel to Terminal ${to}` : "Check the terminal on the screens",
        old_value: from,
        new_value: to,
        patch: to ? { terminal: to } : {},
      };
    }

    case "delay": {
      const minutes = Math.max(0, Math.round(input.delay_minutes ?? 30));
      const newDeparture = new Date(Date.parse(passenger.departure_time) + minutes * 60000).toISOString();
      return {
        event_type: "delay",
        severity: minutes >= 120 ? "high" : "medium",
        requires_action: false,
        title: `Flight delayed by ${minutes} min`,
        message: `${passenger.flight_number} is delayed by ${minutes} minutes. New departure ${new Date(newDeparture).toUTCString()}.`,
        action: "Stay near the gate and watch for boarding updates",
        old_value: passenger.departure_time,
        new_value: newDeparture,
        patch: {
          departure_time: newDeparture,
          delay_minutes: passenger.delay_minutes + minutes,
          flight_status: "delayed",
        },
      };
    }

    case "cancellation":
      return {
        event_type: "cancellation",
        severity: "critical",
        requires_action: true,
        title: "Flight cancelled",
        message: `${passenger.flight_number} has been cancelled. Rebooking is required.`,
        action: "Go to the airline service desk to rebook",
        old_value: passenger.flight_status,
        new_value: "cancelled",
        patch: { flight_status: "cancelled", journey_status: "cancelled" },
      };

    case "boarding_started":
      return {
        event_type: "boarding_started",
        severity: "high",
        requires_action: true,
        title: "Boarding started",
        message: `Boarding has started for ${passenger.flight_number} at ${gateLabel(passenger.gate)}.`,
        action: `Board ${passenger.flight_number} at ${gateLabel(passenger.gate)}`,
        old_value: null,
        new_value: passenger.gate,
        patch: { boarding_started_at: now, flight_status: "boarding" },
      };

    case "boarding_gate_open":
      return {
        event_type: "boarding_gate_open",
        severity: "medium",
        requires_action: true,
        title: "Gate open",
        message: `${gateLabel(passenger.gate)} is now open for ${passenger.flight_number}.`,
        action: `Proceed to ${gateLabel(passenger.gate)}`,
        old_value: null,
        new_value: passenger.gate,
        patch: {},
      };

    case "boarding_gate_closed":
      return {
        event_type: "boarding_gate_closed",
        severity: "critical",
        requires_action: true,
        title: "Gate closing",
        message: `${gateLabel(passenger.gate)} is closing for ${passenger.flight_number}.`,
        action: `Go to ${gateLabel(passenger.gate)} immediately`,
        old_value: null,
        new_value: passenger.gate,
        patch: {},
      };

    case "security_delay":
      return {
        event_type: "security_delay",
        severity: "medium",
        requires_action: true,
        title: "Long security queues",
        message:
          input.note ??
          `Security screening is running ${input.delay_minutes ?? 25} minutes slower than usual.`,
        action: "Head to security now — allow extra time",
        old_value: null,
        new_value: String(input.delay_minutes ?? 25),
        patch: {},
      };

    case "baggage_issue":
      return {
        event_type: "baggage_issue",
        severity: "medium",
        requires_action: true,
        title: "Baggage issue",
        message: input.note ?? `There is an issue with checked baggage on ${passenger.flight_number}.`,
        action: "Contact the airline baggage desk",
        old_value: null,
        new_value: null,
        patch: {},
      };
  }
}
