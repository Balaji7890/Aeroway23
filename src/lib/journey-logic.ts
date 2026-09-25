/**
 * Pure journey logic: works out which step a passenger is on from stored
 * evidence (timestamps the backend has actually recorded) plus the departure
 * time. No step is ever marked completed without evidence.
 */

export const STEP_KEYS = [
  "booking_confirmed",
  "check_in",
  "travel_to_airport",
  "airport_arrival",
  "baggage_check",
  "security",
  "find_gate",
  "boarding",
  "departed",
] as const;

export type StepKey = (typeof STEP_KEYS)[number];

export type StepStatus = "locked" | "upcoming" | "current" | "completed" | "skipped" | "disrupted";

export type PassengerEvidence = {
  departure_time: string;
  checked_in_at: string | null;
  arrived_at: string | null;
  baggage_dropped_at: string | null;
  baggage_skipped: boolean;
  security_cleared_at: string | null;
  boarding_started_at: string | null;
  departed_at: string | null;
  gate: string | null;
  terminal: string | null;
};

export type RawStep = {
  id: string;
  step_key: string;
  step_order: number;
  title: string;
  description: string;
  status: string;
  estimated_time_minutes: number | null;
  completed_at: string | null;
};

export type ComputedStep = RawStep & {
  status: StepStatus;
  completed_at: string | null;
};

export type ComputedJourney = {
  steps: ComputedStep[];
  currentStep: StepKey;
  progress: number;
  nextAction: string;
  guidance: string;
  urgent: boolean;
  minutesToDeparture: number;
  estimatedMinutesRemaining: number | null;
};

const ts = (value: string | null) => (value ? Date.parse(value) : null);

/** Timestamp that counts as evidence a step is done, or null when unproven. */
export function stepEvidence(
  key: StepKey,
  p: PassengerEvidence,
): { completedAt: number | null; skipped?: boolean } {
  const departed = ts(p.departed_at);
  const boarding = ts(p.boarding_started_at);
  const security = ts(p.security_cleared_at);
  const baggage = ts(p.baggage_dropped_at);
  const arrived = ts(p.arrived_at);
  const checkedIn = ts(p.checked_in_at);

  switch (key) {
    case "booking_confirmed":
      return { completedAt: 0 };
    case "check_in":
      return { completedAt: checkedIn ?? baggage ?? security ?? boarding ?? departed };
    case "travel_to_airport":
      return { completedAt: arrived ?? baggage ?? security ?? boarding ?? departed };
    case "airport_arrival":
      return { completedAt: arrived ?? baggage ?? security ?? boarding ?? departed };
    case "baggage_check":
      if (p.baggage_skipped && !baggage) return { completedAt: security ?? boarding ?? departed, skipped: true };
      return { completedAt: baggage ?? security ?? boarding ?? departed };
    case "security":
      return { completedAt: security ?? boarding ?? departed };
    case "find_gate":
      return { completedAt: boarding ?? departed };
    case "boarding":
      return { completedAt: departed };
    case "departed":
      return { completedAt: departed };
  }
}

function actionFor(key: StepKey, p: PassengerEvidence, minutes: number): string {
  const gate = p.gate ? `gate ${p.gate}` : "your gate";
  switch (key) {
    case "check_in":
      return "Check in and get your boarding pass";
    case "travel_to_airport":
      return minutes <= 180 ? "Leave for the airport now" : "Plan your trip to the airport";
    case "airport_arrival":
      return p.terminal ? `Head into terminal ${p.terminal}` : "Head into the terminal";
    case "baggage_check":
      return "Drop your checked bags";
    case "security":
      return "Proceed to security";
    case "find_gate":
      return `Walk to ${gate}`;
    case "boarding":
      return `Board at ${gate}`;
    case "departed":
      return "Enjoy your flight";
    default:
      return "You're all set";
  }
}

function guidanceFor(key: StepKey, p: PassengerEvidence, minutes: number): string {
  if (minutes < 0) return "This flight has already departed.";
  if (minutes <= 20) return `Boarding closes very soon — go straight to ${p.gate ? `gate ${p.gate}` : "your gate"}.`;
  if (minutes <= 40 && (key === "boarding" || key === "find_gate"))
    return `Boarding is active. Go to ${p.gate ? `gate ${p.gate}` : "your gate"} now.`;
  if (minutes <= 90) return "Clear security and move towards your gate.";
  if (minutes <= 180) return "Get to the airport and finish check-in and baggage drop.";
  return "Plenty of time — check in online and get ready for the airport.";
}

export function computeJourney(
  p: PassengerEvidence,
  rawSteps: RawStep[],
  nowMs: number = Date.now(),
): ComputedJourney {
  const departure = Date.parse(p.departure_time);
  const minutesToDeparture = Math.round((departure - nowMs) / 60000);

  const ordered = [...rawSteps].sort((a, b) => a.step_order - b.step_order);
  const computed: ComputedStep[] = ordered.map((s) => {
    const { completedAt, skipped } = stepEvidence(s.step_key as StepKey, p);
    if (completedAt !== null) {
      return {
        ...s,
        status: skipped ? "skipped" : "completed",
        completed_at: completedAt > 0 ? new Date(completedAt).toISOString() : s.completed_at,
      };
    }
    return { ...s, status: "locked" as StepStatus };
  });

  const firstOpen = computed.findIndex((s) => s.status !== "completed" && s.status !== "skipped");
  if (firstOpen >= 0) {
    computed[firstOpen]!.status = "current";
    if (computed[firstOpen + 1]) computed[firstOpen + 1]!.status = "upcoming";
  }

  const currentStep = (computed[firstOpen >= 0 ? firstOpen : computed.length - 1]!.step_key ??
    "departed") as StepKey;

  const doneCount = computed.filter((s) => s.status === "completed" || s.status === "skipped").length;
  const progress = Math.round((doneCount / (computed.length || 1)) * 100);

  const remaining = computed
    .filter((s) => s.status !== "completed" && s.status !== "skipped")
    .reduce((sum, s) => sum + (s.estimated_time_minutes ?? 0), 0);

  return {
    steps: computed,
    currentStep,
    progress,
    nextAction: actionFor(currentStep, p, minutesToDeparture),
    guidance: guidanceFor(currentStep, p, minutesToDeparture),
    urgent: minutesToDeparture >= 0 && minutesToDeparture <= 45 && currentStep !== "departed",
    minutesToDeparture,
    estimatedMinutesRemaining: remaining > 0 ? remaining : null,
  };
}

export const STEP_ICONS: Record<StepKey, string> = {
  booking_confirmed: "confirmation_number",
  check_in: "how_to_reg",
  travel_to_airport: "directions_car",
  airport_arrival: "door_front",
  baggage_check: "luggage",
  security: "local_police",
  find_gate: "directions_walk",
  boarding: "airplane_ticket",
  departed: "flight_takeoff",
};

/** Milestones a passenger can confirm themselves. */
export const MILESTONES = [
  { key: "check_in", label: "I've checked in", icon: "how_to_reg" },
  { key: "arrived", label: "I'm at the airport", icon: "door_front" },
  { key: "baggage", label: "Bags dropped", icon: "luggage" },
  { key: "no_baggage", label: "No checked bags", icon: "no_luggage" },
  { key: "security", label: "Through security", icon: "local_police" },
  { key: "boarding", label: "Boarding started", icon: "airplane_ticket" },
] as const;

export type MilestoneKey = (typeof MILESTONES)[number]["key"];
