import { GoogleGenerativeAI } from "@google/generative-ai";

// Falls back through models if one is rate-limited
const MODEL_CASCADE = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

let genAI = null;
function getClient() {
  if (!genAI) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error("VITE_GEMINI_API_KEY is not set");
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

export async function sendChatMessage(userMessage, history = [], modelIndex = 0) {
  if (modelIndex >= MODEL_CASCADE.length) {
    throw { error: "Too many requests. Please wait a moment and try again." };
  }

  const modelName = MODEL_CASCADE[modelIndex];
  const model = getClient().getGenerativeModel({ model: modelName });

  // Gemini needs history to start with "user" role — strip leading model turns
  const safeHistory = [...history];
  while (safeHistory.length > 0 && safeHistory[0].role !== "user") {
    safeHistory.shift();
  }

  // Strip extra fields (ts, etc.) — SDK only accepts { role, parts }
  const cleanHistory = safeHistory.map(({ role, parts }) => ({
    role,
    parts: parts.map(({ text }) => ({ text })),
  }));

  try {
    const chat = model.startChat({ history: cleanHistory });
    const result = await chat.sendMessage(userMessage);
    return { reply: result.response.text() };
  } catch (err) {
    const msg = err.message || "";
    if (msg.includes("429")) {
      // Try next model in cascade
      return sendChatMessage(userMessage, history, modelIndex + 1);
    }
    if (msg.includes("API key")) {
      throw { error: "Invalid API key. Please check your configuration." };
    }
    throw { error: "Something went wrong. Please try again." };
  }
}
