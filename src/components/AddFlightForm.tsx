import { useState } from "react";

export type FlightDraft = {
  passenger_name: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  terminal: string;
  gate: string;
  seat: string;
  cabin: string;
};

const empty: FlightDraft = {
  passenger_name: "",
  flight_number: "",
  airline: "",
  origin: "",
  destination: "",
  departure_time: "",
  terminal: "",
  gate: "",
  seat: "",
  cabin: "",
};

export function AddFlightForm({
  onSubmit,
  saving,
  error,
}: {
  onSubmit: (draft: FlightDraft) => void;
  saving: boolean;
  error?: string | null;
}) {
  const [f, setF] = useState<FlightDraft>(empty);
  const set = (k: keyof FlightDraft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const field =
    "w-full rounded-xl bg-surface-container-low px-3 py-2.5 font-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(f);
      }}
      className="flex flex-col gap-3 rounded-2xl bg-pure-white p-space-lg shadow-[0_8px_24px_-4px_rgba(18,35,63,0.08)]"
    >
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface">Add your flight</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          We'll build your step-by-step airport journey from these details.
        </p>
      </div>
      <input className={field} placeholder="Passenger name" value={f.passenger_name} onChange={set("passenger_name")} required />
      <div className="grid grid-cols-2 gap-3">
        <input className={field} placeholder="Flight no. (AI101)" value={f.flight_number} onChange={set("flight_number")} required />
        <input className={field} placeholder="Airline" value={f.airline} onChange={set("airline")} required />
        <input className={field} placeholder="From (Chennai)" value={f.origin} onChange={set("origin")} required />
        <input className={field} placeholder="To (Delhi)" value={f.destination} onChange={set("destination")} required />
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Departure</span>
        <input className={field} type="datetime-local" value={f.departure_time} onChange={set("departure_time")} required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <input className={field} placeholder="Terminal (optional)" value={f.terminal} onChange={set("terminal")} />
        <input className={field} placeholder="Gate (optional)" value={f.gate} onChange={set("gate")} />
        <input className={field} placeholder="Seat (optional)" value={f.seat} onChange={set("seat")} />
        <input className={field} placeholder="Cabin (optional)" value={f.cabin} onChange={set("cabin")} />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-primary py-3 font-label-lg text-on-primary disabled:opacity-50"
      >
        {saving ? "Creating journey…" : "Start my journey"}
      </button>
      {error && <p className="font-body-sm text-error">{error}</p>}
    </form>
  );
}
