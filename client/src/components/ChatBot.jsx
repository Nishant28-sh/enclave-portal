import { useState, useRef, useEffect, useCallback } from "react";
import { sendChatMessage } from "../services/chat.service";

/* -----------------------------------------------------------------------
   ChatBot — Professional AI assistant UI
   - SVG icons (no emoji in buttons)
   - Premium dark-header design
   - Smooth animations, glassmorphism accents
   - Chat history, voice input, text-to-speech
----------------------------------------------------------------------- */

const STORAGE_KEY  = "enclave_chat_sessions";
const WELCOME_TEXT = "Hello! I'm Enclave AI, powered by Gemini 2.5 Flash. Ask me anything — I'm here to help.";
const WELCOME_MSG  = { role: "model", parts: [{ text: WELCOME_TEXT }], ts: Date.now() };

// ── SVG Icons ────────────────────────────────────────────────────────────
const Icon = {
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Mic: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  MicOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  History: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14"/>
      <path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
      <polyline points="3 3 3 9 9 9"/>
    </svg>
  ),
  NewChat: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  SpeakerOn: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  SpeakerOff: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  ),
  Stop: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Bot: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
      <line x1="8" y1="16" x2="8" y2="16"/>
      <line x1="16" y1="16" x2="16" y2="16"/>
    </svg>
  ),
  Volume: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  Chat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

// ── localStorage helpers ──────────────────────────────────────────────
function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveSessions(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function createSession(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  return {
    id: Date.now().toString(),
    title: firstUser
      ? firstUser.parts[0].text.slice(0, 45) + (firstUser.parts[0].text.length > 45 ? "..." : "")
      : "New Conversation",
    messages,
    createdAt: Date.now(),
  };
}

export default function ChatBot() {
  const [isOpen, setIsOpen]           = useState(false);
  const [view, setView]               = useState("chat");
  const [sessions, setSessions]       = useState(loadSessions);
  const [messages, setMessages]       = useState([{ ...WELCOME_MSG }]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError]       = useState(null);
  const [autoSpeak, setAutoSpeak]     = useState(
    () => localStorage.getItem("enclave_autospeak") !== "off"
  );
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);

  // ── TTS ──────────────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSpeakingIdx(null);
  }, []);

  const speakText = useCallback((text, idx = null) => {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    const clean = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[*_`#>]/g, "")
      .trim();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1; utt.pitch = 1; utt.lang = "en-US";
    utt.onstart = () => { setIsSpeaking(true); setSpeakingIdx(idx); };
    utt.onend   = () => { setIsSpeaking(false); setSpeakingIdx(null); };
    utt.onerror = () => { setIsSpeaking(false); setSpeakingIdx(null); };
    window.speechSynthesis.speak(utt);
  }, [stopSpeaking]);

  useEffect(() => { if (!isOpen) stopSpeaking(); }, [isOpen, stopSpeaking]);

  const toggleAutoSpeak = () => {
    setAutoSpeak((prev) => {
      const next = !prev;
      localStorage.setItem("enclave_autospeak", next ? "on" : "off");
      if (!next) stopSpeaking();
      return next;
    });
  };

  // ── Auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && view === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, view]);

  // ── Focus input ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, view]);

  // ── Auto-save session ─────────────────────────────────────────────────
  useEffect(() => {
    const hasUser = messages.some((m) => m.role === "user");
    if (!hasUser || loading) return;
    setSessions((prev) => {
      const session = createSession(messages);
      const rest = prev.filter((s) => s.id !== prev[0]?.id);
      const updated = [session, ...rest].slice(0, 30);
      saveSessions(updated);
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading]);

  // ── Send message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null); setMicError(null);
    const userMsg = { role: "user", parts: [{ text }], ts: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const history = updated.slice(0, -1);
      const { reply } = await sendChatMessage(text, history);
      setMessages((prev) => {
        const next = [...prev, { role: "model", parts: [{ text: reply }], ts: Date.now() }];
        if (autoSpeak) setTimeout(() => speakText(reply, next.length - 1), 150);
        return next;
      });
    } catch (err) {
      setError(err.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── New chat ──────────────────────────────────────────────────────────
  const handleNewChat = () => {
    const hasUser = messages.some((m) => m.role === "user");
    if (hasUser) {
      const session = createSession(messages);
      setSessions((prev) => {
        const rest = prev.filter((s) => s.id !== prev[0]?.id);
        const updated = [session, ...rest].slice(0, 30);
        saveSessions(updated);
        return updated;
      });
    }
    setMessages([{ ...WELCOME_MSG, ts: Date.now() }]);
    setError(null); setView("chat");
  };

  const handleLoadSession = (s) => {
    setMessages(s.messages); setError(null); setView("chat");
  };

  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    setSessions((prev) => { const u = prev.filter((s) => s.id !== id); saveSessions(u); return u; });
  };

  // ── Voice input ───────────────────────────────────────────────────────
  const handleMic = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setMicError("Voice input not supported in this browser."); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    recognitionRef.current = r;
    r.onstart  = () => { setIsListening(true); setMicError(null); };
    r.onend    = () => setIsListening(false);
    r.onerror  = (e) => { setIsListening(false); if (e.error !== "aborted") setMicError("Mic error: " + e.error); };
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput((p) => p ? p + " " + t : t);
      setTimeout(() => inputRef.current?.focus(), 100);
    };
    r.start();
  }, [isListening]);

  // ── Time format ───────────────────────────────────────────────────────
  const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const fmtDate = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* ── FAB toggle ── */}
      <button
        id="chatbot-toggle"
        className={`cb-fab${isOpen ? " cb-fab--open" : ""}`}
        onClick={() => setIsOpen((p) => !p)}
        aria-label={isOpen ? "Close chat" : "Open Enclave AI"}
      >
        <span className="cb-fab-icon cb-fab-icon--chat"><Icon.Chat /></span>
        <span className="cb-fab-icon cb-fab-icon--close"><Icon.Close /></span>
        {!isOpen && <span className="cb-fab-ping" />}
      </button>

      {/* ── Chat window ── */}
      {isOpen && (
        <div className="cb-window">

          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-brand">
              <div className="cb-header-avatar">
                <Icon.Bot />
              </div>
              <div>
                <p className="cb-header-name">Enclave AI</p>
                <p className="cb-header-sub">
                  <span className="cb-online-dot" />
                  Gemini 2.5 Flash
                </p>
              </div>
            </div>
            <div className="cb-header-actions">
              <button
                className={`cb-hbtn${view === "history" ? " cb-hbtn--on" : ""}`}
                onClick={() => setView((v) => v === "history" ? "chat" : "history")}
                title="Chat history"
              ><Icon.History /></button>

              <button className="cb-hbtn" onClick={handleNewChat} title="New conversation">
                <Icon.NewChat />
              </button>

              <button
                className={`cb-hbtn${autoSpeak ? " cb-hbtn--on" : ""}`}
                onClick={toggleAutoSpeak}
                title={autoSpeak ? "Auto-speak on" : "Auto-speak off"}
              >
                {autoSpeak ? <Icon.SpeakerOn /> : <Icon.SpeakerOff />}
              </button>

              {isSpeaking && (
                <button className="cb-hbtn cb-hbtn--stop" onClick={stopSpeaking} title="Stop speaking">
                  <Icon.Stop />
                </button>
              )}

              <button className="cb-hbtn cb-hbtn--close" onClick={() => setIsOpen(false)} title="Close">
                <Icon.Close />
              </button>
            </div>
          </div>

          {/* ══ HISTORY VIEW ══ */}
          {view === "history" && (
            <div className="cb-history">
              <div className="cb-history-head">
                <span>Conversation History</span>
                <span className="cb-history-count">{sessions.length} chats</span>
              </div>
              {sessions.length === 0 ? (
                <div className="cb-history-empty">
                  <div className="cb-history-empty-icon"><Icon.History /></div>
                  <p>No saved conversations yet.</p>
                  <small>Start a chat to see your history here.</small>
                </div>
              ) : (
                <ul className="cb-session-list">
                  {sessions.map((s) => (
                    <li key={s.id} className="cb-session" onClick={() => handleLoadSession(s)}>
                      <div className="cb-session-body">
                        <span className="cb-session-title">{s.title}</span>
                        <span className="cb-session-meta">
                          {fmtDate(s.createdAt)} &bull; {s.messages.length} messages
                        </span>
                      </div>
                      <button
                        className="cb-session-del"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        title="Delete"
                      ><Icon.Trash /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ══ CHAT VIEW ══ */}
          {view === "chat" && (
            <>
              <div className="cb-messages" aria-live="polite">
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={i} className={`cb-row${isUser ? " cb-row--user" : ""}`}>
                      {!isUser && (
                        <div className="cb-avatar"><Icon.Bot /></div>
                      )}
                      <div className="cb-bubble-col">
                        <div className={`cb-bubble${isUser ? " cb-bubble--user" : " cb-bubble--ai"}${speakingIdx === i ? " cb-bubble--speaking" : ""}`}>
                          {msg.parts[0].text}
                        </div>
                        <div className={`cb-bubble-footer${isUser ? " cb-bubble-footer--user" : ""}`}>
                          {msg.ts && <span className="cb-time">{fmt(msg.ts)}</span>}
                          {!isUser && (
                            <button
                              className={`cb-speak${speakingIdx === i ? " cb-speak--active" : ""}`}
                              onClick={() => speakingIdx === i ? stopSpeaking() : speakText(msg.parts[0].text, i)}
                              title={speakingIdx === i ? "Stop" : "Read aloud"}
                            >
                              {speakingIdx === i ? <Icon.Stop /> : <Icon.Volume />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="cb-row">
                    <div className="cb-avatar"><Icon.Bot /></div>
                    <div className="cb-bubble cb-bubble--ai cb-bubble--typing">
                      <span className="cb-dot" />
                      <span className="cb-dot" />
                      <span className="cb-dot" />
                    </div>
                  </div>
                )}

                {(error || micError) && (
                  <div className="cb-error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error || micError}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Listening bar */}
              {isListening && (
                <div className="cb-listening">
                  <div className="cb-listening-waves">
                    <span /><span /><span /><span /><span />
                  </div>
                  <span>Listening...</span>
                </div>
              )}

              {/* Input row */}
              <div className="cb-input-wrap">
                <button
                  className={`cb-mic${isListening ? " cb-mic--on" : ""}`}
                  onClick={handleMic}
                  disabled={loading}
                  title={isListening ? "Stop" : "Voice input"}
                >
                  {isListening ? <Icon.MicOff /> : <Icon.Mic />}
                </button>
                <textarea
                  ref={inputRef}
                  className="cb-input"
                  placeholder={isListening ? "Listening..." : "Ask me anything..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={loading}
                />
                <button
                  className="cb-send"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  title="Send"
                >
                  <Icon.Send />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
