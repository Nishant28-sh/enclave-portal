import api from "./contact.service";

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
    const response = await api.post("/chat", { message, history });
    return response.data; // { reply: "..." }
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { error: "Unable to connect to the server." };
  }
};
