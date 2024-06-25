/// <reference lib="WebWorker"/>

import { service, type WorkerService } from "../ui/util/worker-rpc.js";

const cache = await caches.open("casl");
const worker = {
  async init() {
    console.log("Worker initialized");
  },

  async store(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashHex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const url = `${location.origin}/resource/${hashHex}`;
    const req = new Request(url, {});
    cache.put(
      req,
      new Response(arrayBuffer, {
        headers: {
          "Content-Type": file.type,
        },
      }),
    );
    return url;
  },
};

export type CASLWorker = typeof worker;

service(worker);
