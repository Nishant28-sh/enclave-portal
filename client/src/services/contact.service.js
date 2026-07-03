import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});

/*
|--------------------------------------------------------------------------
| Submit Contact Form
|--------------------------------------------------------------------------
*/

export const submitContact = async (formData) => {
  try {
    const response = await api.post("/contact", formData);

    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }

    if (error.request) {
      throw {
        success: false,
        message: "Unable to reach the server. Please try again later.",
      };
    }

    throw {
      success: false,
      message: "Something went wrong.",
    };
  }
};

export default api;
