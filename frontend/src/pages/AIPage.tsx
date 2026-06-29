import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader } from "lucide-react";

interface Message { role: "user" | "ai"; text: string; }

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role:"ai", text:"Namaste! Main BlinkTalk AI hoon. Kuch bhi pucho — translate karo, smart reply lo, ya kuch bhi!" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role:"user", text:userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: "You are BlinkTalk AI, a helpful assistant inside a chat app. Be concise, friendly, and helpful. Reply in the same language the user writes in.",
          messages: [{ role:"user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, kuch error aaya!";
      setMessages(prev => [...prev, { role:"ai", text:reply }]);
    } catch {
      setMessages(prev => [...prev, { role:"ai", text:"Network error. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f5f6fa" }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"16px 20px", borderBottom:"1px solid #e8eaf0", flexShrink:0, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#6c7bff,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize:16, fontWeight:800, color:"#1a1b2e" }}>BlinkTalk AI</h2>
          <p style={{ fontSize:11, color:"#9094b0" }}>Powered by Claude</p>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding:"12px 16px", display:"flex", gap:8, overflowX:"auto", flexShrink:0, background:"#fff", borderBottom:"1px solid #e8eaf0" }}>
        {["Translate to English","Write a reply","Summarize this","Tell a joke"].map(q => (
          <button key={q} onClick={() => setInput(q)}
            style={{ flexShrink:0, padding:"6px 12px", borderRadius:20, border:"1px solid #e8eaf0", background:"#f5f6fa", fontSize:12, color:"#636890", cursor:"pointer", fontWeight:500 }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start", marginBottom:12 }}>
            {m.role === "ai" && (
              <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6c7bff,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", marginRight:8, flexShrink:0, alignSelf:"flex-end" }}>
                <Sparkles size={13} color="#fff" />
              </div>
            )}
            <div style={{
              maxWidth:"75%", padding:"10px 14px", borderRadius: m.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role==="user" ? "#6c7bff" : "#fff",
              color: m.role==="user" ? "#fff" : "#1a1b2e",
              fontSize:13, lineHeight:1.5, border: m.role==="ai" ? "1px solid #e8eaf0" : "none",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6c7bff,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Sparkles size={13} color="#fff" />
            </div>
            <div style={{ background:"#fff", padding:"10px 14px", borderRadius:"18px 18px 18px 4px", border:"1px solid #e8eaf0" }}>
              <Loader size={14} color="#6c7bff" style={{ animation:"spin 1s linear infinite" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px", background:"#fff", borderTop:"1px solid #e8eaf0", display:"flex", gap:8, flexShrink:0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()}
          placeholder="Ask AI anything..."
          style={{ flex:1, background:"#f5f6fa", border:"none", borderRadius:14, padding:"10px 14px", fontSize:13, color:"#1a1b2e", outline:"none" }}
        />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ width:42, height:42, borderRadius:12, background:"#6c7bff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", opacity: !input.trim() || loading ? 0.5 : 1 }}
        >
          <Send size={16} color="#fff" />
        </button>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}