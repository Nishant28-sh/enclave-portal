import { GoogleGenerativeAI } from "@google/generative-ai";

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function sendChatMessage(userMessage, history = [], modelIndex = 0, attempt = 1) {
  if (modelIndex >= MODEL_CASCADE.length) {
    // All models rate-limited — wait 65s then retry from first model once more
    if (attempt === 1) {
      await sleep(65000);
      return sendChatMessage(userMessage, history, 0, 2);
    }
    throw { error: "Service is busy. Please wait a minute and try again." };
  }

  const modelName = MODEL_CASCADE[modelIndex];
  const model = getClient().getGenerativeModel({ model: modelName });

  // Strip leading model turns (Gemini needs history to start with "user")
  const safeHistory = [...history];
  while (safeHistory.length > 0 && safeHistory[0].role !== "user") {
    safeHistory.shift();
  }

  // Strip extra fields like `ts` — SDK only accepts { role, parts }
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
      // Try next model immediately
      return sendChatMessage(userMessage, history, modelIndex + 1, attempt);
    }
    if (msg.includes("API key") || msg.includes("401")) {
      throw { error: "Please set VITE_GEMINI_API_KEY in Vercel environment variables." };
    }
    throw { error: "Something went wrong. Please try again." };
  }
}
