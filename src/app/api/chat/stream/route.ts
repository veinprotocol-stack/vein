// src/app/api/chat/stream/route.ts
// Node runtime (so we can keep a process-level subscriber set)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Client = {
  id: number;
  enqueue: (chunk: Uint8Array) => void;
};

// Persist subscribers across route invocations in the same lambda/process
const globalAny = global as any;
const subscribers: Set<Client> = globalAny.__vein_chat_subs ?? new Set<Client>();
globalAny.__vein_chat_subs = subscribers;

const enc = new TextEncoder();

/** Broadcast a message to all connected SSE clients */
export function broadcastMessage(payload: unknown) {
  const bytes = enc.encode(`data: ${JSON.stringify(payload)}\n\n`);
  for (const sub of Array.from(subscribers)) {
    try {
      sub.enqueue(bytes);
    } catch {
      // If enqueue fails (client closed), drop it
      subscribers.delete(sub);
    }
  }
}

/** GET /api/chat/stream  →  Server-Sent Events stream */
export async function GET(req: Request) {
  const id = Date.now() + Math.random();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // add client
      subscribers.add({
        id,
        enqueue: (chunk) => controller.enqueue(chunk),
      });

      // initial comment (keeps some proxies happy)
      controller.enqueue(enc.encode(`: connected ${id}\n\n`));

      // remove when client disconnects
      const abort = () => {
        subscribers.forEach((c) => c.id === id && subscribers.delete(c));
        try {
          controller.close();
        } catch {}
      };
      // @ts-ignore - Request in Next has a signal
      req.signal?.addEventListener?.("abort", abort);
    },
    cancel() {
      subscribers.forEach((c) => c.id === id && subscribers.delete(c));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // CORS (optional, helpful during local dev)
      "Access-Control-Allow-Origin": "*",
    },
  });
}
