import Groq from "groq-sdk";

let groq;
function getClient() {
  if (!groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      console.error("GROQ_API_KEY is not set in environment variables!");
      throw new Error("GROQ_API_KEY missing");
    }
    groq = new Groq({ apiKey: key });
  }
  return groq;
}

const SYSTEM_PROMPT =
  "You are Enclave AI, a helpful and friendly AI assistant powered by Llama. " +
  "Answer clearly and concisely. Format responses with markdown when helpful. " +
  "If asked about yourself, say you are Enclave AI.";

/**
 * Standard chat — converts Gemini-format history to Groq/OpenAI format
 */
export async function getChatResponse(history = [], userMessage) {
  const safe = [...history];
  while (safe.length > 0 && safe[0].role !== "user") safe.shift();

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...safe.map(({ role, parts }) => ({
      role: role === "model" ? "assistant" : "user",
      content: parts.map((p) => p.text).join(""),
    })),
    { role: "user", content: userMessage },
  ];

  const res = await getClient().chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return res.choices[0].message.content;
}

/**
 * Vision chat — analyze an uploaded image using Groq's vision model
 * @param {string} imageBase64 - base64-encoded image data
 * @param {string} mimeType    - e.g. "image/jpeg"
 * @param {Array}  history     - chat history in Gemini format
 * @param {string} userMessage - user's question about the image
 */
export async function getChatResponseWithImage(imageBase64, mimeType, history = [], userMessage) {
  const safe = [...history];
  while (safe.length > 0 && safe[0].role !== "user") safe.shift();

  const priorMessages = safe.map(({ role, parts }) => ({
    role: role === "model" ? "assistant" : "user",
    content: parts.map((p) => p.text).join(""),
  }));

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...priorMessages,
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${imageBase64}` },
        },
        {
          type: "text",
          text: userMessage || "What do you see in this image? Describe it in detail.",
        },
      ],
    },
  ];

  const res = await getClient().chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return res.choices[0].message.content;
}
