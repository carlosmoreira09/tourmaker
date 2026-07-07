import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Tour } from "@tourmaker/core";

function toCamel(id: string): string {
  const camel = id
    .replace(/[-_ ]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
  return camel.charAt(0).toLowerCase() + camel.slice(1) || "generated";
}

/** Render a Tour as a typed `.tour.ts` source file. */
export function renderTourFile(tour: Tour): string {
  const steps = tour.steps
    .map((s) => {
      const lines: string[] = [];
      if (s.target) lines.push(`    target: ${JSON.stringify(s.target)},`);
      if (s.title) lines.push(`    title: ${JSON.stringify(s.title)},`);
      lines.push(`    content: ${JSON.stringify(s.content)},`);
      if (s.placement) lines.push(`    placement: ${JSON.stringify(s.placement)},`);
      return `  {\n${lines.join("\n")}\n  },`;
    })
    .join("\n");

  return (
    `import type { Tour } from "@tourmaker/core";\n\n` +
    `export const ${toCamel(tour.id)}Tour: Tour = {\n` +
    `  id: ${JSON.stringify(tour.id)},\n` +
    `  schemaVersion: ${tour.schemaVersion ?? 1},\n` +
    `  steps: [\n${steps}\n  ],\n};\n`
  );
}

export async function writeTourFile(tour: Tour, outPath: string): Promise<void> {
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, renderTourFile(tour), "utf8");
}
