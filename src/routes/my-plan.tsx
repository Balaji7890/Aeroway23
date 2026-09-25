import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DisruptionSimulator } from "@/components/DisruptionSimulator";
import { useJourney } from "@/hooks/useJourney";

export const Route = createFileRoute("/my-plan")({
  head: () => ({
    meta: [
      { title: "Action Plan & Live Updates | AeroWay Companion" },
      { name: "description", content: "Your personal airport action plan with live boarding and gate change alerts." },
      { property: "og:title", content: "Action Plan & Live Updates | AeroWay Companion" },
      { property: "og:description", content: "Your personal airport action plan with live boarding and gate change alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyPlan,
});

const card = "rounded-2xl bg-pure-white p-space-lg shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)]";

/** Which saved milestone each task confirms when tapped. */
const STEP_MILESTONE: Record<string, string> = {
  check_in: "check_in",
  travel_to_airport: "arrived",
  airport_arrival: "arrived",
  baggage_check: "baggage",
  security: "security",
  boarding: "boarding",
  departed: "departed",
};

function MyPlan() {
  const { user, authLoading, signIn, query, data, demo, advance, disrupt } = useJourney();

  return (
    <AppShell title="Plan">
      <div className="flex w-full flex-col gap-space-lg pb-12">
        {authLoading || query.isLoading ? (
          <div className={card}>Loading your plan…</div>
        ) : !user ? (
          <div className={`${card} flex flex-col items-start gap-3`}>
            <h2 className="font-headline-md text-headline-md text-on-surface">Sign in to see your plan</h2>
            <button onClick={signIn} className="rounded-xl bg-primary px-4 py-2.5 font-label-lg text-on-primary">
              Sign in
            </button>
          </div>
        ) : !data?.passenger ? (
          <div className={`${card} flex flex-col items-start gap-3`}>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {data?.message ?? "No active journey found."}
            </h2>
            <button
              onClick={() => demo.mutate()}
              disabled={demo.isPending}
              className="rounded-xl bg-primary px-4 py-2.5 font-label-lg text-on-primary disabled:opacity-50"
            >
              {demo.isPending ? "Preparing…" : "Try the demo journey"}
            </button>
          </div>
        ) : (
          <>
            {/* Latest disruption alert */}
            {data.latestEvent && (
              <div className="relative flex flex-col gap-space-md overflow-hidden rounded-xl bg-navy-depth p-space-lg text-pure-white shadow-xl">
                <div className="flex items-center gap-space-sm">
                  <span translate="no" className="notranslate material-symbols-outlined flex h-8 w-8 items-center justify-center rounded-full bg-alert-amber/20 text-[18px] text-alert-amber">
                    {data.latestEvent.requires_action ? "warning" : "info"}
                  </span>
                  <span className="font-label-md uppercase tracking-wider text-alert-amber">
                    {data.latestEvent.title}
                  </span>
                </div>
                <p className="font-body-md text-white/80">{data.latestEvent.message}</p>
                {data.latestEvent.action && (
                  <p className="font-headline-sm text-white">{data.latestEvent.action}</p>
                )}
              </div>
            )}

            {/* You are here */}
            <div className={card}>
              <span className="font-label-sm uppercase tracking-wider text-secondary">You are here</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {data.current_step?.title ?? "Journey complete"}
              </h2>
              <p className="font-body-md text-on-surface-variant">{data.current_step?.description}</p>
              <div className="mt-space-md rounded-xl bg-surface-container-low p-space-md">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Next action</span>
                <p className="font-headline-sm text-headline-sm text-primary">{data.next_action}</p>
              </div>
              <div className="mt-space-md h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${data.progress}%` }} />
              </div>
              <p className="mt-1 font-label-md text-secondary">{data.progress}% complete</p>
            </div>

            {/* Departure tasks */}
            <div className={card}>
              <h3 className="mb-space-md font-headline-md text-headline-md text-on-surface">Departure tasks</h3>
              <div className="flex flex-col gap-space-sm">
                {data.journey?.steps.map((s) => {
                  const done = s.status === "completed" || s.status === "skipped";
                  const isCurrent = s.status === "current";
                  const milestone = STEP_MILESTONE[s.step_key];
                  const canMark = !done && !!milestone;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      disabled={!canMark || advance.isPending}
                      onClick={() => milestone && advance.mutate(milestone)}
                      className={`flex w-full items-center gap-space-md rounded-xl p-3 text-left transition-all enabled:hover:ring-2 enabled:hover:ring-primary/30 enabled:active:scale-[0.99] ${
                        isCurrent ? "bg-pure-white shadow-md ring-2 ring-primary/20" : "bg-surface-container-lowest shadow-sm"
                      } ${done ? "opacity-75" : ""}`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          done
                            ? "bg-status-emerald text-white"
                            : isCurrent
                              ? "bg-primary text-white"
                              : "border-2 border-outline"
                        }`}
                      >
                        {(done || isCurrent) && (
                          <span translate="no" className="notranslate material-symbols-outlined text-[14px]">
                            {done ? "check" : "schedule"}
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span
                          className={`truncate font-label-lg ${
                            done ? "text-on-surface line-through" : isCurrent ? "text-primary" : "text-on-surface"
                          }`}
                        >
                          {s.title}
                        </span>
                        <span className="truncate font-body-sm text-secondary">{s.description}</span>
                      </div>
                      {canMark && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 font-label-sm text-primary">
                          {advance.isPending && advance.variables === milestone ? "Saving…" : "Mark done"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {data.passenger && !data.passenger.baggage_dropped_at && (
                <button
                  type="button"
                  onClick={() => advance.mutate("no_baggage")}
                  disabled={advance.isPending}
                  className="mt-space-sm font-label-md text-primary underline disabled:opacity-50"
                >
                  I have no checked bags
                </button>
              )}
              {advance.error && (
                <p className="mt-2 font-body-sm text-error">Couldn't save that update. Please try again.</p>
              )}
            </div>

            {/* Boarding pass */}
            <div className={`${card} flex flex-col gap-space-md`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span translate="no" className="notranslate material-symbols-outlined text-[20px] text-primary">airplane_ticket</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Boarding pass</span>
                </div>
                <span className="rounded-full bg-primary px-2.5 py-0.5 font-label-sm text-white">
                  {data.passenger.cabin ?? "Economy"}
                </span>
              </div>
              <div className="flex items-center justify-between border-y border-border-subtle py-2">
                <div className="flex flex-col">
                  <span className="font-label-sm text-secondary">PASSENGER</span>
                  <span className="font-headline-sm text-on-surface">{data.passenger.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-label-sm text-secondary">SEAT</span>
                  <span className="font-headline-sm text-primary">{data.passenger.seat ?? "—"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-secondary">FLIGHT</span>
                  <span className="font-body-lg font-bold text-on-surface">
                    {data.passenger.origin} → {data.passenger.destination}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-secondary">GATE</span>
                  <span className="font-body-lg font-bold text-alert-amber">{data.passenger.gate ?? "—"}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-label-sm text-secondary">TERMINAL</span>
                  <span className="font-body-lg font-bold text-on-surface">{data.passenger.terminal ?? "—"}</span>
                </div>
              </div>
            </div>

            <DisruptionSimulator disrupt={disrupt} />
          </>
        )}
      </div>
    </AppShell>
  );
}
