"use client";
import React from "react";

type Props = { room: string; me: string };

export default function ChatBox({ room, me }: Props) {
  const [msgs, setMsgs] = React.useState<any[]>([]);
  const [text, setText] = React.useState("");
  const [ready, setReady] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const es = new EventSource("/api/chat/stream");
    const onMsg = (ev: MessageEvent) => {
      try {
        const d = JSON.parse(ev.data);
        if (!d || d.room !== room) return;
        setMsgs((m) => [...m, d]);
      } catch {}
    };
    es.addEventListener("open", () => setReady(true));
    es.addEventListener("message", onMsg);
    es.addEventListener("error", () => setReady(false));
    return () => es.close();
  }, [room]);

  React.useEffect(() => {
    boxRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const t = text.trim();
    if (!t) return;
    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room, text: t, me, ts: Date.now() }),
    }).catch(() => {});
    setText("");
  }

  return (
    <div className="rounded-lg border border-line bg-bg/40 p-3 overflow-hidden">
      <div
        ref={boxRef}
        className="mb-2 h-40 overflow-auto rounded-md border border-line/70 bg-black/20 p-2 text-sm"
      >
        {msgs.length === 0 ? (
          <div className="text-text-dim">No messages yet.</div>
        ) : (
          msgs.map((m, i) => (
            <div key={i} className="leading-6 text-xs flex items-start justify-between gap-3">
              <div className="shrink min-w-0">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: `hsl(${(m.me?.length ?? 0) * 17 % 360} 70% 65%)`,
                    }}
                  />
                  <span className="text-accent">
                    {m.me ? `${m.me.slice(0, 4)}…${m.me.slice(-4)}` : "guest"}
                  </span>
                </span>
                <div className="mt-0.5 break-words">{m.text}</div>
              </div>
              <span className="text-text-dim whitespace-nowrap">
                {m.ts ? new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
            </div>
          ))
        )}
      </div>

      {/* INPUT ROW — prevents overflow */}
      <form
        className="mt-2 flex w-full items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message…"
          className="h-10 flex-1 min-w-0 rounded-md border border-line bg-panel px-3 outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex-none h-10 px-4 rounded-md bg-white text-black font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      <div className="mt-2 text-[11px] text-text-dim">
        status: {ready ? "connected" : "connecting…"}
      </div>
    </div>
  );
}
