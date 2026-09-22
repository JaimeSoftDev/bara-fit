import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { Message } from "../types";
import { cx } from "../lib/utils";

export function ChatThread({
  messages,
  currentUserId,
  onSend,
  otherName,
}: {
  messages: Message[];
  currentUserId: string;
  onSend: (text: string) => void;
  otherName: string;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] flex-col rounded-2xl border border-slate-200 bg-white lg:h-[calc(100vh-8rem)]">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">Inicia la conversación con {otherName}.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cx(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  mine ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800",
                )}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
          aria-label="Enviar"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
