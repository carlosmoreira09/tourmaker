# @tourmaker/ai

AI authoring CLI for TourMaker. **Dev-time only** — it analyzes your running app
and generates a typed `Tour` file. The runtime that ships to production stays
100% deterministic and API-free.

## How it works

```
npx tourmaker generate --prompt "onboarding do dashboard" --route /dashboard
```

1. Launches a headless browser (Playwright) and opens `--url` + `--route`.
2. **Distills the live DOM** into the meaningful, visible elements, each with a
   resilient CSS selector already verified to resolve uniquely.
3. Sends that list + your natural-language goal to **OpenAI (`gpt-4o-mini` by
   default)**, which returns ordered steps (which element, title, copy,
   placement) via strict structured outputs.
4. **Verifies** every selector still resolves uniquely on the page.
5. Writes a typed `tours/<id>.tour.ts` importing `Tour` from `@tourmaker/core`.

It never edits your source files — it only reads the rendered DOM.

## Requirements

- Your app running locally (e.g. `pnpm dev`).
- `OPENAI_API_KEY` in the environment.
- Playwright's Chromium: `npx playwright install chromium` (first run only).

## Usage

```bash
export OPENAI_API_KEY=sk-...
npx tourmaker generate \
  --prompt "tour de boas-vindas destacando busca, perfil e configurações" \
  --url http://localhost:3000 \
  --route / \
  --id onboarding
```

| Flag | Default | Description |
|---|---|---|
| `-p, --prompt` | — (required) | Objetivo do tour em linguagem natural. |
| `-u, --url` | `http://localhost:3000` | URL base do app. |
| `-r, --route` | `/` | Rota a analisar. |
| `-i, --id` | `onboarding` | Id do tour gerado. |
| `-o, --out` | `tours/<id>.tour.ts` | Arquivo de saída. |
| `-m, --model` | `gpt-4o-mini` | Modelo da OpenAI (ex: `gpt-4o` para copy melhor). |
| `--headed` | `false` | Mostrar o navegador durante a análise. |

Then wire the generated tour into your app:

```tsx
import { onboardingTour } from "./tours/onboarding.tour";
<TourProvider tours={[onboardingTour]}>{children}</TourProvider>
```
