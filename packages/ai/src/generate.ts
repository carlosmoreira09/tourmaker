import { chromium, type Page } from "playwright";
import { SCHEMA_VERSION, type Tour, type TourStep } from "@tourmaker/core";
import { collectCandidates } from "./distill";
import { planTour } from "./ai";
import { writeTourFile } from "./writer";
import type { Candidate, GenerateOptions } from "./types";

async function evaluateWithRetry(page: Page, attempts: number): Promise<Candidate[]> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      await page.waitForLoadState("domcontentloaded");
      return await page.evaluate(collectCandidates, 120);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!/context was destroyed|navigation/i.test(msg)) throw err;
      await page.waitForTimeout(1000);
    }
  }
  throw lastErr;
}

export async function generate(opts: GenerateOptions): Promise<void> {
  const target = new URL(opts.route, opts.url).toString();
  const browser = await chromium.launch({ headless: !opts.headed });

  try {
    const page = await browser.newPage();
    console.log(`→ Abrindo ${target}`);
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Let client-rendered UI (React/Next) mount and settle before distilling.
    await page.waitForTimeout(2000);

    // Dev servers (Next/Turbopack HMR) can trigger a navigation that destroys the
    // evaluate context mid-call — retry a few times before giving up.
    const candidates = await evaluateWithRetry(page, 3);
    console.log(`→ ${candidates.length} elementos candidatos encontrados`);
    if (candidates.length === 0) {
      throw new Error(
        "Nenhum elemento significativo encontrado. O app está rodando nessa URL/rota?",
      );
    }

    console.log(`→ Pedindo à IA (${opts.model}) para desenhar o tour…`);
    const plan = await planTour(candidates, opts.prompt, opts.model);
    console.log(`→ IA propôs ${plan.length} passo(s)`);

    const steps: TourStep[] = [];
    for (const p of plan) {
      // Centered step (welcome) — no anchor.
      if (p.elementIndex < 0) {
        steps.push({ title: p.title, content: p.content });
        continue;
      }
      const cand = candidates[p.elementIndex];
      if (!cand) {
        console.warn(`  ⚠ index inválido (${p.elementIndex}) — pulando "${p.title}"`);
        continue;
      }
      // Verify the resilient selector still resolves uniquely.
      const count = await page.locator(cand.selector).count();
      if (count !== 1) {
        console.warn(
          `  ⚠ seletor não único (${count}) para "${p.title}" — pulando`,
        );
        continue;
      }
      steps.push({
        target: cand.selector,
        title: p.title,
        content: p.content,
        placement: p.placement,
      });
    }

    if (steps.length === 0) {
      throw new Error("Nenhum passo válido restou após a verificação de seletores.");
    }

    const tour: Tour = { id: opts.id, schemaVersion: SCHEMA_VERSION, steps };
    await writeTourFile(tour, opts.out);
    console.log(`✓ Tour salvo em ${opts.out} (${steps.length} passo(s))`);
  } finally {
    await browser.close();
  }
}
