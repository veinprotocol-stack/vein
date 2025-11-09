// src/app/api/chat/stream/route.ts
import type { NextRequest } from "next/server";

export const runtime = "nodejs"; // keep Node timers & SSE

// ---- very small in-memory SSE hub ----
type Client = {
  id: number;
  enqueue: (chunk: string) => void;
  // cross-env safe timer type
  ping?: ReturnType<typeof setInterval>;
};

const clients: Client[] =
  (globalThis as any).__VEIN_SSE_CLIENTS__ ?? ((globalThis as any).__VEIN_SSE_CLIENTS__ = []);

// broadcast helper
function pushAll(chunk: string) {
  for (const c of clients) {
    try {
      c.enqueue(chunk);
    } catch {
      // ignore broken pipes; cleanup happens on cancel
    }
  }
}

// ---- GET: open SSE stream ----
export async function GET(_req: NextRequest) {
  const id = Date.now() + Math.random();

  const stream = new ReadableStream<string>({
    start(controller) {
      const enqueue = (chunk: string) => controller.enqueue(chunk);

      // register client
      const client: Client = { id, enqueue };
      clients.push(client);

      // initial hello
      enqueue(`event: open\ndata: "ok"\n\n`);

      // keep-alive ping every 20s
      client.ping = setInterval(() => {
        enqueue(`event: ping\ndata: "1"\n\n`);
      }, 20000);
    },
    cancel() {
      // remove client & clear ping
      const idx = clients.findIndex((c) => c.id === id);
      if (idx !== -1) {
        const [c] = clients.splice(idx, 1);
        if (c?.ping) clearInterval(c.ping);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // avoids proxies buffering
      "X-Accel-Buffering": "no",
    },
  });
}

// ---- POST: push a message ----
// body: { room: string; text: string; me?: string }
export async function POST(req: NextRequest) {
  try {
    const { room, text, me } = (await req.json()) as {
      room: string;
      text: string;
      me?: string;
    };

    // stamp on server to avoid "Invalid Date" on clients
    const payload = JSON.stringify({ room, text, me, ts: Date.now() });
    pushAll(`event: message\ndata: ${payload}\n\n`);

    return Response.json({ ok: true });
  } catch (e) {
    return new Response("bad request", { status: 400 });
  }
}
