import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;
function getClient() {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

// Primary model + fallback — if one is rate-limited, try the next
const MODEL_CASCADE = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

/**
 * Sends a message to Gemini with conversation history.
 * Falls back to next model automatically if rate-limited (429).
 *
 * history items from client may contain extra fields (e.g. ts) —
 * these are stripped before sending to the SDK.
 */
export async function getChatResponse(history = [], userMessage, modelIndex = 0) {
  if (modelIndex >= MODEL_CASCADE.length) {
    throw new Error("429");
  }

  const modelName = MODEL_CASCADE[modelIndex];
  const model = getClient().getGenerativeModel({ model: modelName });

  // Strip leading model turns — Gemini requires history to start with "user"
  const safeHistory = [...history];
  while (safeHistory.length > 0 && safeHistory[0].role !== "user") {
    safeHistory.shift();
  }

  // Strip extra client-side fields (ts etc.) — SDK only accepts { role, parts }
  const cleanHistory = safeHistory.map(({ role, parts }) => ({
    role,
    parts: parts.map(({ text }) => ({ text })),
  }));

  try {
    const chat = model.startChat({ history: cleanHistory });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    const is429 = err.message?.includes("429") || err.status === 429;
    if (is429) {
      console.warn(`[Gemini] ${modelName} rate-limited, trying fallback...`);
      return getChatResponse(history, userMessage, modelIndex + 1);
    }
    throw err;
  }
}
