import { MILESTONES, STEP_ICONS, type StepKey } from "@/lib/journey-logic";
import { AddFlightForm } from "@/components/AddFlightForm";
import { DisruptionSimulator } from "@/components/DisruptionSimulator";
import { useJourney } from "@/hooks/useJourney";

const card = "rounded-2xl bg-pure-white p-space-lg shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)]";

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countdown(minutes: number) {
  if (minutes < 0) return "Departed";
  if (minutes < 60) return `${minutes} min to departure`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m to departure`;
}

export function JourneyBoard() {
  const { user, authLoading, signIn, query, data, create, demo, advance, disrupt } = useJourney();

  if (authLoading) return <div className={card}>Loading your journey…</div>;

  if (!user) {
    return (
      <div className={`${card} flex flex-col items-start gap-3`}>
        <h2 className="font-headline-md text-headline-md text-on-surface">Sign in to track your journey</h2>
        <p className="font-body-md text-on-surface-variant">
          Your airport steps, gate and boarding reminders are tied to your account.
        </p>
        <button onClick={signIn} className="rounded-xl bg-primary px-4 py-2.5 font-label-lg text-on-primary">
          Sign in
        </button>
      </div>
    );
  }

  if (query.isLoading) return <div className={card}>Loading your journey…</div>;
  if (query.error || data?.status === "error")
    return <div className={card}>{data?.message ?? "We couldn't load your journey. Please refresh."}</div>;

  if (!data?.passenger || !data.journey) {
    return (
      <div className="flex flex-col gap-space-lg">
        <div className={`${card} flex flex-col items-start gap-3`}>
          <h2 className="font-headline-md text-headline-md text-on-surface">No active journey found</h2>
          <p className="font-body-md text-on-surface-variant">
            Try the sample Chennai → Delhi journey, or add your own flight below.
          </p>
          <button
            onClick={() => demo.mutate()}
            disabled={demo.isPending}
            className="rounded-xl bg-primary px-4 py-2.5 font-label-lg text-on-primary disabled:opacity-50"
          >
            {demo.isPending ? "Preparing…" : "Try the demo journey"}
          </button>
        </div>
        <AddFlightForm
          onSubmit={(draft) => create.mutate(draft)}
          saving={create.isPending}
          error={create.error ? "Please check the details and try again." : null}
        />
      </div>
    );
  }

  const { passenger, journey, latestEvent, current_step, progress, next_action } = data;
  const doneKeys = new Set(
    journey.steps.filter((s) => s.status === "completed" || s.status === "skipped").map((s) => s.step_key),
  );

  const milestoneDone = (key: string) =>
    ({
      check_in: doneKeys.has("check_in"),
      arrived: doneKeys.has("airport_arrival"),
      baggage: doneKeys.has("baggage_check"),
      no_baggage: doneKeys.has("baggage_check"),
      security: doneKeys.has("security"),
      boarding: doneKeys.has("find_gate"),
    })[key] ?? false;

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Flight header */}
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              {passenger.airline} • {passenger.flight_number}
              {data.is_demo && " • Sample journey"}
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {passenger.origin} → {passenger.destination}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {timeLabel(passenger.departure_time)} • {passenger.name}
              {passenger.delay_minutes > 0 && ` • delayed ${passenger.delay_minutes} min`}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 font-label-md text-label-md ${
              journey.urgent || passenger.flight_status === "cancelled"
                ? "bg-error/10 text-error"
                : "bg-[rgba(14,138,84,0.12)] text-status-emerald"
            }`}
          >
            {passenger.flight_status === "cancelled" ? "Cancelled" : countdown(journey.minutesToDeparture)}
          </span>
        </div>
        <div className="mt-space-md grid grid-cols-3 gap-space-sm">
          {[
            { label: "Terminal", value: passenger.terminal ?? "—" },
            { label: "Gate", value: passenger.gate ?? "—" },
            { label: "Seat", value: passenger.seat ?? "—" },
          ].map((i) => (
            <div key={i.label} className="rounded-xl bg-surface-container-low px-3 py-2">
              <span className="font-label-sm text-label-sm uppercase text-secondary">{i.label}</span>
              <p className="font-headline-sm text-headline-sm text-on-surface">{i.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* You are here + next action, both decided by the backend */}
      <div
        className={`rounded-2xl p-space-lg text-pure-white shadow-[0_12px_32px_-4px_rgba(12,23,42,0.2)] ${
          journey.urgent || passenger.flight_status === "cancelled" ? "bg-error" : "bg-navy-depth"
        }`}
      >
        <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-80">You are here</span>
        <h2 className="mt-1 font-headline-lg text-headline-lg">{current_step?.title ?? "Journey complete"}</h2>
        <p className="mt-1 font-body-md text-body-md opacity-90">{current_step?.description ?? ""}</p>
        <div className="mt-space-md rounded-xl bg-white/10 p-space-md">
          <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-80">Next action</span>
          <p className="font-headline-sm text-headline-sm">{next_action}</p>
        </div>
      </div>

      {/* Latest disruption */}
      {latestEvent && (
        <div className={`${card} border-l-4 ${latestEvent.requires_action ? "border-error" : "border-primary"}`}>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Latest update • {latestEvent.severity}
          </span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">{latestEvent.title}</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{latestEvent.message}</p>
          {latestEvent.action && (
            <p className="mt-1 font-label-md text-label-md text-primary">{latestEvent.action}</p>
          )}
          <p className="mt-1 font-label-sm text-label-sm text-secondary">{timeLabel(latestEvent.created_at)}</p>
        </div>
      )}

      {/* Progress timeline */}
      <div className={card}>
        <div className="mb-space-md flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface">Journey progress</h3>
          <span className="font-label-md text-label-md text-secondary">{progress}% complete</span>
        </div>
        <div className="mb-space-lg h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <ol className="relative flex flex-col gap-space-md pl-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-surface-container-high">
          {journey.steps.map((s, i) => {
            const done = s.status === "completed" || s.status === "skipped";
            const isCurrent = s.status === "current";
            return (
              <li key={s.id} className={`relative flex items-start gap-space-md ${done || isCurrent ? "" : "opacity-60"}`}>
                <span
                  className={`absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full ${
                    done
                      ? "bg-status-emerald text-pure-white"
                      : isCurrent
                        ? "animate-pulse bg-primary text-pure-white"
                        : "bg-surface-container-highest text-secondary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {done ? "check" : STEP_ICONS[s.step_key as StepKey]}
                  </span>
                </span>
                <div
                  className={`flex-1 rounded-xl p-space-md ${
                    isCurrent ? "bg-surface-container ring-2 ring-primary/20" : "bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-headline-sm text-headline-sm ${isCurrent ? "text-primary" : "text-on-surface"}`}>
                      {i + 1}. {s.title}
                    </span>
                    <span className="shrink-0 font-label-sm text-label-sm text-secondary">
                      {s.status === "skipped"
                        ? "Skipped"
                        : done
                          ? "Done"
                          : isCurrent
                            ? "In progress"
                            : s.estimated_time_minutes
                              ? `Est. ${s.estimated_time_minutes}m`
                              : "Upcoming"}
                    </span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{s.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Milestone confirmations */}
      <div className={card}>
        <h3 className="font-headline-md text-headline-md text-on-surface">Update your progress</h3>
        <p className="mb-space-md font-body-sm text-body-sm text-on-surface-variant">
          Confirm what you've done and the journey moves forward.
        </p>
        <div className="flex flex-wrap gap-2">
          {MILESTONES.map((m) => {
            const complete = milestoneDone(m.key);
            return (
              <button
                key={m.key}
                disabled={complete || advance.isPending}
                onClick={() => advance.mutate(m.key)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 font-label-md text-label-md transition-all active:scale-95 disabled:opacity-50 ${
                  complete ? "bg-surface-container-low text-secondary" : "bg-primary text-on-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{complete ? "check" : m.icon}</span>
                {m.label}
              </button>
            );
          })}
        </div>
        {advance.error && <p className="mt-2 font-body-sm text-error">Couldn't save that update. Please try again.</p>}
      </div>

      <DisruptionSimulator disrupt={disrupt} />
    </div>
  );
}
