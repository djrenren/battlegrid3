import type { Plugin } from "esbuild";
import { writeFileSync } from "node:fs";
import * as path from "node:path";

export function metaFileWriter(): Plugin {
  return {
    name: "metafile-writer",
    setup(build) {
      let outdir = build.initialOptions.outdir;
      if (!outdir) {
        throw new Error("outdir is required");
      }
      build.onEnd((result) => {
        if (result.errors.length === 0) {
          writeFileSync(path.join(outdir, "metafile.json"), JSON.stringify(result.metafile));
        }
      });
    },
  };
}
