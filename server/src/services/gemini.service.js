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
  // Strip any leading 'model' turns (e.g. the initial AI greeting stored in client state).
  const safeHistory = [...history];
  while (safeHistory.length > 0 && safeHistory[0].role !== "user") {
    safeHistory.shift();
  }

  const chat = model.startChat({ history: safeHistory });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
