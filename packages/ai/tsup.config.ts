import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  platform: "node",
  target: "node18",
  clean: true,
  sourcemap: true,
  dts: false,
  // Keep heavy/native deps out of the bundle; resolved from node_modules at runtime.
  external: ["playwright", "openai", "@tourmaker/core", "commander"],
  banner: { js: "#!/usr/bin/env node" },
});
