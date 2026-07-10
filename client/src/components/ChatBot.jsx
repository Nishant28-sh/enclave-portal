import { useState, useRef, useEffect, useCallback } from "react";
import { sendChatMessage } from "../services/chat.service";

/* -----------------------------------------------------------------------
   ChatBot — floating AI chat assistant powered by Gemini 2.5 Flash
   Features:
   • Persistent chat history (localStorage) with session management
   • Voice input via Web Speech API
   • Typing indicator, error handling, keyboard shortcuts
----------------------------------------------------------------------- */

const STORAGE_KEY = "enclave_chat_sessions";
const WELCOME_MSG = {
  role: "model",
  parts: [{ text: "Hey! 👋 I'm the Enclave AI assistant. How can I help you today?" }],
  ts: Date.now(),
};

// ── localStorage helpers ──────────────────────────────────────────────
function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
function createSession(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  return {
    id: Date.now().toString(),
    title: firstUser
      ? firstUser.parts[0].text.slice(0, 40) + (firstUser.parts[0].text.length > 40 ? "…" : "")
      : "New Chat",
    messages,
    createdAt: Date.now(),
  };
}

export default function ChatBot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [view, setView]           = useState("chat"); // "chat" | "history"
  const [sessions, setSessions]   = useState(loadSessions);
  const [messages, setMessages]   = useState([{ ...WELCOME_MSG }]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError]   = useState(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const recognitionRef = useRef(null);

  // ── Auto-scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && view === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, view]);

  // ── Focus input when chat opens ──────────────────────────────────────
  useEffect(() => {
    if (isOpen && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, view]);

  // ── Save current session to localStorage on message change ───────────
  useEffect(() => {
    const hasUserMsg = messages.some((m) => m.role === "user");
    if (!hasUserMsg) return; // don't save empty sessions
    // Debounce — only save when not loading
    if (!loading) {
      setSessions((prev) => {
        const session = createSession(messages);
        // Replace first (current) session or prepend
        const rest = prev.filter((s) => s.id !== (prev[0]?.id));
        const updated = [session, ...rest].slice(0, 30); // keep last 30 sessions
        saveSessions(updated);
        return updated;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading]);

  // ── Send message ─────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setMicError(null);

    const userMsg = { role: "user", parts: [{ text }], ts: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages.slice(0, -1);
      const { reply } = await sendChatMessage(text, history);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: reply }], ts: Date.now() },
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

  // ── New chat ─────────────────────────────────────────────────────────
  const handleNewChat = () => {
    // Save current session first
    const hasUserMsg = messages.some((m) => m.role === "user");
    if (hasUserMsg) {
      const session = createSession(messages);
      setSessions((prev) => {
        const rest = prev.filter((s) => s.id !== (prev[0]?.id));
        const updated = [session, ...rest].slice(0, 30);
        saveSessions(updated);
        return updated;
      });
    }
    setMessages([{ ...WELCOME_MSG, ts: Date.now() }]);
    setError(null);
    setView("chat");
  };

  // ── Load a past session ───────────────────────────────────────────────
  const handleLoadSession = (session) => {
    setMessages(session.messages);
    setError(null);
    setView("chat");
  };

  // ── Delete a session ──────────────────────────────────────────────────
  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
  };

  // ── Mic / Voice input ─────────────────────────────────────────────────
  const handleMic = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart  = () => { setIsListening(true); setMicError(null); };
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = (e) => {
      setIsListening(false);
      if (e.error !== "aborted") setMicError("Mic error: " + e.error);
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    recognition.start();
  }, [isListening]);

  // ── Format timestamp ──────────────────────────────────────────────────
  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
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

          {/* ── Header ── */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-status-dot" aria-hidden="true" />
              <div>
                <p className="chatbot-title">Enclave AI</p>
                <p className="chatbot-subtitle">Powered by Gemini 2.5 Flash</p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              {/* History toggle */}
              <button
                className={`chatbot-icon-btn${view === "history" ? " chatbot-icon-btn--active" : ""}`}
                onClick={() => setView((v) => (v === "history" ? "chat" : "history"))}
                title="Chat history"
                aria-label="Toggle chat history"
              >
                🕐
              </button>
              {/* New chat */}
              <button
                className="chatbot-icon-btn"
                onClick={handleNewChat}
                title="New chat"
                aria-label="Start new chat"
              >
                ✏️
              </button>
              {/* Close */}
              <button
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ══ HISTORY VIEW ══ */}
          {view === "history" && (
            <div className="chatbot-history">
              <p className="chatbot-history-heading">Past Conversations</p>
              {sessions.length === 0 ? (
                <div className="chatbot-history-empty">
                  <span>🗂</span>
                  <p>No saved conversations yet.</p>
                  <p>Start chatting to build your history!</p>
                </div>
              ) : (
                <ul className="chatbot-session-list">
                  {sessions.map((s) => (
                    <li
                      key={s.id}
                      className="chatbot-session-item"
                      onClick={() => handleLoadSession(s)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleLoadSession(s)}
                    >
                      <div className="chatbot-session-info">
                        <span className="chatbot-session-title">{s.title}</span>
                        <span className="chatbot-session-meta">
                          {formatDate(s.createdAt)} · {s.messages.length} msgs
                        </span>
                      </div>
                      <button
                        className="chatbot-session-delete"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        aria-label="Delete session"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ══ CHAT VIEW ══ */}
          {view === "chat" && (
            <>
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
                      <div className={`chatbot-bubble-group ${isUser ? "chatbot-bubble-group--user" : ""}`}>
                        <div
                          className={`chatbot-bubble ${isUser ? "chatbot-bubble--user" : "chatbot-bubble--model"}`}
                        >
                          {msg.parts[0].text}
                        </div>
                        {msg.ts && (
                          <span className="chatbot-timestamp">{formatTime(msg.ts)}</span>
                        )}
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

                {(error || micError) && (
                  <div className="chatbot-error" role="alert">
                    {error || micError}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* ── Mic listening indicator ── */}
              {isListening && (
                <div className="chatbot-listening-bar">
                  <span className="chatbot-listening-dot" />
                  <span className="chatbot-listening-dot" />
                  <span className="chatbot-listening-dot" />
                  <span className="chatbot-listening-text">Listening… speak now</span>
                </div>
              )}

              {/* ── Input row ── */}
              <div className="chatbot-input-row">
                {/* Mic button */}
                <button
                  className={`chatbot-mic-btn${isListening ? " chatbot-mic-btn--active" : ""}`}
                  onClick={handleMic}
                  title={isListening ? "Stop listening" : "Speak"}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  disabled={loading}
                >
                  {isListening ? "⏹" : "🎤"}
                </button>

                <textarea
                  ref={inputRef}
                  id="chatbot-input"
                  className="chatbot-input"
                  placeholder={isListening ? "Listening…" : "Type a message…"}
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
            </>
          )}
        </div>
      )}
    </>
  );
}
