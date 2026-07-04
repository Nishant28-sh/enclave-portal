import axios from "axios";

const TOKEN_KEY = "enclave_admin_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Attach JWT token automatically to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to connect to the server." };
  }
};

/*
|--------------------------------------------------------------------------
| Get All Contacts  (Admin — requires JWT)
|--------------------------------------------------------------------------
*/
export const getContacts = async () => {
  try {
    const response = await api.get("/admin/contacts");
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to fetch contacts." };
  }
};

/*
|--------------------------------------------------------------------------
| Delete Contact  (Admin — requires JWT)
|--------------------------------------------------------------------------
*/
export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/admin/contacts/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to delete contact." };
  }
};

export default api;
