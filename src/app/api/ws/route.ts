// src/app/api/ws/route.ts
export const runtime = "edge";
export const dynamic = "force-dynamic"; // don't pre-render

const rooms = new Map<string, Set<WebSocket>>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room") || "global";

  // @ts-expect-error Edge runtime API
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];
  // @ts-expect-error Edge runtime API
  server.accept();

  if (!rooms.has(room)) rooms.set(room, new Set());
  const peers = rooms.get(room)!;
  peers.add(server);

  server.addEventListener("message", (ev: MessageEvent) => {
    if (typeof ev.data !== "string") return;
    for (const ws of peers) {
      try { ws.send(ev.data); } catch {}
    }
  });

  const cleanup = () => {
    peers.delete(server);
    if (peers.size === 0) rooms.delete(room);
    try { /* @ts-expect-error */ server.close?.(); } catch {}
  };
  server.addEventListener("close", cleanup);
  server.addEventListener("error", cleanup);

  return new Response(null, { status: 101, webSocket: client });
}
