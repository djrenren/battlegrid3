import { formatMessages, type Plugin } from "esbuild";
import { promisify } from "util";

export function buildOutput(): Plugin {
  let count = 0;
  return {
    name: "build-output",
    setup(build) {
      const stdout = process.stdout;
      build.onEnd(async (result) => {
        // @ts-ignore
        await promisify(stdout.cursorTo.bind(stdout, 0, 0))();
        await promisify(stdout.clearScreenDown.bind(stdout))();

        const messages = (
          await Promise.all([
            formatMessages(result.errors, { kind: "error" }),
            formatMessages(result.warnings, { kind: "warning" }),
          ])
        ).flat();

        count++;

        if (messages.length === 0) {
          console.log(`Successfully built (x${count})`);
        } else {
          console.log(messages.join("\n"));
        }
      });
    },
  };
}
