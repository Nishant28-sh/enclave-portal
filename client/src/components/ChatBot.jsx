import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/chat.service";

/* -----------------------------------------------------------------------
   ChatBot — floating AI chat assistant powered by Gemini 2.5 Flash
   Uses the existing design system (Space Grotesk, neubrutalist style).
----------------------------------------------------------------------- */

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [{ text: "Hey! 👋 I'm the Enclave AI assistant. How can I help you today?" }],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);

    // Append user message immediately
    const userMsg = { role: "user", parts: [{ text }] };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Build history excluding the very last (just-added) user message
      const history = updatedMessages.slice(0, -1);
      const { reply } = await sendChatMessage(text, history);

      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: reply }] },
      ]);
    } catch (err) {
      setError(err.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "model",
        parts: [{ text: "Conversation cleared. How can I help you?" }],
      },
    ]);
    setError(null);
  };

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        id="chatbot-toggle"
        className="chatbot-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        title={isOpen ? "Close chat" : "Chat with AI"}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* ── Chat window ── */}
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-label="AI chat assistant">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-status-dot" aria-hidden="true" />
              <div>
                <p className="chatbot-title">Enclave AI</p>
                <p className="chatbot-subtitle">Powered by Gemini 2.5 Flash</p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-clear-btn"
                onClick={handleClear}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                🗑
              </button>
              <button
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" aria-live="polite">
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={i}
                  className={`chatbot-bubble-wrapper ${isUser ? "chatbot-bubble-wrapper--user" : ""}`}
                >
                  {!isUser && (
                    <div className="chatbot-avatar" aria-hidden="true">AI</div>
                  )}
                  <div
                    className={`chatbot-bubble ${isUser ? "chatbot-bubble--user" : "chatbot-bubble--model"}`}
                  >
                    {msg.parts[0].text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chatbot-bubble-wrapper">
                <div className="chatbot-avatar" aria-hidden="true">AI</div>
                <div className="chatbot-bubble chatbot-bubble--model chatbot-bubble--typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            {error && (
              <div className="chatbot-error" role="alert">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-row">
            <textarea
              ref={inputRef}
              id="chatbot-input"
              className="chatbot-input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
              aria-label="Chat message input"
            />
            <button
              id="chatbot-send"
              className="chatbot-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
