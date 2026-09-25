import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFlightStatus, searchFlightsByRoute, type FlightLookupResult } from "@/lib/flights.functions";
import type { LiveFlight } from "@/lib/aviationstack.server";

function timeLabel(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const STATUS_TONE: Record<string, string> = {
  scheduled: "bg-primary-fixed text-primary",
  active: "bg-status-emerald/15 text-status-emerald",
  landed: "bg-status-emerald/15 text-status-emerald",
  delayed: "bg-alert-amber/20 text-on-surface",
  cancelled: "bg-error/12 text-error",
  diverted: "bg-error/12 text-error",
};

export function FlightCard({ f }: { f: LiveFlight }) {
  const tone = STATUS_TONE[f.status] ?? "bg-surface-container text-secondary";
  const delay = f.departure.delayMinutes ?? 0;
  return (
    <div className="bg-pure-white rounded-2xl p-space-md shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="font-headline-sm text-headline-sm text-on-surface truncate">
            {f.flightNumber} • {f.airline}
          </span>
          <span className="font-body-sm text-on-surface-variant truncate">
            {f.departure.iata ?? "?"} → {f.arrival.iata ?? "?"} {f.flightDate ? `• ${f.flightDate}` : ""}
          </span>
        </div>
        <span className={`font-label-sm px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${tone}`}>
          {f.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-0.5">
          <span className="font-label-sm text-on-surface-variant uppercase">Departure</span>
          <span className="font-headline-sm text-on-surface">{timeLabel(f.departure.scheduled)}</span>
          <span className="font-body-sm text-on-surface-variant truncate">
            {f.departure.airport ?? "—"}
          </span>
          <span className="font-body-sm text-secondary">
            Terminal {f.departure.terminal ?? "TBC"} • Gate {f.departure.gate ?? "TBC"}
          </span>
        </div>
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-0.5">
          <span className="font-label-sm text-on-surface-variant uppercase">Arrival</span>
          <span className="font-headline-sm text-on-surface">{timeLabel(f.arrival.scheduled)}</span>
          <span className="font-body-sm text-on-surface-variant truncate">{f.arrival.airport ?? "—"}</span>
          <span className="font-body-sm text-secondary">
            Terminal {f.arrival.terminal ?? "TBC"} • Belt {f.arrival.baggage ?? "TBC"}
          </span>
        </div>
      </div>

      {delay > 0 ? (
        <span className="font-label-md text-alert-amber flex items-center gap-1">
          <span translate="no" className="notranslate material-symbols-outlined text-[16px]">schedule</span>
          Departing about {delay} min late — estimated {timeLabel(f.departure.estimated)}
        </span>
      ) : (
        <span className="font-label-md text-status-emerald flex items-center gap-1">
          <span translate="no" className="notranslate material-symbols-outlined text-[16px]">check_circle</span>
          On time
        </span>
      )}
    </div>
  );
}

const ROUTE_RE = /^([A-Za-z]{3})\s*(?:to|-|–|→|>)?\s*([A-Za-z]{3})$/;

/**
 * One search box that accepts either a flight number ("EK501", "6E 55")
 * or a route ("MAA to DXB"), backed by live airline data.
 */
export function FlightLookup({
  placeholder = "Flight number (EK501) or route (MAA to DXB)",
  chips = ["EK501", "MAA to DXB", "6E55"],
  compact = false,
}: {
  placeholder?: string;
  chips?: string[];
  compact?: boolean;
}) {
  const lookupFlight = useServerFn(getFlightStatus);
  const lookupRoute = useServerFn(searchFlightsByRoute);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<FlightLookupResult | null>(null);

  async function run(raw: string) {
    const q = raw.trim();
    if (!q || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const route = ROUTE_RE.exec(q);
      const res = route
        ? await lookupRoute({ data: { from: route[1]!, to: route[2]! } })
        : await lookupFlight({ data: { flightNumber: q } });
      setResult(res);
    } catch {
      setResult({ ok: false, error: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-space-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(query);
        }}
        className="relative flex items-center"
      >
        <span className="absolute left-3.5 material-symbols-outlined text-primary text-[20px]">flight_takeoff</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface-container-low pl-11 pr-28 py-3.5 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          placeholder={placeholder}
          aria-label="Search live flights"
        />
        <button
          type="submit"
          disabled={busy}
          className="absolute right-1.5 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1 disabled:opacity-60"
        >
          <span>{busy ? "Checking…" : "Check"}</span>
          <span translate="no" className="notranslate material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </form>

      {!compact && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">Try:</span>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setQuery(c);
                void run(c);
              }}
              className="bg-surface-container hover:bg-primary-fixed text-primary px-3 py-1 rounded-full font-label-md text-label-md shrink-0 transition-all active:scale-95"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {result && !result.ok && (
        <p className="font-body-sm text-error bg-error/8 rounded-xl px-3 py-2">{result.error}</p>
      )}

      {result?.ok && (
        <div className="flex flex-col gap-space-sm">
          {result.flights.map((f, i) => (
            <FlightCard key={`${f.flightNumber}-${i}`} f={f} />
          ))}
        </div>
      )}
    </div>
  );
}
