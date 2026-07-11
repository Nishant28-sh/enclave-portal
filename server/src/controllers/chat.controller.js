import { getChatResponse, getChatResponseWithImage } from "../services/gemini.service.js";

// POST /api/chat — standard text chat
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
    if (msg.includes("GROQ_API_KEY missing") || msg.includes("401") || msg.toLowerCase().includes("auth")) {
      return res.status(500).json({ error: "GROQ_API_KEY not configured on server. Please add it to Render environment variables." });
    }
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// POST /api/chat/image — vision chat with uploaded image
export async function handleImageChat(req, res) {
  const { message, history, imageBase64, mimeType } = req.body;
  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: "imageBase64 and mimeType are required." });
  }
  // Limit base64 size (~4MB raw)
  if (imageBase64.length > 5_500_000) {
    return res.status(413).json({ error: "Image too large. Please use an image under 4MB." });
  }
  try {
    const reply = await getChatResponseWithImage(
      imageBase64,
      mimeType,
      history || [],
      message || "What do you see in this image?"
    );
    return res.json({ reply });
  } catch (err) {
    console.error("Vision AI error:", err.message || err);
    const msg = err.message || "";
    if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    }
    return res.status(500).json({ error: "Could not analyze image. Please try again." });
  }
}
