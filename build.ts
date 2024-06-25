/// <reference types="node" />

import { context } from "esbuild";
import { buildOutput } from "./plugins/build-output.js";
import { metaFileWriter } from "./plugins/metafile-writer.js";
import { fixIndexHtml } from "./plugins/fix-index-html.js";

const DIST = "dist";
const define = {
  IS_DEV: "" + (process.env.NODE_ENV !== "production"),
};

const src = await context({
  platform: "browser",
  target: "esnext",
  entryPoints: ["src/index.ts", "index.html"],
  entryNames: "[dir]/[name]-[hash]",
  define,
  outdir: DIST,
  bundle: true,
  minify: true,
  sourcemap: true,
  metafile: true,
  plugins: [metaFileWriter(), buildOutput(), fixIndexHtml({ main: "src/index.ts" })],
  loader: {
    ".include.html": "text",
    ".include.css": "text",
    ".html": "copy",
  },
});

const sw = await context({
  platform: "browser",
  target: "esnext",
  format: "iife", // for service worker
  entryPoints: ["./service-worker.ts"],
  define,
  outdir: DIST,
  bundle: true,
  minify: true,
  sourcemap: true,
  metafile: true,
});

if (process.argv.includes("--watch")) {
  await src.serve({
    servedir: DIST,
    port: 8080,
  });

  await Promise.race([src.watch(), sw.watch()]);
} else {
  await Promise.all([src.rebuild(), sw.rebuild()]);
  sw.dispose();
  src.dispose();
}
