import axios from "axios";

const chatApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
});

/** Send a plain text message */
export const sendChatMessage = async (message, history = []) => {
  try {
    const res = await chatApi.post("/chat", { message, history });
    return res.data;
  } catch (err) {
    if (err.response) throw err.response.data;
    if (err.code === "ECONNABORTED") throw { error: "Response timed out. Please try again." };
    throw { error: "Unable to connect to the server." };
  }
};

/**
 * Send a message with an uploaded image (vision analysis)
 * @param {string} imageBase64 - base64 string (no data: prefix)
 * @param {string} mimeType    - e.g. "image/jpeg"
 * @param {string} message     - user's question
 * @param {Array}  history     - chat history
 */
export const sendImageMessage = async (imageBase64, mimeType, message, history = []) => {
  try {
    const res = await chatApi.post("/chat/image", { imageBase64, mimeType, message, history });
    return res.data;
  } catch (err) {
    if (err.response) throw err.response.data;
    if (err.code === "ECONNABORTED") throw { error: "Image analysis timed out. Please try a smaller image." };
    throw { error: "Unable to connect to the server." };
  }
};
