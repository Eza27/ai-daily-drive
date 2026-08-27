import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { AppShell, OutputPanel } from "@/components/AppShell";
import { planTasks } from "@/lib/ai.functions";
import { EmptyState, ErrorNote, Field, GenerateButton, inputClass } from "./index";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Enter your tasks, deadlines and priorities and get an AI-generated daily or weekly schedule you can edit.",
      },
      { property: "og:title", content: "AI Task Planner — Workplace AI" },
      {
        property: "og:description",
        content: "Prioritise tasks and build a daily or weekly schedule with AI.",
      },
    ],
  }),
  component: PlannerPage,
});

type Block = {
  period: string;
  slot: string;
  task: string;
  priority: string;
  deadline: string;
  rationale: string;
};

const HORIZONS = ["Daily", "Weekly"] as const;
type Horizon = (typeof HORIZONS)[number];

function priorityClass(p: string) {
  const v = p.toLowerCase();
  if (v.startsWith("high")) return "bg-destructive/10 text-destructive";
  if (v.startsWith("med")) return "bg-warning/20 text-foreground";
  return "bg-muted text-muted-foreground";
}

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [notes, setNotes] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("Daily");
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [strategy, setStrategy] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [copied, setCopied] = useState(false);

  const run = useServerFn(planTasks);
  const mutation = useMutation({
    mutationFn: () => run({ data: { tasks, notes, horizon, hoursPerDay } }),
    onSuccess: (data) => {
      setStrategy(data.strategy);
      setBlocks(data.blocks as Block[]);
    },
  });

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const update = (i: number, key: keyof Block, value: string) =>
    setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, [key]: value } : b)));

  const hasOutput = blocks.length > 0;

  return (
    <AppShell title="AI Task Planner">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="space-y-6">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">Schedule Architect</h1>
            <p className="text-sm text-muted-foreground">
              List your tasks with any priorities and deadlines. The assistant sequences only
              what you provide.
            </p>
          </div>

          <div className="space-y-4">
            <Field label="Tasks (one per line)">
              <textarea
                rows={9}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder={
                  "Finish Q3 report — high priority, due Friday\nReview design feedback\nPrepare client demo — due Wednesday"
                }
                className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Planning Horizon">
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  {HORIZONS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorizon(h)}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                        horizon === h
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Working Hours / Day">
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value) || 1)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Constraints (optional)">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. No meetings before 10:00; Thursday is a leave day"
                className={`${inputClass} resize-none`}
              />
            </Field>

            <GenerateButton
              disabled={tasks.trim().length < 3}
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
              label="Generate Schedule"
            />
            <ErrorNote error={mutation.error} />
          </div>
        </section>

        <section>
          <OutputPanel
            loading={mutation.isPending}
            status={
              mutation.isPending ? "PLANNING" : hasOutput ? "SCHEDULE READY" : "AWAITING INPUT"
            }
            actions={
              hasOutput ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${strategy}\n\n${blocks
                        .map(
                          (b) =>
                            `${b.period} · ${b.slot} — ${b.task} [${b.priority}] (due: ${b.deadline})`,
                        )
                        .join("\n")}`,
                    );
                    setCopied(true);
                  }}
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted active:translate-y-px"
                >
                  <Copy className="size-3.5" />
                  {copied ? "Copied" : "Copy to Clipboard"}
                </button>
              ) : null
            }
          >
            {hasOutput ? (
              <div className="space-y-4">
                <textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full resize-none border-none p-0 text-sm leading-relaxed outline-none"
                  rows={3}
                />
                <div className="h-px w-full bg-border/60" />
                <div className="space-y-3">
                  {blocks.map((b, i) => (
                    <div key={i} className="rounded-lg border border-border bg-background p-3">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <input
                          value={b.period}
                          onChange={(e) => update(i, "period", e.target.value)}
                          className="w-24 border-none bg-transparent p-0 font-mono text-[10px] uppercase text-muted-foreground outline-none"
                        />
                        <input
                          value={b.slot}
                          onChange={(e) => update(i, "slot", e.target.value)}
                          className="w-28 border-none bg-transparent p-0 font-mono text-[10px] text-muted-foreground outline-none"
                        />
                        <span
                          className={`ml-auto rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityClass(b.priority)}`}
                        >
                          {b.priority}
                        </span>
                      </div>
                      <input
                        value={b.task}
                        onChange={(e) => update(i, "task", e.target.value)}
                        className="w-full border-none bg-transparent p-0 text-sm font-medium outline-none"
                      />
                      <div className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-muted-foreground">
                        <span className="font-mono">DUE: {b.deadline}</span>
                        <span>{b.rationale}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                loading={mutation.isPending}
                hint="Your prioritised, editable schedule will appear here."
              />
            )}
          </OutputPanel>
        </section>
      </div>
    </AppShell>
  );
}
