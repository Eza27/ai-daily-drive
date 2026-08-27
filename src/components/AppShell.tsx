import { Link } from "@tanstack/react-router";
import { CalendarClock, ClipboardList, Mail, Menu, Sparkles, X } from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Smart Email", icon: Mail },
  { to: "/summariser", label: "Meeting Summariser", icon: ClipboardList },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
] as const;

export function Disclaimer() {
  return (
    <div className="flex gap-4 rounded-lg border border-border/60 bg-muted p-4">
      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-muted-foreground/50 font-mono text-[10px] font-bold text-muted-foreground">
        i
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        <strong className="font-semibold text-foreground">Responsible AI Disclaimer:</strong>{" "}
        AI-generated content may contain errors or omissions. Please review and verify
        AI-generated information before using it for important workplace communication,
        decisions, or actions. The AI uses only the information provided by you and does not
        invent facts, deadlines, decisions, or other information.
      </p>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          activeProps={{ className: "bg-accent text-accent-foreground hover:bg-accent" }}
        >
          <Icon className="size-4" strokeWidth={2} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-6 items-center justify-center rounded-sm bg-primary">
        <Sparkles className="size-3.5 text-primary-foreground" />
      </div>
      <span className="text-sm font-bold tracking-tight">WORKPLACE AI</span>
    </div>
  );
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground antialiased lg:h-screen">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="p-6">
          <div className="mb-8">
            <Brand />
          </div>
          <NavLinks />
        </div>
        <div className="mt-auto border-t border-border p-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full border border-border bg-muted" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold">Your workspace</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                AI ASSISTANT v1.0
              </span>
            </div>
          </div>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[260px] border-r border-border bg-sidebar p-6">
            <div className="mb-8 flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur-sm sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5 text-muted-foreground" />
            </button>
            <span className="hidden font-mono text-xs uppercase tracking-widest text-muted-foreground sm:inline">
              Tool /
            </span>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
              SYSTEM STATUS: OPTIMAL
            </span>
            <div className="size-2 rounded-full bg-success" />
          </div>
        </header>

        <div className="stagger-in flex-1 p-4 sm:p-8 lg:overflow-y-auto">
          <div className="mx-auto max-w-6xl">{children}</div>
          <footer className="mx-auto mt-12 max-w-6xl pb-8">
            <Disclaimer />
          </footer>
        </div>
      </main>
    </div>
  );
}

export function OutputPanel({
  status,
  loading,
  actions,
  children,
}: {
  status: string;
  loading?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-3">
        <span className="font-mono text-[10px] text-muted-foreground">AI GENERATED OUTPUT</span>
        <div className="flex items-center gap-2">
          <span
            className={`size-1.5 rounded-full ${loading ? "bg-warning" : "bg-muted-foreground/40"}`}
          />
          <span className="font-mono text-[10px] uppercase text-muted-foreground">{status}</span>
        </div>
      </div>
      <div className="relative h-0.5 w-full overflow-hidden bg-muted">
        {loading ? <div className="animate-scan absolute top-0 h-full w-[40%] bg-primary" /> : null}
      </div>
      <div className="flex-1 p-6">{children}</div>
      {actions ? (
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted p-4">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
