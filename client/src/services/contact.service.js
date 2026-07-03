import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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

    throw {
      success: false,
      message: "Unable to connect to the server.",
    };
  }
};

/*
|--------------------------------------------------------------------------
| Get All Contacts  (Admin)
|--------------------------------------------------------------------------
*/

export const getContacts = async () => {
  try {
    const response = await api.get("/admin/contacts");

    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }

    throw {
      success: false,
      message: "Unable to fetch contacts.",
    };
  }
};

/*
|--------------------------------------------------------------------------
| Delete Contact  (Admin)
|--------------------------------------------------------------------------
*/

export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/admin/contacts/${id}`);

    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }

    throw {
      success: false,
      message: "Unable to delete contact.",
    };
  }
};

export default api;
