import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HelpRequestForm } from "@/components/HelpRequestForm";
import { FlightLookup } from "@/components/FlightLookup";

export const Route = createFileRoute("/helpline")({
  head: () => ({
    meta: [
      { title: "Airport Helpline Directory | AeroWay Companion" },
      { name: "description", content: "Multilingual helpline numbers and information desks across every terminal." },
      { property: "og:title", content: "Airport Helpline Directory | AeroWay Companion" },
      { property: "og:description", content: "Multilingual helpline numbers and information desks across every terminal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Helpline,
});

function Helpline() {
  return (
    <AppShell title="Help">
<div className="flex flex-col w-full gap-space-lg pb-space-xl">
{/* Search and Quick Filter Bar */}
<div className="flex flex-col gap-space-md">
<div className="relative">
<span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
<span className="material-symbols-outlined text-[20px]">search</span>
</span>
<input className="w-full bg-pure-white text-on-surface placeholder:text-outline text-body-md py-3 pl-11 pr-4 rounded-xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] focus:outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="Search airlines, airports, medical, security..." type="text" />
</div>
{/* Filter Pills */}
<div className="flex items-center gap-space-xs overflow-x-auto pb-1">
<button className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-label-md shrink-0 shadow-[0_2px_8px_rgba(0,54,148,0.2)]">All Contacts</button>
<button className="px-3.5 py-1.5 rounded-full bg-pure-white text-secondary font-label-md shrink-0 shadow-[0_2px_8px_rgba(18,35,63,0.04)] hover:bg-surface-container-low transition-all">Airports</button>
<button className="px-3.5 py-1.5 rounded-full bg-pure-white text-secondary font-label-md shrink-0 shadow-[0_2px_8px_rgba(18,35,63,0.04)] hover:bg-surface-container-low transition-all">Airlines</button>
<button className="px-3.5 py-1.5 rounded-full bg-pure-white text-secondary font-label-md shrink-0 shadow-[0_2px_8px_rgba(18,35,63,0.04)] hover:bg-surface-container-low transition-all">Emergency</button>
<button className="px-3.5 py-1.5 rounded-full bg-pure-white text-secondary font-label-md shrink-0 shadow-[0_2px_8px_rgba(18,35,63,0.04)] hover:bg-surface-container-low transition-all">Medical</button>
</div>
</div>
{/* Emergency Assistance Banner (Delightful High-Priority Card) */}
<div className="bg-gradient-to-br from-error-container/60 via-pure-white to-pure-white p-space-md rounded-2xl shadow-[0_8px_24px_-4px_rgba(18,35,63,0.08)] flex flex-col gap-space-md relative overflow-hidden">
<div className="absolute -right-6 -bottom-6 w-28 h-28 bg-error/10 rounded-full blur-xl pointer-events-none"></div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-error flex items-center justify-center text-on-error shadow-[0_4px_12px_rgba(186,26,26,0.3)] animate-pulse">
<span className="material-symbols-outlined text-[20px]">emergency</span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Airport Emergency Hotline</h2>
<p className="font-body-sm text-on-surface-variant">Instant security &amp; medical response team</p>
</div>
</div>
<span className="font-label-sm text-label-sm bg-error/12 text-error px-2.5 py-1 rounded-full uppercase tracking-wider">24/7 Active</span>
</div>
<div className="grid grid-cols-2 gap-space-sm">
<a className="flex items-center justify-center gap-2 py-3 px-4 bg-error text-on-error rounded-xl font-label-lg shadow-[0_4px_12px_rgba(186,26,26,0.25)] active:scale-95 transition-all" href="tel:911">
<span className="material-symbols-outlined text-[18px]">call</span>
<span>Call Security</span>
</a>
<a className="flex items-center justify-center gap-2 py-3 px-4 bg-pure-white text-error rounded-xl font-label-lg shadow-[0_4px_12px_rgba(18,35,63,0.06)] active:scale-95 transition-all" href="tel:112">
<span className="material-symbols-outlined text-[18px]">medical_services</span>
<span>Medical Desk</span>
</a>
</div>
</div>
{/* Airport Helplines Section */}
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between px-1">
<h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">flight</span>
        Airport Helplines
      </h3>
<span className="font-label-md text-secondary">Global Hubs</span>
</div>
<div className="grid grid-cols-1 gap-space-sm">
{/* MAA Airport Card */}
<div className="bg-pure-white p-space-md rounded-2xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary font-headline-md">
            MAA
          </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">Chennai International</span>
<span className="font-body-sm text-on-surface-variant truncate">Terminal 1 &amp; 4 • Information Desk</span>
<span className="font-label-sm text-status-emerald mt-0.5">Average wait: 2 mins</span>
</div>
</div>
<div className="flex items-center gap-space-xs shrink-0">
<button className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-all active:scale-95" title="Chat Assistance">
<span className="material-symbols-outlined text-[18px]">chat</span>
</button>
<a className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_4px_12px_rgba(0,54,148,0.2)] hover:opacity-90 transition-all active:scale-95" href="tel:+914422560551" title="Call Airport">
<span className="material-symbols-outlined text-[18px]">call</span>
</a>
</div>
</div>
{/* DXB Airport Card */}
<div className="bg-pure-white p-space-md rounded-2xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary font-headline-md">
            DXB
          </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">Dubai International</span>
<span className="font-body-sm text-on-surface-variant truncate">Terminals 1, 2 &amp; 3 • Multilingual Help</span>
<span className="font-label-sm text-status-emerald mt-0.5">Average wait: &lt; 1 min</span>
</div>
</div>
<div className="flex items-center gap-space-xs shrink-0">
<button className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-all active:scale-95" title="Chat Assistance">
<span className="material-symbols-outlined text-[18px]">chat</span>
</button>
<a className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_4px_12px_rgba(0,54,148,0.2)] hover:opacity-90 transition-all active:scale-95" href="tel:+97142245555" title="Call Airport">
<span className="material-symbols-outlined text-[18px]">call</span>
</a>
</div>
</div>
{/* LHR Airport Card */}
<div className="bg-pure-white p-space-md rounded-2xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary font-headline-md">
            LHR
          </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">London Heathrow</span>
<span className="font-body-sm text-on-surface-variant truncate">All Terminals • Passenger Support</span>
<span className="font-label-sm text-alert-amber mt-0.5">Average wait: ~4 mins</span>
</div>
</div>
<div className="flex items-center gap-space-xs shrink-0">
<button className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-all active:scale-95" title="Chat Assistance">
<span className="material-symbols-outlined text-[18px]">chat</span>
</button>
<a className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_4px_12px_rgba(0,54,148,0.2)] hover:opacity-90 transition-all active:scale-95" href="tel:+448443351801" title="Call Airport">
<span className="material-symbols-outlined text-[18px]">call</span>
</a>
</div>
</div>
{/* SIN Airport Card */}
<div className="bg-pure-white p-space-md rounded-2xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary font-headline-md">
            SIN
          </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">Singapore Changi</span>
<span className="font-body-sm text-on-surface-variant truncate">Jewel &amp; Terminals 1-4 • Concierge</span>
<span className="font-label-sm text-status-emerald mt-0.5">Average wait: Instant</span>
</div>
</div>
<div className="flex items-center gap-space-xs shrink-0">
<button className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-all active:scale-95" title="Chat Assistance">
<span className="material-symbols-outlined text-[18px]">chat</span>
</button>
<a className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_4px_12px_rgba(0,54,148,0.2)] hover:opacity-90 transition-all active:scale-95" href="tel:+6565956868" title="Call Airport">
<span className="material-symbols-outlined text-[18px]">call</span>
</a>
</div>
</div>
</div>
</div>
{/* Airline Customer Care Section */}
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between px-1">
<h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
        Airline Customer Care
      </h3>
<span className="font-label-md text-secondary">Partners</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
{/* Emirates */}
<div className="bg-pure-white p-space-md rounded-2xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-primary font-headline-md">
            EK
          </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">Emirates</span>
<span className="font-body-sm text-on-surface-variant truncate">24/7 Global Support Desk</span>
</div>
</div>
<a className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-all active:scale-95 shrink-0" href="tel:+971600555555" title="Call Airline">
<span className="material-symbols-outlined text-[18px]">call</span>
</a>
</div>
{/* IndiGo */}
<div className="bg-pure-white p-space-md rounded-2xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-primary font-headline-md">
            6E
          </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">IndiGo</span>
<span className="font-body-sm text-on-surface-variant truncate">Reservations &amp; Re-booking</span>
</div>
</div>
<a className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-all active:scale-95 shrink-0" href="tel:+919910383838" title="Call Airline">
<span className="material-symbols-outlined text-[18px]">call</span>
</a>
</div>
{/* Air India */}
<div className="bg-pure-white p-space-md rounded-2xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-primary font-headline-md">
            AI
          </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">Air India</span>
<span className="font-body-sm text-on-surface-variant truncate">Customer Relations &amp; Baggage</span>
</div>
</div>
<a className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-all active:scale-95 shrink-0" href="tel:+9118001801407" title="Call Airline">
<span className="material-symbols-outlined text-[18px]">call</span>
</a>
</div>
{/* Qatar Airways */}
<div className="bg-pure-white p-space-md rounded-2xl shadow-[0_4px_12px_-2px_rgba(18,35,63,0.05)] flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-primary font-headline-md">
            QR
          </div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">Qatar Airways</span>
<span className="font-body-sm text-on-surface-variant truncate">Privilege Club &amp; Support</span>
</div>
</div>
<a className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-all active:scale-95 shrink-0" href="tel:+97440230000" title="Call Airline">
<span className="material-symbols-outlined text-[18px]">call</span>
</a>
</div>
</div>
</div>
{/* Smart AI Concierge Help Prompt */}
<div className="bg-surface-container-high p-space-lg rounded-2xl flex flex-col items-center text-center gap-space-md relative overflow-hidden">
<div className="absolute -left-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
<div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_4px_12px_rgba(0,54,148,0.2)]">
<span className="material-symbols-outlined text-[24px]">smart_toy</span>
</div>
<div className="flex flex-col gap-1 max-w-xs">
<h4 className="font-headline-sm text-headline-sm text-on-surface">Can't find who you're looking for?</h4>
<p className="font-body-sm text-on-surface-variant">Ask AeroWay AI to instantly dial or connect you with the right terminal desk.</p>
</div>
<Link to="/chat" className="px-5 py-2.5 bg-primary text-on-primary rounded-full font-label-lg shadow-[0_4px_12px_rgba(0,54,148,0.2)] hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">chat</span>
<span>Ask AI Assistant</span>
</Link>
</div>
<HelpRequestForm />
</div>

    </AppShell>
  );
}
