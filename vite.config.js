import template from "rollup-plugin-html-literals";
import analyze from "rollup-plugin-analyzer";
import fs from "node:fs";
import { defineConfig } from "vite";

const base = process.env.BASE_URL ?? "/";

export default defineConfig({
  base,
  build: {
    target: "esnext",
    modulePreload: false,
  },
  plugins: [
    template(),
    analyze({
      writeTo: (stats) => {
        fs.writeFileSync("dist/stats.html", stats);
      },
    }),
  ],
});
