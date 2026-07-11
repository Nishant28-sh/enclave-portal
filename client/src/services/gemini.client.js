import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

let genAI = null;
function getClient() {
  if (!genAI) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw { error: "API key not configured. Please contact support." };
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

/**
 * Send a chat message to Gemini.
 * Falls back to next model on 429 — no retries to avoid quota waste.
 */
export async function sendChatMessage(userMessage, history = [], modelIndex = 0) {
  if (modelIndex >= MODELS.length) {
    throw { error: "AI is busy right now. Please wait 1 minute and try again." };
  }

  const model = getClient().getGenerativeModel({ model: MODELS[modelIndex] });

  // History must start with "user" role
  const safe = [...history];
  while (safe.length > 0 && safe[0].role !== "user") safe.shift();

  // Strip extra fields (ts etc.) — Gemini SDK only accepts { role, parts }
  const clean = safe.map(({ role, parts }) => ({
    role,
    parts: parts.map(({ text }) => ({ text })),
  }));

  try {
    const chat = model.startChat({ history: clean });
    const result = await chat.sendMessage(userMessage);
    return { reply: result.response.text() };
  } catch (err) {
    if ((err.message || "").includes("429")) {
      // Try next model — no sleep, no retries (saves quota)
      return sendChatMessage(userMessage, history, modelIndex + 1);
    }
    throw { error: "Something went wrong. Please try again." };
  }
}
