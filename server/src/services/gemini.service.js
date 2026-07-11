import Groq from "groq-sdk";

let groq;
function getClient() {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

const SYSTEM_PROMPT =
  "You are Enclave AI, a helpful and friendly AI assistant. " +
  "Answer clearly and concisely. If asked about yourself, say you are Enclave AI powered by Llama.";

/**
 * Sends a message to Groq (Llama model) with conversation history.
 *
 * history items from client:
 * [{ role: "user"|"model", parts: [{ text: "..." }], ts: ... }]
 *
 * Groq uses OpenAI format:
 * [{ role: "user"|"assistant", content: "..." }]
 */
export async function getChatResponse(history = [], userMessage) {
  // Convert Gemini-format history to Groq/OpenAI format
  // Strip leading "model" turns, convert "model" -> "assistant", drop extra fields
  const safeHistory = [...history];
  while (safeHistory.length > 0 && safeHistory[0].role !== "user") {
    safeHistory.shift();
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...safeHistory.map(({ role, parts }) => ({
      role: role === "model" ? "assistant" : "user",
      content: parts.map((p) => p.text).join(""),
    })),
    { role: "user", content: userMessage },
  ];

  const response = await getClient().chat.completions.create({
    model: "llama-3.1-8b-instant", // Fast, free, 14400 req/day
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}
