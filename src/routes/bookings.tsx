import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BookButton } from "@/components/BookButton";
import { FlightLookup } from "@/components/FlightLookup";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Flight Bookings | AeroWay Companion" },
      { name: "description", content: "Manage upcoming flights, boarding passes and seat selections in one place." },
      { property: "og:title", content: "Flight Bookings | AeroWay Companion" },
      { property: "og:description", content: "Manage upcoming flights, boarding passes and seat selections in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Bookings,
});

function Bookings() {
  return (
    <AppShell title="Book">
<div className="flex flex-col w-full pb-space-xl">
{/* Hero Section / Greeting with playful personality */}
<div className="mb-space-lg flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-2.5 py-1 rounded-full uppercase tracking-wider">Flight Hub &amp; Concierge</span>
<span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span translate="no" className="notranslate material-symbols-outlined text-[14px] text-status-emerald">bolt</span> Live airline sync
      </span>
</div>
<h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold tracking-tight">Where to next, Captain?</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Chat with your AeroWay assistant to find the absolute best skies and deals.</p>
</div>
{/* Interactive Flight Search Chat Box (The Moment of Delight) */}
<div className="bg-pure-white rounded-xl p-space-md shadow-[0_4px_20px_-2px_rgba(18,35,63,0.08)] mb-space-lg transition-all hover:shadow-[0_8px_30px_-4px_rgba(18,35,63,0.12)]">
<div className="flex items-center gap-space-sm mb-space-md">
<div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
<span translate="no" className="notranslate material-symbols-outlined text-[20px]" style={{ "fontVariationSettings": "'FILL' 1" }}>smart_toy</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-headline-sm text-headline-sm text-on-surface truncate">AeroWay Smart Assistant</span>
<span className="font-body-sm text-body-sm text-secondary truncate">Live schedules, gates &amp; delays</span>
</div>
</div>
<FlightLookup
  placeholder="Type 'EK501' or 'MAA to DXB'..."
  chips={["EK501", "MAA to DXB", "6E55", "BOM to LHR"]}
/>
</div>
{/* Dynamic Chat Response Box (Initially hidden or showing friendly greeting) */}
<div className="hidden bg-primary-fixed/40 rounded-xl p-space-md mb-space-lg flex items-start gap-3" id="chat-response-card">
<div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5">
<span translate="no" className="notranslate material-symbols-outlined text-[16px]">auto_awesome</span>
</div>
<div className="flex flex-col gap-1 min-w-0">
<span className="font-label-md text-label-md font-bold text-primary">AeroWay Concierge Match</span>
<p className="font-body-md text-body-md text-on-surface" id="chat-result-text"></p>
</div>
</div>
{/* Active Flight Deals & Featured Routes */}
<div className="flex items-center justify-between mb-space-md">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold">Trending Sky Deals</h2>
<a className="font-label-md text-label-md text-primary font-semibold flex items-center gap-0.5" href="#">View all <span translate="no" className="notranslate material-symbols-outlined text-[16px]">chevron_right</span></a>
</div>
{/* Cards Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-xl">
{/* Deal Card 1 */}
<div className="bg-pure-white rounded-xl overflow-hidden shadow-[0_4px_16px_-4px_rgba(18,35,63,0.06)] flex flex-col justify-between group hover:shadow-[0_8px_24px_-4px_rgba(18,35,63,0.1)] transition-all">
<div className="relative h-36 w-full bg-cover bg-center" data-alt="Stunning aerial view of Dubai skyline at sunset with Burj Khalifa piercing through golden clouds, ultra-modern architecture, luxury travel mood, warm amber and navy color palette" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtZQV_k2T9XDlQnKUeIBEhbH77x9uOgalfRA0wRGjyCcV3qU6U1hu1ED0D99b3slscRJYFQ28RRnTcfo7bW0JRl3hu1YNg2Ipgf2ayv91HcN4hMlMDJRBw9ohpfqfDFIPJmzUTIrBwpwVEPMQP5lfTdAHvhDZAzXm8f1WvWUkvMed6UFFi5i25BlCsk3NJA-NgV1eiAwr1MoAG_eSqoycuLX8jUxiEsvrE5shxVieWik-WNXx57r-R1g')" }}>
<div className="absolute inset-0 bg-gradient-to-t from-navy-depth/80 via-transparent to-transparent"></div>
<span className="absolute top-3 left-3 bg-status-emerald text-pure-white font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm">Save 28%</span>
<div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
<div className="text-pure-white">
<span className="font-label-sm text-label-sm text-primary-fixed block uppercase">Partner Special</span>
<span className="font-headline-sm text-headline-sm font-bold">Chennai ➔ Dubai</span>
</div>
<div className="text-right text-pure-white">
<span className="font-body-sm opacity-80 block line-through">₹24,500</span>
<span className="font-headline-md text-headline-md font-bold text-tertiary-fixed">₹17,499</span>
</div>
</div>
</div>
<div className="p-space-md flex flex-col gap-3">
<div className="flex items-center justify-between text-secondary font-body-sm">
<span className="flex items-center gap-1"><span translate="no" className="notranslate material-symbols-outlined text-[16px]">airline_seat_recline_normal</span> IndiGo • Economy</span>
<span className="flex items-center gap-1 text-status-emerald font-semibold"><span translate="no" className="notranslate material-symbols-outlined text-[16px]">verified</span> Official Partner</span>
</div>
<BookButton airline="IndiGo" route="Chennai → Dubai" price="₹17,499" label="Book Direct with IndiGo" />
</div>
</div>
{/* Deal Card 2 */}
<div className="bg-pure-white rounded-xl overflow-hidden shadow-[0_4px_16px_-4px_rgba(18,35,63,0.06)] flex flex-col justify-between group hover:shadow-[0_8px_24px_-4px_rgba(18,35,63,0.1)] transition-all">
<div className="relative h-36 w-full bg-cover bg-center" data-alt="Iconic London skyline featuring Tower Bridge and the River Thames under dramatic moody clouds with soft golden hour light catching historic architecture, sophisticated travel vibe" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlJrYpntkTdlPcBABtRwzPDMekp70HMZveHEiIm_INm9mFec2g0mLBmmQH1TohnWPL_LflEXvOVLd1awPB-5RwQA4XQDKaPdEzvm-pthSK1auZhHpGgUUcuj_C8D1cFp5g-ZcGbyBxvnohbVMmoOBNEaZ7Bl0W8-RCbRB2ulo2MwuBGcwo_22PE1H5KL4mpWlfQeQZy7dfWYnX-4gfCnlCbQjDuT0YZe1H24JOGGNqjgKXxjg4DxJjnA')" }}>
<div className="absolute inset-0 bg-gradient-to-t from-navy-depth/80 via-transparent to-transparent"></div>
<span className="absolute top-3 left-3 bg-alert-amber text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm">Limited Seats</span>
<div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
<div className="text-pure-white">
<span className="font-label-sm text-label-sm text-primary-fixed block uppercase">Direct Flight</span>
<span className="font-headline-sm text-headline-sm font-bold">Mumbai ➔ London</span>
</div>
<div className="text-right text-pure-white">
<span className="font-body-sm opacity-80 block line-through">₹58,000</span>
<span className="font-headline-md text-headline-md font-bold text-tertiary-fixed">₹42,900</span>
</div>
</div>
</div>
<div className="p-space-md flex flex-col gap-3">
<div className="flex items-center justify-between text-secondary font-body-sm">
<span className="flex items-center gap-1"><span translate="no" className="notranslate material-symbols-outlined text-[16px]">airline_seat_recline_normal</span> British Airways</span>
<span className="flex items-center gap-1 text-status-emerald font-semibold"><span translate="no" className="notranslate material-symbols-outlined text-[16px]">verified</span> Official Partner</span>
</div>
<BookButton airline="British Airways" route="Mumbai → London" price="₹42,900" label="Book Direct with BA" />
</div>
</div>
</div>
{/* Price Comparison Matrix Section */}
<div className="bg-pure-white rounded-xl p-space-md shadow-[0_4px_20px_-2px_rgba(18,35,63,0.06)] mb-space-xl">
<div className="flex items-center justify-between mb-space-md">
<div>
<h3 className="font-headline-md text-headline-md text-on-surface font-bold">Live Price Comparator</h3>
<p className="font-body-sm text-body-sm text-secondary">Real-time fares synced across official airline desks</p>
</div>
<span translate="no" className="notranslate material-symbols-outlined text-primary text-[24px]">analytics</span>
</div>
<div className="flex flex-col gap-3">
{/* Airline Row 1 */}
<div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-all">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">6E</div>
<div>
<span className="font-headline-sm text-headline-sm text-on-surface block">IndiGo Airlines</span>
<span className="font-body-sm text-secondary">Non-stop • 04h 15m • Baggage included</span>
</div>
</div>
<div className="text-right">
<span className="font-headline-md text-headline-md text-primary font-bold block">₹17,499</span>
<BookButton compact airline="IndiGo" route="Chennai → Dubai" price="₹17,499" label="Book ↗" />
</div>
</div>
{/* Airline Row 2 */}
<div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-all">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">EK</div>
<div>
<span className="font-headline-sm text-headline-sm text-on-surface block">Emirates</span>
<span className="font-body-sm text-secondary">Non-stop • 04h 00m • Luxury Dining</span>
</div>
</div>
<div className="text-right">
<span className="font-headline-md text-headline-md text-on-surface font-bold block">₹21,200</span>
<BookButton compact airline="Emirates" route="Chennai → Dubai" price="₹21,200" label="Book ↗" />
</div>
</div>
{/* Airline Row 3 */}
<div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-all">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-sm">AI</div>
<div>
<span className="font-headline-sm text-headline-sm text-on-surface block">Air India</span>
<span className="font-body-sm text-secondary">1 Stop • 07h 30m • Free Lounge Pass</span>
</div>
</div>
<div className="text-right">
<span className="font-headline-md text-headline-md text-on-surface font-bold block">₹19,850</span>
<BookButton compact airline="Air India" route="Chennai → Dubai" price="₹19,850" label="Book ↗" />
</div>
</div>
</div>
</div>

</div>
    </AppShell>
  );
}
