import axios from "axios";

/*
|--------------------------------------------------------------------------
| Dedicated axios instance for chat — longer timeout for AI responses
|--------------------------------------------------------------------------
| The shared contact.service api instance has a 10s timeout which is too
| short for complex Gemini responses. This instance uses 60s to handle
| longer answers (e.g. "define hooks in react").
*/
const chatApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000, // 60 seconds — Gemini can take time for detailed answers
});

/*
|--------------------------------------------------------------------------
| Send a chat message — POST /api/chat
|--------------------------------------------------------------------------
| Sends the user message together with the full conversation history so
| the Gemini model can maintain context across turns.
|
| history format:
| [
|   { role: "user",  parts: [{ text: "hi" }] },
|   { role: "model", parts: [{ text: "hello!" }] },
|   ...
| ]
*/
export const sendChatMessage = async (message, history = []) => {
  try {
    const response = await chatApi.post("/chat", { message, history });
    return response.data; // { reply: "..." }
  } catch (error) {
    if (error.response) throw error.response.data;
    if (error.code === "ECONNABORTED") {
      throw { error: "Response timed out. Please try a shorter question or try again." };
    }
    throw { error: "Unable to connect to the server." };
  }
};
