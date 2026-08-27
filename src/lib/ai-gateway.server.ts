import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

export function getGatewayModel(id = "google/gemini-3.7-flash") {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured. Missing API key.");
  return createLovableAiGatewayProvider(key)(id);
}

export const GROUNDING_RULE =
  "Use ONLY the information the user provided. Never invent facts, names, numbers, deadlines, decisions or outcomes. If something is missing, use a clearly marked placeholder in square brackets such as [Your Name] or state that it was not mentioned.";
