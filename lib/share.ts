import type { Report } from "./types";

/**
 * Partage sans base de données : le rapport est compressé puis placé dans le
 * fragment de l'URL (#r=...). Le fragment n'est jamais envoyé au serveur.
 */

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function pipe(bytes: Uint8Array, transform: CompressionStream | DecompressionStream) {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(transform);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function encodeReport(report: Report): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(report));
  if (typeof CompressionStream !== "undefined") {
    return "z." + toBase64Url(await pipe(raw, new CompressionStream("deflate-raw")));
  }
  return "j." + toBase64Url(raw);
}

export async function decodeReport(token: string): Promise<Report | null> {
  try {
    const kind = token.slice(0, 2);
    let bytes = fromBase64Url(token.slice(2));
    if (kind === "z.") bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
    else if (kind !== "j.") return null;
    const report = JSON.parse(new TextDecoder().decode(bytes));
    return report?.version === 1 ? (report as Report) : null;
  } catch {
    return null;
  }
}
