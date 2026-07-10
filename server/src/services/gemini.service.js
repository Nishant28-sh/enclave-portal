import { GoogleGenerativeAI } from "@google/generative-ai";

// Created lazily so we don't read process.env.GEMINI_API_KEY before dotenv runs
let genAI;
function getClient() {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

// Simple sleep helper
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Sends the user's message to Gemini with prior conversation history.
 * Auto-retries on 429 rate-limit errors (up to 3 attempts, with backoff).
 *
 * history format from client:
 * [
 *   { role: "user",  parts: [{ text: "hi" }], ts: ... },  // ts is stripped
 *   { role: "model", parts: [{ text: "hello!" }], ts: ... },
 *   ...
 * ]
 */
export async function getChatResponse(history = [], userMessage, attempt = 1) {
  const model = getClient().getGenerativeModel({ model: "gemini-2.5-flash" });

  // Gemini requires history to start with a 'user' message.
  // Strip any leading 'model' turns (e.g. the initial AI greeting).
  const safeHistory = [...history];
  while (safeHistory.length > 0 && safeHistory[0].role !== "user") {
    safeHistory.shift();
  }

  // Gemini SDK only accepts { role, parts } — strip extra client-side
  // fields like `ts` (timestamps added for the UI).
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

    // Auto-retry on rate limit: wait and try again (max 3 attempts)
    if (is429 && attempt < 4) {
      // Gemini rate limit resets in ~55s — waits: 20s, 40s, 65s
      const waits = [20000, 40000, 65000];
      const waitMs = waits[attempt - 1] || 65000;
      console.warn(`Gemini 429 rate limit — retrying in ${waitMs / 1000}s (attempt ${attempt}/3)`);
      await sleep(waitMs);
      return getChatResponse(history, userMessage, attempt + 1);
    }

    throw err;
  }
}
