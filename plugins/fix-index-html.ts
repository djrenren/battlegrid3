import type { Metafile, Plugin } from "esbuild";
import { writeFileSync } from "node:fs";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import * as path from "node:path";

type Args = {
  main: string;
};

// Normalize BASE_URL to always end in /
const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL.replace(/\/$/, "") + "/" : "/";

export function fixIndexHtml(args: Args): Plugin {
  return {
    name: "fix-index-html",
    setup(build) {
      const outdir = build.initialOptions.outdir;
      if (!outdir) {
        throw new Error("outdir is required");
      }
      build.onEnd(async (result) => {
        const metafile = result.metafile;
        if (!metafile) {
          throw new Error("metafile is required");
        }
        const outname = findOutputForInput(metafile, "index.html");
        const outmain = findOutputForInput(metafile, args.main);
        if (!outname) {
          throw new Error(`Could not find output for index.html`);
        }

        let content = (await readFile(outname)).toString();
        const localoutmain = outmain!.replace(`${outdir}/`, "");
        content = content.replaceAll(
          new RegExp(`src="/?${args.main}"`, "g"),
          `src="${localoutmain}"`,
        );
        content = content.replaceAll(`</head`, `<base href='${BASE_URL}'></head`);
        await Promise.all([writeFile(`${outdir}/index.html`, content), unlink(outname)]);
      });
    },
  };
}

const findOutputForInput = (metafile: Metafile, input: string) => {
  return Object.entries(metafile.outputs).find(([output, { inputs }]) => {
    return inputs[input] !== undefined;
  })?.[0];
};
