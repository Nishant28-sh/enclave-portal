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
    console.error("Gemini API error:", err.message);

    // Detect specific Gemini errors and return helpful messages
    const msg = err.message || "";

    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate")) {
      return res.status(429).json({
        error: "Too many requests. Please wait a few seconds and try again.",
      });
    }

    if (msg.includes("401") || msg.toLowerCase().includes("api key") || msg.toLowerCase().includes("unauthorized")) {
      return res.status(500).json({
        error: "API authentication failed. Please contact support.",
      });
    }

    if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
      return res.status(500).json({
        error: "AI model unavailable. Please try again later.",
      });
    }

    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
}
