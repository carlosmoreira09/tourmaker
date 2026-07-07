import OpenAI from "openai";
import type { Candidate, StepPlan } from "./types";

export const DEFAULT_MODEL = "gpt-4o-mini";

const SYSTEM = `Você é um especialista em onboarding de produtos. Recebe uma lista de elementos reais de uma página (cada um com um index) e um objetivo em linguagem natural. Sua tarefa é projetar um tour interativo curto e útil.

Regras:
- Escolha apenas os elementos mais relevantes para o objetivo; não crie um passo para cada elemento.
- Ordene os passos de forma lógica (o fluxo que um novo usuário seguiria).
- Você PODE começar com um passo centralizado de boas-vindas usando elementIndex = -1 (sem âncora).
- Cada "content" deve ter 1–2 frases, tom amigável e direto.
- Escreva no MESMO idioma do objetivo do usuário.
- Escolha um "placement" que faça sentido para a posição do elemento na tela.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          elementIndex: {
            type: "integer",
            description:
              "Index do elemento alvo, ou -1 para um passo centralizado sem âncora (ex: boas-vindas).",
          },
          title: { type: "string" },
          content: { type: "string" },
          placement: {
            type: "string",
            enum: ["top", "bottom", "left", "right", "auto"],
          },
        },
        required: ["elementIndex", "title", "content", "placement"],
      },
    },
  },
  required: ["steps"],
} as const;

export async function planTour(
  candidates: Candidate[],
  goal: string,
  model: string = DEFAULT_MODEL,
): Promise<StepPlan[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY não definida. Exporte sua chave da OpenAI no ambiente.",
    );
  }

  const client = new OpenAI();

  const list = candidates
    .map((c) => {
      const parts = [`${c.index}: <${c.tag}>`];
      if (c.role) parts.push(`role=${c.role}`);
      if (c.ariaLabel) parts.push(`aria-label="${c.ariaLabel}"`);
      if (c.text) parts.push(`"${c.text}"`);
      return parts.join(" ");
    })
    .join("\n");

  const userContent = `Objetivo do tour: ${goal}\n\nElementos da página:\n${list}`;

  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userContent },
    ],
    // Structured outputs: guarantees the JSON validates against the schema.
    response_format: {
      type: "json_schema",
      json_schema: { name: "tour", strict: true, schema: SCHEMA },
    },
  });

  const message = res.choices[0]?.message;
  if (message?.refusal) {
    throw new Error(`A IA recusou a solicitação: ${message.refusal}`);
  }
  const content = message?.content;
  if (!content) {
    throw new Error("A IA não retornou um tour.");
  }
  const parsed = JSON.parse(content) as { steps?: StepPlan[] };
  if (!parsed.steps || parsed.steps.length === 0) {
    throw new Error("A IA retornou um tour vazio.");
  }
  return parsed.steps;
}
