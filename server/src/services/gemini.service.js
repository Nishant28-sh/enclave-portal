import { GoogleGenerativeAI } from "@google/generative-ai";

// Created lazily (on first use) rather than at import time, so we don't
// read process.env.GEMINI_API_KEY before dotenv.config() has run.
let genAI;
function getClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Sends the user's message to Gemini, along with prior conversation
 * history, and returns the model's reply as plain text.
 *
 * history format expected from the client:
 * [
 *   { role: "user",  parts: [{ text: "hi" }] },
 *   { role: "model", parts: [{ text: "hello!" }] },
 *   ...
 * ]
 */
export async function getChatResponse(history = [], userMessage) {
  const model = getClient().getGenerativeModel({ model: "gemini-2.5-flash" });

  // Gemini requires history to start with a 'user' message.
  // Strip any leading 'model' turns (e.g. the initial AI greeting).
  const safeHistory = [...history];
  while (safeHistory.length > 0 && safeHistory[0].role !== "user") {
    safeHistory.shift();
  }

  // Gemini SDK only accepts { role, parts } — strip any extra client-side
  // fields like `ts` (timestamps) that we add for the UI.
  const cleanHistory = safeHistory.map(({ role, parts }) => ({
    role,
    parts: parts.map(({ text }) => ({ text })),
  }));

  const chat = model.startChat({ history: cleanHistory });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
