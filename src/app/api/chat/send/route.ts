// Receives { room, text, me, ts } and broadcasts to all SSE clients.
export const runtime = "nodejs";

type Msg = { room: string; text: string; me: string; ts: number };

// Import the broadcast helper from the stream route file
// (node runtime shares module state; relative path is important)
import { broadcastMessage } from "../stream/route";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Msg>;

    const msg: Msg = {
      room: String(body.room ?? "global"),
      text: String(body.text ?? "").slice(0, 2000),
      me: String(body.me ?? "guest").slice(0, 64),
      ts: Number(body.ts) || Date.now(),
    };

    if (!msg.text.trim()) {
      return new Response(JSON.stringify({ ok: false, error: "empty" }), {
        status: 400,
      });
    }

    broadcastMessage(msg);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "bad_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
