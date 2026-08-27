import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { AppShell, OutputPanel } from "@/components/AppShell";
import { summariseNotes } from "@/lib/ai.functions";
import { EmptyState, ErrorNote, Field, GenerateButton, inputClass } from "./index";

export const Route = createFileRoute("/summariser")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summariser — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Paste long meeting notes and get a concise summary with the decisions made and deadlines mentioned, all editable.",
      },
      { property: "og:title", content: "Meeting Notes Summariser — Workplace AI" },
      {
        property: "og:description",
        content: "Turn long meeting notes into a summary, decisions and deadlines.",
      },
    ],
  }),
  component: SummariserPage,
});

type Result = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  deadlines: { item: string; due: string }[];
  actionItems: { task: string; owner: string }[];
};

function toText(r: Result) {
  return [
    `SUMMARY\n${r.summary}`,
    `KEY POINTS\n${r.keyPoints.map((p) => `- ${p}`).join("\n")}`,
    `DECISIONS\n${r.decisions.map((d) => `- ${d}`).join("\n")}`,
    `DEADLINES\n${r.deadlines.map((d) => `- ${d.item} — ${d.due}`).join("\n")}`,
    `ACTION ITEMS\n${r.actionItems.map((a) => `- ${a.task} (${a.owner})`).join("\n")}`,
  ].join("\n\n");
}

function SummariserPage() {
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const run = useServerFn(summariseNotes);
  const mutation = useMutation({
    mutationFn: () => run({ data: { notes } }),
    onSuccess: (data) => setOutput(toText(data as Result)),
  });

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <AppShell title="Meeting Notes Summariser">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="space-y-6">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">Notes Distiller</h1>
            <p className="text-sm text-muted-foreground">
              Paste raw meeting notes. The assistant extracts only what was actually said.
            </p>
          </div>
          <div className="space-y-4">
            <Field label="Meeting Notes">
              <textarea
                rows={16}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your full meeting notes or transcript here…"
                className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
              />
            </Field>
            <GenerateButton
              disabled={notes.trim().length < 20}
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
              label="Summarise Notes"
            />
            <ErrorNote error={mutation.error} />
          </div>
        </section>

        <section>
          <OutputPanel
            loading={mutation.isPending}
            status={mutation.isPending ? "ANALYSING" : output ? "SUMMARY READY" : "AWAITING INPUT"}
            actions={
              output ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output);
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
            {output ? (
              <textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                className="min-h-[480px] w-full resize-none border-none p-0 text-sm leading-relaxed outline-none"
              />
            ) : (
              <EmptyState
                loading={mutation.isPending}
                hint="Your summary, decisions and deadlines will appear here, fully editable."
              />
            )}
          </OutputPanel>
        </section>
      </div>
    </AppShell>
  );
}
