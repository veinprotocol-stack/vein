export const runtime = "edge";
export const dynamic = "force-dynamic";

// Edge runtime provides WebSocketPair + server.accept()
declare const WebSocketPair: { new (): [WebSocket, WebSocket] };
type ServerSocket = WebSocket & { accept: () => void };

// persist rooms across requests on the same worker
const g = globalThis as unknown as { __vein_rooms?: Map<string, Set<WebSocket>> };
const rooms = g.__vein_rooms ?? new Map<string, Set<WebSocket>>();
g.__vein_rooms = rooms;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room") || "global";

  const pair = new WebSocketPair();
  const client = pair[0] as WebSocket;
  const server = pair[1] as ServerSocket;

  // accept the server end (Edge API)
  server.accept();

  if (!rooms.has(room)) rooms.set(room, new Set());
  const set = rooms.get(room)!;
  set.add(server);

  server.addEventListener("message", (e: MessageEvent) => {
    for (const ws of set) {
      try {
        ws !== server && ws.readyState === ws.OPEN && ws.send(String(e.data));
      } catch {
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

  return new Response(null, { status: 101, webSocket: client });
}
