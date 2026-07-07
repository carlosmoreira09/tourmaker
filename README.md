<div align="center">

# 🧭 TourMaker

**Tours de produto interativos — robustos, leves e plug-and-play — para React, Next.js e além.**

A IA te ajuda a **criar** os tours em dev-time. O **runtime que vai pra produção é 100% determinístico, leve e sem chamadas de API.**

</div>

---

## Índice

- [Por que TourMaker](#por-que-tourmaker)
- [Compatibilidade](#compatibilidade)
- [Instalação](#instalação)
- [Começando (5 minutos)](#começando-5-minutos)
  - [Next.js — App Router](#nextjs--app-router)
  - [Next.js — Pages Router](#nextjs--pages-router)
  - [React puro (Vite / CRA)](#react-puro-vite--cra)
- [Definindo um tour](#definindo-um-tour)
- [Controlando o tour (`useTour`)](#controlando-o-tour-usetour)
- [Temas (claro / escuro / auto)](#temas-claro--escuro--auto)
- [Customizando o visual](#customizando-o-visual)
- [Eventos (persistência e analytics)](#eventos-persistência-e-analytics)
- [Referência da API](#referência-da-api)
- [Como funciona por dentro](#como-funciona-por-dentro)
- [Desenvolvimento local](#desenvolvimento-local)
- [Roadmap](#roadmap)

---

## Por que TourMaker

- 🎯 **Zero-config visual** — a UI padrão já vem bonita e injeta o próprio CSS. Não precisa configurar Tailwind nem importar folha de estilo.
- 🪶 **Leve e determinístico** — nada de IA ou rede em runtime. Só a lógica do tour.
- 🧩 **Headless por baixo** — sobrescreva 100% da UI, ou só troque variáveis CSS.
- ♿ **Acessível** — navegação por teclado (`←` `→` `Esc`), `role="dialog"`, `aria-modal`.
- 🔌 **Compatível** — React 18/19, Next App **e** Pages Router, Vite/CRA. SSR-safe.
- 🧠 **Pronto pra IA** — o formato de tour é serializável; é exatamente o que o CLI de IA (Fase 2) vai gerar.

---

## Compatibilidade

| Ambiente | Suporte |
|---|---|
| React | **18 e 19** (`peerDependency: react >=18`) |
| Next.js | **16** — App Router **e** Pages Router |
| React puro | Vite, CRA, qualquer bundler |
| SSR | ✅ seguro (nenhum acesso ao DOM no import) |
| Estilo | CSS próprio auto-injetado — **não exige Tailwind** no seu projeto |

---

## Instalação

O TourMaker é um monorepo com dois pacotes públicos:

- **`@tourmaker/react`** — o que você instala (bindings + UI). Já traz `@tourmaker/core` como dependência.
- **`@tourmaker/core`** — o motor agnóstico de framework (instalado automaticamente).

### Via npm (recomendado, após publicar)

```bash
npm install @tourmaker/react
# ou
pnpm add @tourmaker/react
# ou
yarn add @tourmaker/react
```

> `@tourmaker/core` vem junto automaticamente — você não precisa instalá-lo.

### Enquanto não está publicado no npm

Como é um monorepo, instalar um subpacote direto do GitHub não é trivial. Dois caminhos:

**A) Publicar no npm (ou registry privado)** — recomendado. Ao rodar `pnpm publish`, o pnpm troca o `workspace:*` pela versão real automaticamente, então o consumidor recebe `core` + `react` normalmente.

```bash
# dentro do repo TourMaker
pnpm build
pnpm --filter @tourmaker/core publish --access public
pnpm --filter @tourmaker/react publish --access public
```

**B) Tarball local (pra testar sem publicar)**

Use o `pnpm pack` (não o `npm pack`) — ele troca o `workspace:*` pela versão real no tarball.

```bash
# dentro do repo TourMaker
pnpm build
(cd packages/core  && pnpm pack)   # gera tourmaker-core-0.1.0.tgz
(cd packages/react && pnpm pack)   # gera tourmaker-react-0.1.0.tgz

# no seu projeto consumidor, instale os dois tarballs
npm install /caminho/tourmaker-core-0.1.0.tgz /caminho/tourmaker-react-0.1.0.tgz
```

---

## Começando (5 minutos)

Todo consumo segue o mesmo padrão em 3 passos:

1. Envolva sua app com `<TourProvider>` e passe seus tours.
2. Marque os elementos-alvo com um seletor estável (ex.: `id`).
3. Chame `start("id-do-tour")` de qualquer lugar via `useTour()`.

### Next.js — App Router

O `TourProvider` é um Client Component, então isole-o num arquivo `"use client"`.

```tsx
// app/providers.tsx
"use client";

import { TourProvider, type Tour } from "@tourmaker/react";

const tours: Tour[] = [
  {
    id: "onboarding",
    steps: [
      { title: "Bem-vindo 👋", content: "Um passo centralizado, sem âncora." },
      { target: "#search", title: "Busca", content: "Encontre qualquer coisa aqui." },
      { target: "#profile", title: "Perfil", content: "Sua conta fica neste menu." },
    ],
  },
];

export function Providers({ children }: { children: React.ReactNode }) {
  return <TourProvider tours={tours}>{children}</TourProvider>;
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```tsx
// qualquer componente client abaixo do provider
"use client";
import { useTour } from "@tourmaker/react";

export function StartButton() {
  const { start } = useTour();
  return <button onClick={() => start("onboarding")}>Iniciar tour ▶</button>;
}
```

### Next.js — Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { TourProvider, type Tour } from "@tourmaker/react";

const tours: Tour[] = [
  { id: "onboarding", steps: [{ target: "#search", content: "Busque aqui." }] },
];

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TourProvider tours={tours}>
      <Component {...pageProps} />
    </TourProvider>
  );
}
```

### React puro (Vite / CRA)

```tsx
// main.tsx
import { createRoot } from "react-dom/client";
import { TourProvider, type Tour } from "@tourmaker/react";
import App from "./App";

const tours: Tour[] = [
  { id: "onboarding", steps: [{ target: "#search", content: "Busque aqui." }] },
];

createRoot(document.getElementById("root")!).render(
  <TourProvider tours={tours}>
    <App />
  </TourProvider>,
);
```

---

## Definindo um tour

Um tour é um objeto serializável. Cada passo aponta para um elemento (via seletor CSS) ou é centralizado (sem `target`).

```ts
import type { Tour } from "@tourmaker/react";

const tour: Tour = {
  id: "onboarding",
  // opções válidas para o tour inteiro (todas opcionais):
  options: {
    waitForTarget: 3000,        // ms de espera por um alvo assíncrono
    closeOnEscape: true,        // fechar com Esc
    closeOnOverlayClick: false, // fechar clicando no fundo escurecido
    spotlightPadding: 8,        // respiro (px) ao redor do elemento destacado
  },
  steps: [
    {
      // sem `target` => passo centralizado (tela de boas-vindas)
      title: "Bem-vindo 👋",
      content: "Vamos dar uma volta rápida pelo app.",
    },
    {
      target: "#search",            // seletor CSS do alvo
      title: "Busca",
      content: "Encontre qualquer coisa por aqui.",
      placement: "bottom",          // top | bottom | left | right | *-start | *-end | auto
    },
    {
      target: "#settings",
      content: "Ajuste tudo do seu jeito.",
      disableInteraction: true,     // bloqueia o resto da página neste passo
      waitForTarget: 5000,          // override por passo
      onShow: () => console.log("mostrou settings"),
      onNext: () => console.log("saindo de settings"),
    },
  ],
};
```

**Dica de robustez:** use seletores estáveis (`id`, `data-tour="..."`) em vez de classes utilitárias que mudam. Se um alvo não for encontrado dentro do `waitForTarget`, o passo é **pulado automaticamente** e um evento `targetNotFound` é emitido — um seletor quebrado nunca trava o tour inteiro.

---

## Controlando o tour (`useTour`)

Qualquer componente abaixo do provider pode ler o estado e dirigir o tour.

```tsx
"use client";
import { useTour } from "@tourmaker/react";

export function TourControls() {
  const { start, next, prev, skip, stop, goTo, state, isActive } = useTour();

  return (
    <div>
      <button onClick={() => start("onboarding")}>Iniciar</button>
      {isActive && (
        <>
          <span>Passo {state.stepIndex + 1} de {state.totalSteps}</span>
          <button onClick={prev}>Voltar</button>
          <button onClick={next}>Avançar</button>
          <button onClick={skip}>Pular</button>
        </>
      )}
    </div>
  );
}
```

| Método | O que faz |
|---|---|
| `start(id)` | Inicia o tour com esse `id` a partir do passo 0. |
| `next()` | Avança (completa o tour no último passo). |
| `prev()` | Volta um passo. |
| `goTo(index)` | Pula direto para um passo. |
| `skip()` | Encerra o tour (emite `skip`). |
| `stop()` | Encerra silenciosamente (emite `stop`). |
| `state` | `{ status, tourId, stepIndex, step, totalSteps }`. |
| `isActive` | `true` quando há um passo na tela. |

**Atalhos de teclado** (automáticos durante o tour): `→` avança · `←` volta · `Esc` fecha (se `closeOnEscape`).

---

## Temas (claro / escuro / auto)

Prop `theme` no `TourProvider`:

```tsx
<TourProvider theme="dark"  tours={tours}>{children}</TourProvider>  {/* padrão: card escuro */}
<TourProvider theme="light" tours={tours}>{children}</TourProvider>  {/* card branco */}
<TourProvider theme="auto"  tours={tours}>{children}</TourProvider>  {/* segue o SO */}
```

### Tema totalmente customizado (variáveis CSS)

O tema só troca variáveis CSS. Sobrescreva qualquer uma no seu próprio CSS para casar com a marca do seu app:

```css
.tm-root {
  --tm-accent: #2563eb;          /* cor dos botões primários */
  --tm-accent-contrast: #ffffff; /* texto sobre o accent */
  --tm-card-bg: #0f172a;         /* fundo do card */
  --tm-card-fg: #f8fafc;         /* texto do card */
  --tm-muted: #94a3b8;           /* texto secundário */
  --tm-overlay: rgba(2, 6, 23, 0.6); /* escurecimento do fundo */
  --tm-radius: 14px;             /* arredondamento */
  --tm-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
```

> Prefere trazer seu próprio CSS do zero? Use `<TourProvider injectStyles={false}>` e estilize as classes `.tm-*` você mesmo.

---

## Customizando o visual

Para ir além das variáveis, substitua o componente de tooltip inteiro pelo slot `components.Tooltip`. Você recebe tudo o que precisa via props.

```tsx
"use client";
import { TourProvider, type TooltipRenderProps } from "@tourmaker/react";

function MyTooltip({ step, index, total, onNext, onPrev, onSkip, hasNext, hasPrev }: TooltipRenderProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-xl">
      {step.title && <h3 className="font-bold">{step.title}</h3>}
      <p>{step.content}</p>
      <div className="mt-3 flex justify-between">
        <span>{index + 1}/{total}</span>
        <div className="flex gap-2">
          {hasPrev && <button onClick={onPrev}>Voltar</button>}
          <button onClick={onNext}>{hasNext ? "Avançar" : "Concluir"}</button>
          <button onClick={onSkip}>Pular</button>
        </div>
      </div>
    </div>
  );
}

<TourProvider tours={tours} components={{ Tooltip: MyTooltip }}>
  {children}
</TourProvider>
```

O overlay/spotlight continua sendo gerenciado pelo TourMaker; só o card é seu.

---

## Eventos (persistência e analytics)

Passe `onEvent` para observar o ciclo de vida do tour. É aqui que você **lembra quem já viu** um tour e **mede** conclusão/abandono.

```tsx
<TourProvider
  tours={tours}
  onEvent={(e) => {
    switch (e.type) {
      case "start":    /* e.tourId */ break;
      case "step":     /* e.tourId, e.stepIndex, e.step */ break;
      case "complete": /* tour concluído */ break;
      case "skip":     /* pulou em e.stepIndex */ break;
      case "stop":     /* encerrado via stop() */ break;
      case "targetNotFound": /* e.selector não encontrado */ break;
    }
  }}
>
  {children}
</TourProvider>
```

### Exemplo: mostrar o onboarding só uma vez

```tsx
"use client";
import { useEffect } from "react";
import { useTour } from "@tourmaker/react";

export function AutoOnboarding() {
  const { start } = useTour();
  useEffect(() => {
    if (!localStorage.getItem("seen:onboarding")) start("onboarding");
  }, [start]);
  return null;
}
```

```tsx
// e marque como visto ao concluir/pular:
<TourProvider
  tours={tours}
  onEvent={(e) => {
    if (e.type === "complete" || e.type === "skip") {
      localStorage.setItem(`seen:${e.tourId}`, "1");
    }
  }}
>
```

> Persistência, disparo por rota, versionamento e segmentação viram recursos de primeira classe na **Fase 3**. Até lá, o padrão acima resolve.

---

## Referência da API

### `<TourProvider>` — props

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `tours` | `Tour[]` | `[]` | Tours disponíveis para `start(id)`. |
| `theme` | `"dark" \| "light" \| "auto"` | `"dark"` | Tema da UI padrão. |
| `injectStyles` | `boolean` | `true` | Injeta o CSS padrão automaticamente. |
| `onEvent` | `(e: TourEvent) => void` | — | Observa eventos do ciclo de vida. |
| `components` | `{ Tooltip?: Component }` | — | Substitui a UI padrão. |

### `Tour`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único do tour. |
| `steps` | `TourStep[]` | Passos, em ordem. |
| `options` | `TourOptions` | Opções do tour (abaixo). |
| `schemaVersion` | `number` | Versão do schema (default `SCHEMA_VERSION`). |

### `TourStep`

| Campo | Tipo | Descrição |
|---|---|---|
| `target` | `string?` | Seletor CSS do alvo. Ausente = passo centralizado. |
| `title` | `string?` | Título do card. |
| `content` | `string` | Texto do passo (obrigatório). |
| `placement` | `Placement?` | Posição do tooltip. Default `bottom`. |
| `waitForTarget` | `number?` | ms de espera pelo alvo (override do tour). |
| `disableInteraction` | `boolean?` | Bloqueia a página fora do spotlight. |
| `onShow` / `onNext` / `onPrev` | `() => void` | Hooks do passo. |

### `TourOptions`

| Campo | Tipo | Default | Descrição |
|---|---|---|---|
| `waitForTarget` | `number` | `3000` | Espera padrão por alvos. |
| `closeOnEscape` | `boolean` | `true` | Fechar com Esc. |
| `closeOnOverlayClick` | `boolean` | `false` | Fechar clicando no fundo. |
| `spotlightPadding` | `number` | `8` | Respiro do spotlight (px). |

### `Placement`

`top` · `bottom` · `left` · `right` · `*-start` · `*-end` · `auto`

### `TourEvent`

`start` · `step` · `complete` · `skip` · `stop` · `targetNotFound` — veja os campos na seção [Eventos](#eventos-persistência-e-analytics).

---

## Gerando tours com IA (`@tourmaker/ai`)

O CLI analisa seu **app rodando** e gera um arquivo de tour tipado. É **dev-time**:
a IA só trabalha aqui — o runtime em produção continua determinístico e sem rede.

```bash
export OPENAI_API_KEY=sk-...
npx playwright install chromium   # só na primeira vez

npx tourmaker generate \
  --prompt "tour de boas-vindas destacando busca, perfil e configurações" \
  --url http://localhost:3000 --route / --id onboarding
```

O que ele faz: sobe o Playwright → abre `--url/--route` → **destila o DOM real** em
elementos com seletores resilientes (verificados como únicos) → a OpenAI
(`gpt-4o-mini` por padrão, saída estruturada) escolhe e escreve os passos → grava
`tours/onboarding.tour.ts`. **Não edita seus arquivos-fonte** — só lê o DOM.

Depois é só plugar:

```tsx
import { onboardingTour } from "./tours/onboarding.tour";
<TourProvider tours={[onboardingTour]}>{children}</TourProvider>
```

| Flag | Default | Descrição |
|---|---|---|
| `-p, --prompt` | — (obrigatório) | Objetivo do tour em linguagem natural. |
| `-u, --url` | `http://localhost:3000` | URL base do app. |
| `-r, --route` | `/` | Rota a analisar. |
| `-i, --id` | `onboarding` | Id do tour gerado. |
| `-o, --out` | `tours/<id>.tour.ts` | Arquivo de saída. |
| `-m, --model` | `gpt-4o-mini` | Modelo da OpenAI (`gpt-4o` p/ copy melhor). |
| `--headed` | `false` | Mostrar o navegador durante a análise. |

---

## Como funciona por dentro

```
@tourmaker/core   TS puro, ZERO React — máquina de estados, schema e posicionamento
       ▲
       │ depende
@tourmaker/react  <TourProvider>, useTour(), UI padrão (CSS auto-injetado)
```

O **core** não conhece React — é isso que permite futuros bindings `@tourmaker/vue`, `@tourmaker/svelte` reutilizarem exatamente a mesma lógica. O posicionamento usa **Floating UI** (`@floating-ui/dom`), e o spotlight é um recorte via `box-shadow`, então o elemento destacado continua clicável (ótimo para tours interativos).

---

## Desenvolvimento local

```bash
pnpm install
pnpm build                          # core → react → playground
pnpm --filter @tourmaker/core test  # testes do motor
pnpm playground                     # demo Next 16 em http://localhost:3100
pnpm dev                            # lib em watch (tsup) + next dev juntos
```

Estrutura:

```
packages/
  core/       @tourmaker/core   motor agnóstico
  react/      @tourmaker/react  bindings + UI
  ai/         @tourmaker/ai     CLI de autoria com IA (Playwright + Claude)
apps/
  playground/                   Next 16 App Router — demo/dev
```

---

## Roadmap

1. **Runtime core** — tours, spotlight, teclado, a11y, SSR-safe, temas. ✅ **Feito**
2. **AI authoring CLI** — gerar tours + seletores resilientes a partir de linguagem natural. ✅ **Feito**
3. **Persistência & controle** — lembrar quem viu, disparo por rota/evento, versionamento, segmentos.
4. **Onboarding suite + analytics** — checklists, modais, hotspots, funil de conversão.

---

<div align="center">
<sub>Feito com foco em ser <b>simples de usar</b> e <b>difícil de quebrar</b>.</sub>
</div>
