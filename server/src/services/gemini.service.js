import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;
function getClient() {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

export async function getChatResponse(history = [], userMessage) {
  const model = getClient().getGenerativeModel({ model: "gemini-2.5-flash" });

  // Gemini requires history to start with a 'user' message.
  const safeHistory = [...history];
  while (safeHistory.length > 0 && safeHistory[0].role !== "user") {
    safeHistory.shift();
  }

  // Strip extra client-side fields like `ts` — Gemini only accepts { role, parts }
  const cleanHistory = safeHistory.map(({ role, parts }) => ({
    role,
    parts: parts.map(({ text }) => ({ text })),
  }));

  const chat = model.startChat({ history: cleanHistory });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
