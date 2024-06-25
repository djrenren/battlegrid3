const cache = caches.open("casl");
export async function store(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashHex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const url = new URL(`${document.baseURI}/resource/${hashHex}`);
  const req = new Request(url, {});
  (await cache).put(
    req,
    new Response(arrayBuffer, {
      headers: {
        "Content-Type": file.type,
      },
    }),
  );
  return url.toString();
}
