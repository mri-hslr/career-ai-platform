
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.114:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  // 1. Setup Headers
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 2. Automatic Content-Type handling
  // Fetch handles FormData boundary automatically if Content-Type is NOT set.
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    // 3. Handle Unauthorized (Token Expired)
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // Use replace to prevent back-button loops
      window.location.replace("/signin");
      return Promise.reject(new Error("Session expired. Please sign in again."));
    }

    // 4. Handle Non-OK Responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.detail || errorData?.message || `Error ${response.status}`;
      throw new Error(message);
    }

    // 5. Parse JSON Safely
    const result = await response.json();

    /**
     * PRODUCTION NOTE: 
     * If your backend returns { success: true, data: { ... } }, 
     * you might want to return result.data here to flatten the response.
     * For now, we return the whole result.
     */
    return result;

  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${path}:`, error.message);
    throw error;
  }
}

export const apiClient = {
  get: (path, options = {}) => 
    request(path, { ...options, method: "GET" }),
  
  post: (path, body, options = {}) => {
    const isFormData = body instanceof FormData;
    return request(path, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: (path, options = {}) => 
    request(path, { ...options, method: "DELETE" }),
};