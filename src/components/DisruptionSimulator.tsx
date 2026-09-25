import type { UseMutationResult } from "@tanstack/react-query";

type DisruptInput = { event_type: string; new_value?: string; delay_minutes?: number };

const SCENARIOS: { label: string; hint: string; icon: string; input: DisruptInput }[] = [
  { label: "Gate change", hint: "Moves you to G24", icon: "shuffle", input: { event_type: "gate_change", new_value: "G24" } },
  { label: "Delay 45 min", hint: "Pushes departure back", icon: "hourglass_top", input: { event_type: "delay", delay_minutes: 45 } },
  { label: "Terminal change", hint: "Switches to T3", icon: "swap_horiz", input: { event_type: "terminal_change", new_value: "T3" } },
  { label: "Boarding started", hint: "Calls you to the gate", icon: "airplane_ticket", input: { event_type: "boarding_started" } },
  { label: "Gate closing", hint: "Final call", icon: "door_front", input: { event_type: "boarding_gate_closed" } },
  { label: "Security delay", hint: "Longer queues", icon: "local_police", input: { event_type: "security_delay", delay_minutes: 25 } },
  { label: "Baggage issue", hint: "Bag desk needed", icon: "luggage", input: { event_type: "baggage_issue" } },
  { label: "Cancellation", hint: "Rebooking required", icon: "cancel", input: { event_type: "cancellation" } },
];

export function DisruptionSimulator({
  disrupt,
}: {
  disrupt: UseMutationResult<unknown, Error, DisruptInput, unknown>;
}) {
  return (
    <div className="rounded-2xl bg-pure-white p-space-lg shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)]">
      <div className="mb-space-sm flex items-center gap-2">
        <span translate="no" className="notranslate material-symbols-outlined text-[20px] text-primary">science</span>
        <h3 className="font-headline-md text-headline-md text-on-surface">Live event simulator</h3>
      </div>
      <p className="mb-space-md font-body-sm text-body-sm text-on-surface-variant">
        Send a real airport event to your journey and watch the gate, progress and next action update.
      </p>
      <div className="grid grid-cols-2 gap-space-sm">
        {SCENARIOS.map((s) => (
          <button
            key={s.label}
            disabled={disrupt.isPending}
            onClick={() => disrupt.mutate(s.input)}
            className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-3 text-left transition-all active:scale-95 disabled:opacity-50"
          >
            <span translate="no" className="notranslate material-symbols-outlined text-[20px] text-primary">{s.icon}</span>
            <span className="font-label-md text-label-md text-on-surface">{s.label}</span>
            <span className="font-body-sm text-body-sm text-secondary">{s.hint}</span>
          </button>
        ))}
      </div>
      {disrupt.error && (
        <p className="mt-2 font-body-sm text-error">That update didn't go through. Please try again.</p>
      )}
    </div>
  );
}
