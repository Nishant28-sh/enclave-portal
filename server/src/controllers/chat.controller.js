import { getChatResponse } from "../services/gemini.service.js";

export async function handleChat(req, res) {
  const { message, history } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const reply = await getChatResponse(history || [], message);
    return res.json({ reply });
  } catch (err) {
    console.error("AI error:", err.message || err);
    const msg = err.message || "";

    if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    }
    if (msg.includes("401") || msg.toLowerCase().includes("api key") || msg.toLowerCase().includes("auth")) {
      return res.status(500).json({ error: "AI service configuration error. Please contact support." });
    }
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
