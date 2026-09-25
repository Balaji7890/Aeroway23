import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { JourneyBoard } from "@/components/JourneyBoard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Airport Journey Tracker | AeroWay Companion" },
      {
        name: "description",
        content: "Live step-by-step airport guidance with gate, security and boarding updates.",
      },
      { property: "og:title", content: "Airport Journey Tracker | AeroWay Companion" },
      {
        property: "og:description",
        content: "Live step-by-step airport guidance with gate, security and boarding updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Journey,
});

function Journey() {
  return (
    <AppShell title="Journey">
      <div className="flex w-full flex-col pb-space-xl">
        <div className="mb-space-lg">
          <span className="font-label-md text-label-md uppercase tracking-wider text-surface-tint">
            Live Terminal Companion
          </span>
          <h1 className="mt-0.5 font-display-lg-mobile text-display-lg-mobile tracking-tight text-on-surface">
            Your Airport Journey
          </h1>
        </div>
        <JourneyBoard />
      </div>
    </AppShell>
  );
}
