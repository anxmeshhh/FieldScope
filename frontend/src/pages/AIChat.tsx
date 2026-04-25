import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Zap } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import HistorySelector from "../components/HistorySelector";

type Message = { role: "user" | "ai"; text: string; time: string };

const suggestions = [
  "What's the best way to get my first enterprise client?",
  "How do I compete with established agencies?",
  "What is the average profit margin in this tier?",
  "How should I price my core service?",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .chat-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: calc(100vh - 72px);
    font-family: 'DM Sans', sans-serif;
    color: #1E293B;
    background: #F8FAFC;
  }

  .chat-header {
    padding: 16px 24px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #FFFFFF;
  }

  .chat-bot-icon-wrap {
    width: 36px; height: 36px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB;
  }

  .chat-title {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: #0F172A;
  }

  .chat-subtitle {
    font-size: 12px;
    color: #64748B;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    font-weight: 500;
  }

  .chat-pulse {
    width: 6px; height: 6px; border-radius: 50%;
    background: #10B981; box-shadow: 0 0 6px #10B981;
    animation: blink 2s infinite;
  }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .chat-badge {
    margin-left: auto;
    font-size: 11px; padding: 4px 10px; border-radius: 40px;
    background: #EFF6FF; border: 1px solid #93C5FD; color: #2563EB; font-weight: 600;
  }

  .chat-messages {
    flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px;
  }

  .chat-msg-row {
    display: flex; align-items: flex-start; gap: 12px;
    animation: fadeUp 0.3s ease-out forwards;
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .chat-msg-row.user { flex-direction: row-reverse; }

  .chat-avatar {
    width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; margin-top: 4px;
    display: flex; align-items: center; justify-content: center;
  }

  .chat-avatar.ai { background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; }
  .chat-avatar.user { background: #F1F5F9; border: 1px solid #E2E8F0; color: #475569; }

  .chat-bubble-wrap {
    max-width: 75%; display: flex; flex-direction: column; gap: 4px;
  }

  .chat-msg-row.user .chat-bubble-wrap { align-items: flex-end; }
  .chat-msg-row.ai .chat-bubble-wrap { align-items: flex-start; }

  .chat-bubble {
    padding: 14px 18px; font-size: 14px; line-height: 1.6; font-weight: 500;
  }

  .chat-msg-row.ai .chat-bubble {
    background: #FFFFFF; border: 1px solid #E2E8F0; color: #1E293B;
    border-radius: 4px 18px 18px 18px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }

  .chat-msg-row.user .chat-bubble {
    background: #2563EB; border: 1px solid #1D4ED8; color: #FFFFFF;
    border-radius: 18px 4px 18px 18px;
    box-shadow: 0 2px 8px rgba(37,99,235,0.2);
  }

  .chat-time { font-size: 11px; color: #94A3B8; padding: 0 4px; font-weight: 500; }

  .chat-suggestions {
    padding: 0 24px 12px; display: flex; flex-wrap: wrap; gap: 8px;
  }

  .chat-sug-btn {
    font-size: 12px; padding: 8px 14px; border-radius: 40px;
    background: #FFFFFF; border: 1px solid #E2E8F0; color: #475569;
    font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.2s;
  }

  .chat-sug-btn:hover { background: #EFF6FF; border-color: #93C5FD; color: #2563EB; }

  .chat-input-area {
    padding: 16px 24px; border-top: 1px solid #E2E8F0; background: #FFFFFF;
  }

  .chat-input-box {
    display: flex; gap: 12px;
  }

  .chat-input {
    flex: 1; padding: 14px 18px; border-radius: 12px;
    background: #F8FAFC; border: 1px solid #E2E8F0; color: #0F172A;
    font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.2s;
  }

  .chat-input:focus { border-color: #93C5FD; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .chat-input::placeholder { color: #94A3B8; }

  .chat-send {
    width: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    background: #2563EB; color: #FFFFFF; border: none; cursor: pointer; transition: all 0.2s;
  }

  .chat-send:hover { background: #1D4ED8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
  .chat-send:disabled { background: #CBD5E1; cursor: not-allowed; transform: none; box-shadow: none; }

  .chat-footer {
    font-size: 11px; color: #94A3B8; text-align: center; margin-top: 12px; font-weight: 500;
  }
`;

const API = "http://localhost:8000";

export default function AIChat() {
  const [searchParams] = useSearchParams();
  const histId = searchParams.get("history");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "👋 Hi! I'm your FieldScope AI Business Advisor. I'm connected to your current assessment context. Ask me anything about your specific industry, growth strategy, or how to tackle competitors!",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { role: "user", text, time: now }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, id: histId }),
        credentials: "include"
      });
      const data = await res.json();
      
      const aiTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      if (res.ok) {
        setMessages((m) => [...m, { role: "ai", text: data.reply, time: aiTime }]);
      } else {
        setMessages((m) => [...m, { role: "ai", text: "I encountered an error: " + (data.error || "Unknown error"), time: aiTime }]);
      }
    } catch (err) {
      const aiTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      setMessages((m) => [...m, { role: "ai", text: "Network error trying to reach the server.", time: aiTime }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="chat-wrap">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-bot-icon-wrap">
            <Bot size={18} />
          </div>
          <div>
            <div className="chat-title">FieldScope AI Advisor</div>
            <div className="chat-subtitle">
              <span className="chat-pulse" />
              Online · Context-Aware
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "16px", alignItems: "center" }}>
            <HistorySelector />
            <div className="chat-badge">Real-Time Sync</div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg-row ${msg.role}`}>
              <div className={`chat-avatar ${msg.role}`}>
                {msg.role === "ai" ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="chat-bubble-wrap">
                <div className="chat-bubble" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, "<br/>") }} />
                <div className="chat-time">{msg.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg-row ai">
              <div className="chat-avatar ai"><Bot size={16} /></div>
              <div className="chat-bubble-wrap">
                <div className="chat-bubble">
                  <div style={{ display: "flex", gap: "4px", padding: "4px" }}>
                    {[0, 1, 2].map((d) => (
                      <div key={d} style={{
                        width: "6px", height: "6px", borderRadius: "50%", background: "#94A3B8",
                        animation: `blink 1s infinite ${d * 0.2}s`
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length < 3 && (
          <div className="chat-suggestions">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="chat-sug-btn">{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-box">
            <input
              className="chat-input"
              placeholder="Ask about your strategy, growth, or competitors…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading} className="chat-send">
              <Send size={18} />
            </button>
          </div>
          <div className="chat-footer">
            Powered by RAG Intelligence · Responses are tailored strictly to your selected business profile.
          </div>
        </div>
      </div>
    </>
  );
}
