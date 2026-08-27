import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { AppShell, OutputPanel } from "@/components/AppShell";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft professional workplace emails in formal, friendly or persuasive tones with AI, then edit and copy the result.",
      },
      { property: "og:title", content: "Smart Email Generator — Workplace AI" },
      {
        property: "og:description",
        content: "Generate, edit and copy professional workplace emails with AI.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
type Tone = (typeof TONES)[number];

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [keyInfo, setKeyInfo] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  const run = useServerFn(generateEmail);
  const mutation = useMutation({
    mutationFn: () => run({ data: { purpose, keyInfo, tone, recipient } }),
    onSuccess: (data) => {
      setSubject(data.subject);
      setBody(data.body);
    },
  });

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const hasOutput = Boolean(subject || body);

  return (
    <AppShell title="Smart Email Generator">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="space-y-6">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">Email Draftsman</h1>
            <p className="text-sm text-muted-foreground">
              Configure the purpose and context for your workplace communication.
            </p>
          </div>

          <div className="space-y-4">
            <Field label="Recipient (optional)">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Finance team"
                className={inputClass}
              />
            </Field>

            <Field label="Email Purpose">
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Requesting a deadline extension for the Q3 Report"
                className={inputClass}
              />
            </Field>

            <Field label="Key Information & Constraints">
              <textarea
                rows={5}
                value={keyInfo}
                onChange={(e) => setKeyInfo(e.target.value)}
                placeholder={"- Delay due to unexpected data audit\n- New date: Oct 15"}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Desired Tone">
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      tone === t
                        ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <GenerateButton
              disabled={!purpose.trim()}
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
              label="Generate Draft"
            />
            <ErrorNote error={mutation.error} />
          </div>
        </section>

        <section>
          <OutputPanel
            loading={mutation.isPending}
            status={
              mutation.isPending ? "GENERATING" : hasOutput ? "DRAFT READY" : "AWAITING INPUT"
            }
            actions={
              hasOutput ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
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
                <div className="space-y-1">
                  <div className="font-mono text-[10px] uppercase text-muted-foreground">
                    Subject
                  </div>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border-none p-0 text-sm font-semibold outline-none"
                  />
                </div>
                <div className="h-px w-full bg-border/60" />
                <div className="space-y-1">
                  <div className="font-mono text-[10px] uppercase text-muted-foreground">Body</div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[340px] w-full resize-none border-none p-0 text-sm leading-relaxed outline-none"
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                loading={mutation.isPending}
                hint="Your generated email will appear here, fully editable."
              />
            )}
          </OutputPanel>
        </section>
      </div>
    </AppShell>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function GenerateButton({
  disabled,
  loading,
  onClick,
  label,
}: {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-sm font-semibold text-background shadow-xl shadow-foreground/5 transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {loading ? "Generating…" : label}
    </button>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
      {error instanceof Error ? error.message : "Something went wrong. Please try again."}
    </p>
  );
}

export function EmptyState({ loading, hint }: { loading?: boolean; hint: string }) {
  return (
    <div className="flex min-h-[340px] items-center justify-center text-center">
      <p className="max-w-[28ch] text-xs text-muted-foreground">
        {loading ? "Working on it…" : hint}
      </p>
    </div>
  );
}
