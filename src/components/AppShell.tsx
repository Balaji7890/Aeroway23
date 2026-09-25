import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "ES", label: "Español" },
  { code: "FR", label: "Français" },
  { code: "DE", label: "Deutsch" },
  { code: "HI", label: "Hindi (हिंदी)" },
  { code: "AR", label: "العربية" },
  { code: "ZH", label: "中文" },
];

const TABS = [
  { to: "/chat", icon: "smart_toy", label: "Chat" },
  { to: "/", icon: "near_me", label: "Journey" },
  { to: "/my-plan", icon: "fact_check", label: "Plan" },
  { to: "/helpline", icon: "support_agent", label: "Help" },
  { to: "/bookings", icon: "flight_takeoff", label: "Book" },
] as const;

const GT_CODES: Record<string, string> = {
  EN: "en", ES: "es", FR: "fr", DE: "de", HI: "hi", AR: "ar", ZH: "zh-CN",
};

function readLang() {
  const m = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  if (!m) return "EN";
  return Object.keys(GT_CODES).find((k) => GT_CODES[k] === m[1]) ?? "EN";
}

function applyLang(code: string) {
  const host = window.location.hostname;
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; ${expire}; path=/`;
  document.cookie = `googtrans=; ${expire}; path=/; domain=${host}`;
  document.cookie = `googtrans=; ${expire}; path=/; domain=.${host}`;
  if (code !== "EN") document.cookie = `googtrans=/en/${GT_CODES[code]}; path=/`;
  window.location.reload();
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLangState] = useState("EN");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signIn, signOut } = useAuth();

  useEffect(() => {
    const current = readLang();
    setLangState(current);
    document.documentElement.dir = current === "AR" ? "rtl" : "ltr";
    if (current === "EN" || document.getElementById("gt-script")) return;
    // Keep icon names (e.g. "luggage") from being translated into words.
    const protect = () =>
      document.querySelectorAll(".material-symbols-outlined:not(.notranslate)").forEach((el) => {
        el.classList.add("notranslate");
        el.setAttribute("translate", "no");
      });
    protect();
    new MutationObserver(protect).observe(document.body, { childList: true, subtree: true });
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "gt-element",
      );
    };
    const s = document.createElement("script");
    s.id = "gt-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(s);
  }, []);

  const setLang = (code: string) => {
    if (code === lang) return;
    setLangState(code);
    applyLang(code);
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface selection:bg-secondary-container">
      <div id="gt-element" className="hidden" />
      <header className="fixed top-0 z-50 w-full pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-28 max-w-[1200px] flex-col justify-between px-margin py-space-sm">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex min-w-0 items-center gap-space-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
                <span className="material-symbols-outlined text-[18px]">flight</span>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-space-xs">
                  <span className="truncate font-headline-sm text-headline-sm tracking-tight text-primary">
                    AeroWay
                  </span>
                  <span className="hidden rounded-full bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm uppercase text-secondary sm:inline-block">
                    Companion
                  </span>
                </span>
                <span className="truncate font-label-sm text-label-sm text-on-surface-variant">
                  {title}
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-space-xs">
              <div className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="flex h-9 items-center gap-1 rounded-full bg-pure-white px-2.5 font-label-md text-label-md text-on-surface shadow-[0_2px_8px_rgba(18,35,63,0.06)] transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">language</span>
                  <span>{lang}</span>
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                    expand_more
                  </span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-40 rounded-xl bg-pure-white py-1.5 shadow-[0_12px_32px_-4px_rgba(18,35,63,0.12)]">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setLangOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-left font-label-md text-label-md ${
                          l.code === lang
                            ? "bg-surface-container-low text-primary"
                            : "text-on-surface hover:bg-surface-container-low"
                        }`}
                      >
                        <span>{l.label}</span>
                        {l.code === lang && (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => (user ? signOut() : signIn())}
                title={user ? `Signed in as ${user.email} — tap to sign out` : "Sign in with Google"}
                className="flex h-8 items-center gap-1 rounded-full bg-primary px-2 text-on-primary font-label-sm text-label-sm"
              >
                <span className="material-symbols-outlined text-[18px]">{user ? "logout" : "person"}</span>
                <span className="hidden sm:inline">{user ? "Sign out" : "Sign in"}</span>
              </button>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-2 overflow-hidden rounded-full bg-pure-white px-3 py-1.5 shadow-[0_2px_6px_rgba(18,35,63,0.04)]">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-emerald opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-status-emerald" />
              </span>
              <span className="truncate font-label-md text-label-md font-semibold text-on-surface">
                Journey tracking{" "}
                <span className="font-normal text-secondary">
                  • live steps, gate and boarding guidance
                </span>
              </span>
            </div>
            <span className="shrink-0 rounded-full bg-[rgba(14,138,84,0.12)] px-2 py-0.5 font-label-sm text-label-sm text-status-emerald">
              Live
            </span>

          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-[1200px] flex-col bg-surface px-margin pt-28 pb-28">
        {children}
      </main>

      <nav className="pointer-events-none fixed bottom-0 z-50 w-full pb-safe">
        <div className="pointer-events-auto mx-auto mb-space-md flex max-w-[600px] items-center justify-between gap-0.5 rounded-full bg-pure-white/90 p-1.5 shadow-[0_8px_24px_-4px_rgba(18,35,63,0.12)] backdrop-blur-xl mx-margin">
          {TABS.map((t) => {
            const active = pathname === t.to;

            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex h-12 flex-1 flex-col items-center justify-center gap-1 rounded-full px-1 transition-all active:scale-95 sm:flex-row ${
                  active
                    ? "bg-navy-depth text-pure-white shadow-[0_4px_12px_rgba(12,23,42,0.2)]"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                <span className="truncate text-[10px] font-semibold sm:text-label-md">
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
