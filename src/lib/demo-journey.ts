/** Sample journey shown when a signed-in passenger has no real booking yet. */
export const DEMO_PASSENGER = {
  passenger_name: "Demo Passenger",
  flight_number: "AI101",
  airline: "Air India",
  origin: "Chennai",
  destination: "Delhi",
  terminal: "T2",
  gate: "G18",
  seat: "14A",
  cabin: "Economy",
} as const;

/** Departure a few hours out so the demo journey always has steps left. */
export function demoDepartureTime(nowMs: number = Date.now()): string {
  return new Date(nowMs + 4 * 60 * 60 * 1000).toISOString();
}
