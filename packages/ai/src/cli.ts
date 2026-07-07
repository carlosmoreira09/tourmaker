import { Command } from "commander";
import { resolve } from "node:path";
import { generate } from "./generate";
import { DEFAULT_MODEL } from "./ai";

interface GenerateFlags {
  prompt: string;
  url: string;
  route: string;
  id: string;
  out?: string;
  headed?: boolean;
  model: string;
}

const program = new Command();

program
  .name("tourmaker")
  .description("Gera tours do TourMaker com IA analisando seu app rodando (dev-time).")
  .version("0.1.0");

program
  .command("generate")
  .description("Analisa seu app rodando e gera um arquivo de tour tipado.")
  .requiredOption("-p, --prompt <texto>", "objetivo do tour em linguagem natural")
  .option("-u, --url <url>", "URL base do app", "http://localhost:3000")
  .option("-r, --route <rota>", "rota a analisar", "/")
  .option("-i, --id <id>", "id do tour", "onboarding")
  .option("-o, --out <arquivo>", "arquivo de saída (default: tours/<id>.tour.ts)")
  .option("-m, --model <modelo>", "modelo da OpenAI", DEFAULT_MODEL)
  .option("--headed", "mostrar o navegador durante a análise", false)
  .action(async (flags: GenerateFlags) => {
    const out = flags.out ?? `tours/${flags.id}.tour.ts`;
    try {
      await generate({
        url: flags.url,
        route: flags.route,
        prompt: flags.prompt,
        id: flags.id,
        out: resolve(process.cwd(), out),
        headed: Boolean(flags.headed),
        model: flags.model,
      });
    } catch (err) {
      console.error("✗", err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program.parseAsync();
