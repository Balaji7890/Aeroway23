/**
 * Aviationstack access layer (server only).
 *
 * Normalises the raw API payload into a small shape the UI and the AI
 * assistant can both use. Never import this from a client component.
 */

const BASE = "https://api.aviationstack.com/v1";

export type LiveFlight = {
  flightDate: string | null;
  flightNumber: string;
  airline: string;
  status: string;
  departure: {
    airport: string | null;
    iata: string | null;
    terminal: string | null;
    gate: string | null;
    delayMinutes: number | null;
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
  };
  arrival: {
    airport: string | null;
    iata: string | null;
    terminal: string | null;
    gate: string | null;
    baggage: string | null;
    delayMinutes: number | null;
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
  };
};

type RawFlight = Record<string, any>;

function normalise(raw: RawFlight): LiveFlight {
  return {
    flightDate: raw.flight_date ?? null,
    flightNumber: raw.flight?.iata ?? raw.flight?.icao ?? raw.flight?.number ?? "—",
    airline: raw.airline?.name ?? "Unknown airline",
    status: raw.flight_status ?? "unknown",
    departure: {
      airport: raw.departure?.airport ?? null,
      iata: raw.departure?.iata ?? null,
      terminal: raw.departure?.terminal ?? null,
      gate: raw.departure?.gate ?? null,
      delayMinutes: raw.departure?.delay ?? null,
      scheduled: raw.departure?.scheduled ?? null,
      estimated: raw.departure?.estimated ?? null,
      actual: raw.departure?.actual ?? null,
    },
    arrival: {
      airport: raw.arrival?.airport ?? null,
      iata: raw.arrival?.iata ?? null,
      terminal: raw.arrival?.terminal ?? null,
      gate: raw.arrival?.gate ?? null,
      baggage: raw.arrival?.baggage ?? null,
      delayMinutes: raw.arrival?.delay ?? null,
      scheduled: raw.arrival?.scheduled ?? null,
      estimated: raw.arrival?.estimated ?? null,
      actual: raw.arrival?.actual ?? null,
    },
  };
}

export type FlightQuery = {
  flightIata?: string;
  depIata?: string;
  arrIata?: string;
  airlineIata?: string;
  flightDate?: string;
  limit?: number;
};

export async function fetchFlights(query: FlightQuery): Promise<
  { ok: true; flights: LiveFlight[] } | { ok: false; error: string }
> {
  const key = process.env["AVIATIONSTACK_API_KEY"];
  if (!key) return { ok: false, error: "Live flight data is not configured." };

  const params = new URLSearchParams({ access_key: key, limit: String(query.limit ?? 10) });
  if (query.flightIata) params.set("flight_iata", query.flightIata);
  if (query.depIata) params.set("dep_iata", query.depIata);
  if (query.arrIata) params.set("arr_iata", query.arrIata);
  if (query.airlineIata) params.set("airline_iata", query.airlineIata);
  if (query.flightDate) params.set("flight_date", query.flightDate);

  try {
    const res = await fetch(`${BASE}/flights?${params.toString()}`);
    const json = (await res.json()) as any;

    if (json?.error) {
      const code = json.error?.code ?? "";
      if (code === "usage_limit_reached" || code === "rate_limit_reached") {
        return { ok: false, error: "Live flight data limit reached — please try again later." };
      }
      if (code === "invalid_access_key" || code === "missing_access_key") {
        return { ok: false, error: "Live flight data key is invalid." };
      }
      return { ok: false, error: "Live flight data is unavailable right now." };
    }
    if (!res.ok) return { ok: false, error: "Live flight data is unavailable right now." };

    const data: RawFlight[] = Array.isArray(json?.data) ? json.data : [];
    return { ok: true, flights: data.map(normalise) };
  } catch (e) {
    console.error("aviationstack request failed", e);
    return { ok: false, error: "Could not reach the flight data service." };
  }
}

/** Compact one-line summary used in AI prompts. */
export function summariseFlight(f: LiveFlight): string {
  const t = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(11, 16) + " UTC" : "n/a");
  const dep = f.departure;
  const arr = f.arrival;
  return [
    `${f.flightNumber} (${f.airline}) — status: ${f.status}`,
    `from ${dep.iata ?? "?"} ${dep.airport ?? ""} terminal ${dep.terminal ?? "TBC"} gate ${dep.gate ?? "TBC"}`,
    `scheduled departure ${t(dep.scheduled)}, estimated ${t(dep.estimated)}, departure delay ${dep.delayMinutes ?? 0} min`,
    `to ${arr.iata ?? "?"} ${arr.airport ?? ""} terminal ${arr.terminal ?? "TBC"} baggage belt ${arr.baggage ?? "TBC"}`,
    `scheduled arrival ${t(arr.scheduled)}, estimated ${t(arr.estimated)}, arrival delay ${arr.delayMinutes ?? 0} min`,
  ].join("; ");
}

/** Pull flight designators such as "EK501", "6E 55", "AI-102" out of free text. */
export function extractFlightNumbers(text: string): string[] {
  const found = new Set<string>();
  const re = /\b([A-Z0-9]{2})[\s-]?(\d{1,4})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const code = (m[1] ?? "").toUpperCase();
    // airline codes are 2 chars with at most one digit (6E, EK, AI, U2)
    if (/^\d{2}$/.test(code)) continue;
    found.add(`${code}${m[2]}`);
    if (found.size >= 3) break;
  }
  return [...found];
}
