// Server-Sent Events stream for all rooms
// Runtime must be Node to preserve global memory between requests.
export const runtime = "nodejs";

type Msg = { room: string; text: string; me: string; ts: number };

// ---- Global registries (persist across hot reloads in dev) ----
const g = globalThis as unknown as {
  __sse_clients?: Set<ReadableStreamDefaultController<Uint8Array>>;
  __sse_history?: Msg[];
};
g.__sse_clients ??= new Set();
g.__sse_history ??= []; // optional: last ~100 messages
const clients = g.__sse_clients;
const history = g.__sse_history;

const enc = new TextEncoder();
const sse = (event: string, data: any) =>
  enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

export async function GET() {
  // Create a readable stream for this client
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Register client
      clients.add(controller);

      // Send a hello + recent history so newcomers see something
      controller.enqueue(sse("ping", { ok: true }));

      // Replay up to 100 last messages (optional)
      for (const m of history) controller.enqueue(sse("message", m));

      // Keep-alive pings (important for proxies)
      const iv = setInterval(() => {
        try {
          controller.enqueue(sse("ping", { t: Date.now() }));
        } catch {
          /* ignore */
        }
      }, 15000);

      // Cleanup when client disconnects
      // (called if the connection is closed by the browser)
      (controller as any)._iv = iv;
    },
    cancel(reason) {
      // Remove and cleanup
      clients.delete(this as any);
      try {
        // @ts-ignore
        const iv = (this as any)._iv as NodeJS.Timer | undefined;
        if (iv) clearInterval(iv);
      } catch {}
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Helpful for some hosts/CDNs:
      "X-Accel-Buffering": "no",
    },
  });
}

// Helper used by /send to push to all connected clients
export function broadcastMessage(msg: Msg) {
  // keep small rolling history
  history.push(msg);
  if (history.length > 100) history.shift();

  for (const c of clients) {
    try {
      c.enqueue(sse("message", msg));
    } catch {
      clients.delete(c);
    }
  }
}
