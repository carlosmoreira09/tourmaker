import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom"],
  // Every module in this package is client-side. Ensure the directive lands at
  // the top of the bundle so Next's RSC compiler treats it as a client module.
  banner: { js: '"use client";' },
});
