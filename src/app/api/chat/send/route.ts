// src/app/api/chat/send/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { broadcastMessage } from "../stream/route";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const msg = {
      t: Date.now(),
      text: body?.text ?? "",
      user: body?.user ?? "anon",
    };

    broadcastMessage(msg);

    return Response.json({ ok: true });
  } catch (e) {
    return new Response("bad request", { status: 400 });
  }
}
