import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorText } from "../api/client";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about admissions, departments, contact details and more." },
  ]);

  const send = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { from: "me", text: question }]);
    try {
      const { data } = await api.post("/public/chat", { question });
      setMessages((m) => [...m, { from: "bot", text: data.answer, login: data.requires_login }]);
    } catch (err) {
      setMessages((m) => [...m, { from: "bot", text: errorText(err) }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div className="chat-box">
          <div className="chat-head">
            College Assistant
            <button className="link-btn" onClick={() => setOpen(false)}>x</button>
          </div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>
                {m.text}
                {m.login && (
                  <div><Link to="/login">Log in to continue</Link></div>
                )}
              </div>
            ))}
            {busy && <div className="bubble bot">Thinking...</div>}
          </div>
          <form className="chat-input" onSubmit={send}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question" />
            <button className="btn small">Send</button>
          </form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Ask AI"}
      </button>
    </>
  );
}