import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { LiveFlight } from "./aviationstack.server";

const iata = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, "Use a 3-letter airport code")
  .transform((s) => s.toUpperCase());

const StatusInput = z.object({
  flightNumber: z
    .string()
    .trim()
    .min(3)
    .max(10)
    .transform((s) => s.replace(/[\s-]/g, "").toUpperCase()),
  flightDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type FlightLookupResult =
  | { ok: true; flights: LiveFlight[] }
  | { ok: false; error: string };

/** Live status for one flight number (e.g. EK501, 6E55). */
export const getFlightStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => StatusInput.parse(d))
  .handler(async ({ data }): Promise<FlightLookupResult> => {
    const { fetchFlights } = await import("./aviationstack.server");
    const res = await fetchFlights({
      flightIata: data.flightNumber,
      ...(data.flightDate ? { flightDate: data.flightDate } : {}),
      limit: 5,
    });
    if (!res.ok) return res;
    if (!res.flights.length) return { ok: false, error: `No live data found for ${data.flightNumber}.` };
    return { ok: true, flights: res.flights };
  });

const RouteInput = z.object({ from: iata, to: iata });

/** Live flights operating a route today (e.g. MAA → DXB). */
export const searchFlightsByRoute = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RouteInput.parse(d))
  .handler(async ({ data }): Promise<FlightLookupResult> => {
    const { fetchFlights } = await import("./aviationstack.server");
    const res = await fetchFlights({ depIata: data.from, arrIata: data.to, limit: 20 });
    if (!res.ok) return res;
    if (!res.flights.length)
      return { ok: false, error: `No flights found from ${data.from} to ${data.to} right now.` };
    return { ok: true, flights: res.flights };
  });
