# Contributing to TourMaker

Thanks for your interest in improving TourMaker! This guide gets you from clone
to pull request.

## Prerequisites

- **Node.js 22+**
- **pnpm 9+** (`npm i -g pnpm` or `corepack enable`)

## Setup

```bash
git clone https://github.com/carlosmoreira09/tourmaker.git
cd tourmaker
pnpm install
pnpm build          # build all packages (core → react → ai → playground)
```

## Project layout

```
packages/
  core/       @tourmaker/core   framework-agnostic engine, schema & positioning (pure TS)
  react/      @tourmaker/react   React bindings + zero-config default UI
  ai/         @tourmaker/ai      dev-time authoring CLI (Playwright + OpenAI)
apps/
  playground/                    Next 16 App Router demo / manual test harness
```

The **core** package must stay framework-agnostic (no React imports) — it's what
lets future Vue/Svelte bindings reuse the same logic. Keep tour logic in `core`
and only the React glue in `react`.

## Development workflow

```bash
pnpm dev            # tsup --watch on packages + next dev on the playground
pnpm playground     # just the playground at http://localhost:3100
pnpm test           # engine unit tests (Vitest, in @tourmaker/core)
```

For live library work, run `pnpm dev` and edit under `packages/*/src` — changes
flow into the playground automatically.

### Before opening a PR

Run the same checks CI runs:

```bash
pnpm build
pnpm --filter @tourmaker/ai exec tsc -p tsconfig.json   # typecheck the CLI
pnpm test
```

All three must pass. Add or update tests in `packages/core/src/__tests__` when you
change engine behavior.

## Coding conventions

- **TypeScript, strict.** No `any` unless truly unavoidable (and commented).
- Match the surrounding style — the codebase favors small, focused modules with a
  single clear responsibility.
- Keep the **default UI** overridable: style via CSS variables / `className`, never
  hard-code values that consumers can't change.
- The **runtime stays deterministic** — no network calls or AI at runtime. AI lives
  only in `@tourmaker/ai` (dev-time).
- Comment the *why*, not the *what*.

## Commits & pull requests

- Use clear, imperative commit messages (Conventional Commits welcome:
  `feat:`, `fix:`, `docs:`, `chore:`…).
- One logical change per PR. Describe what and why; link any related issue.
- Update the README / package docs when you change public API.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, and a minimal
reproduction (a CodeSandbox or a few lines is ideal). Include your React/Next
versions.

## Security

Never commit secrets (API keys, tokens). If you find a security issue, please open
a private report rather than a public issue.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).
