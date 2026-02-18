import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Zap } from "lucide-react";

type Message = { role: "user" | "ai"; text: string; time: string };

const initialMessages: Message[] = [
  {
    role: "ai",
    text: "👋 Hi! I'm your FieldScope AI Business Advisor. I'm trained on India-specific business intelligence data. Ask me anything about your industry, services, competitors, or growth strategy!",
    time: "Now",
  },
];

const suggestions = [
  "Should I offer SEO services with ₹2L budget?",
  "How do I scale from ₹5L to ₹50L revenue?",
  "What's the best way to get my first enterprise client?",
  "How do I compete with established agencies?",
];

const aiReplies: Record<string, string> = {
  default: "Great question! Based on your intermediate level profile in Digital Marketing, I'd recommend focusing on building case studies first before approaching enterprise clients. Would you like me to walk you through a specific strategy?",
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { role: "user", text, time: now }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: aiReplies[text] ?? aiReplies["default"],
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: "calc(100vh - 72px)" }}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center gap-3"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(var(--purple) / 0.15)" }}
        >
          <Bot size={18} style={{ color: "hsl(var(--purple))" }} />
        </div>
        <div>
          <div className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            FieldScope AI Advisor
          </div>
          <div className="text-xs flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: "hsl(var(--green))" }} />
            Online · RAG-powered · India-specific
          </div>
        </div>
        <div className="ml-auto text-xs px-3 py-1 rounded-full border"
          style={{ background: "hsl(var(--purple) / 0.1)", borderColor: "hsl(var(--purple) / 0.3)", color: "hsl(var(--purple))" }}>
          Phase 2 Module
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 animate-fade-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: msg.role === "ai" ? "hsl(var(--purple) / 0.15)" : "hsl(var(--cyan) / 0.15)",
              }}
            >
              {msg.role === "ai" ? (
                <Bot size={14} style={{ color: "hsl(var(--purple))" }} />
              ) : (
                <User size={14} style={{ color: "hsl(var(--cyan))" }} />
              )}
            </div>
            <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div
                className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === "ai" ? "hsl(var(--card))" : "hsl(var(--cyan) / 0.12)",
                  border: `1px solid ${msg.role === "ai" ? "hsl(var(--border))" : "hsl(var(--cyan) / 0.3)"}`,
                  color: "hsl(var(--foreground))",
                  borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                }}
              >
                {msg.text}
              </div>
              <div className="text-[10px] px-1" style={{ color: "hsl(var(--muted-foreground))" }}>{msg.time}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(var(--purple) / 0.15)" }}>
              <Bot size={14} style={{ color: "hsl(var(--purple))" }} />
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <div className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <div key={d} className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "hsl(var(--muted-foreground))", animationDelay: `${d * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: "hsl(var(--navy-700))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="px-6 py-4 border-t"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <div className="flex gap-3">
          <input
            className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
            style={{
              background: "hsl(var(--navy-700))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            placeholder="Ask about your industry, services, growth…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-xl transition-all disabled:opacity-50 hover:scale-105"
            style={{ background: "hsl(var(--cyan))", color: "hsl(var(--navy-900))" }}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-[10px] mt-2 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
          RAG-powered · Grounded in FieldScope domain knowledge · India-specific
        </div>
      </div>
    </div>
  );
}
