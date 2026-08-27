import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { getGatewayModel, GROUNDING_RULE } from "./ai-gateway.server";

const EmailInput = z.object({
  purpose: z.string().min(1),
  keyInfo: z.string().optional().default(""),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  recipient: z.string().optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const result = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({ subject: z.string(), body: z.string() }),
      }),
      system: [
        "You are a workplace communication assistant that drafts professional emails.",
        GROUNDING_RULE,
        "Write a clear subject line and a well-structured email body in plain text with paragraph breaks.",
        "Keep it concise and appropriate for a professional workplace.",
      ].join(" "),
      prompt: [
        `Tone: ${data.tone}`,
        data.recipient ? `Recipient: ${data.recipient}` : "",
        `Purpose: ${data.purpose}`,
        data.keyInfo ? `Key information provided by the user:\n${data.keyInfo}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
    return await result.output;
  });

const NotesInput = z.object({ notes: z.string().min(1) });

export const summariseNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) => {
    const result = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          summary: z.string(),
          keyPoints: z.array(z.string()),
          decisions: z.array(z.string()),
          deadlines: z.array(z.object({ item: z.string(), due: z.string() })),
          actionItems: z.array(z.object({ task: z.string(), owner: z.string() })),
        }),
      }),
      system: [
        "You summarise workplace meeting notes.",
        GROUNDING_RULE,
        "Extract only decisions explicitly made, deadlines explicitly mentioned, and action items explicitly assigned.",
        "If an owner or due date is not stated, use 'Not specified'. Return empty arrays when nothing applies.",
      ].join(" "),
      prompt: `Meeting notes:\n\n${data.notes}`,
    });
    return await result.output;
  });

const PlanInput = z.object({
  tasks: z.string().min(1),
  horizon: z.enum(["Daily", "Weekly"]),
  hoursPerDay: z.number().min(1).max(16),
  notes: z.string().optional().default(""),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const result = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          strategy: z.string(),
          blocks: z.array(
            z.object({
              period: z.string(),
              slot: z.string(),
              task: z.string(),
              priority: z.string(),
              deadline: z.string(),
              rationale: z.string(),
            }),
          ),
        }),
      }),
      system: [
        "You are a task prioritisation and scheduling assistant.",
        GROUNDING_RULE,
        "Prioritise by stated deadlines, stated priority, and dependencies. Priority must be one of High, Medium or Low.",
        "'period' is the day label (e.g. 'Today' or 'Monday'), 'slot' is a time range. Use 'Not specified' where the user gave no deadline.",
      ].join(" "),
      prompt: [
        `Planning horizon: ${data.horizon}`,
        `Available working hours per day: ${data.hoursPerDay}`,
        `Tasks provided by the user (one per line):\n${data.tasks}`,
        data.notes ? `Additional constraints:\n${data.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
    return await result.output;
  });
