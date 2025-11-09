// src/app/api/ws/route.ts
export const runtime = "edge";
export const dynamic = "force-dynamic";

// ---- minimal types so we don't need ts-expect-error
declare const WebSocketPair: { new (): [WebSocket, WebSocket] };

// keep rooms across invocations on the same edge worker
const g = globalThis as unknown as {
  __vein_rooms?: Map<string, Set<WebSocket>>;
};
const rooms: Map<string, Set<WebSocket>> = g.__vein_rooms ?? new Map();
g.__vein_rooms = rooms;

export async function GET(req: Request) {
  // room is optional; default to "global"
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room") || "global";

  // Edge API
  const pair = new WebSocketPair();
  const client = pair[0] as WebSocket;
  const server = pair[1] as WebSocket;

  // accept the server end
  server.accept();

  if (!rooms.has(room)) rooms.set(room, new Set());
  const set = rooms.get(room)!;
  set.add(server);

  // basic echo/broadcast
  server.addEventListener("message", (e: MessageEvent) => {
    for (const ws of set) {
      try {
        ws !== server && ws.readyState === ws.OPEN && ws.send(String(e.data));
      } catch {
        // drop bad sockets
        set.delete(ws);
        try { ws.close(); } catch {}
      }
    }
  });

  const cleanup = () => {
    set.delete(server);
    try { server.close(); } catch {}
  };

  server.addEventListener("close", cleanup);
  server.addEventListener("error", cleanup);

  // hand back the client end to the browser
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
