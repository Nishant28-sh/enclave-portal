import api from "./contact.service";

const TOKEN_KEY = "enclave_admin_token";

/*
|--------------------------------------------------------------------------
| Login — POST /api/auth/login
|--------------------------------------------------------------------------
*/
export const login = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    const { token } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw { success: false, message: "Unable to connect to the server." };
  }
};

/*
|--------------------------------------------------------------------------
| Logout — clear token from storage
|--------------------------------------------------------------------------
*/
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/*
|--------------------------------------------------------------------------
| Get stored token
|--------------------------------------------------------------------------
*/
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/*
|--------------------------------------------------------------------------
| Check if user is authenticated
|--------------------------------------------------------------------------
*/
export const isAuthenticated = () => !!getToken();

/*
|--------------------------------------------------------------------------
| Verify token with server (on app load)
|--------------------------------------------------------------------------
*/
export const verifyToken = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    await api.get("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch {
    logout(); // token expired / invalid — clear it
    return false;
  }
};
