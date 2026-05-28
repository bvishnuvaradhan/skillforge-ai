const API_BASE_URL = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env && globalThis.process.env.NEXT_PUBLIC_API_BASE_URL)
  ? globalThis.process.env.NEXT_PUBLIC_API_BASE_URL
  : "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Generic API object for CRUD operations
export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

// Legacy individual exports
export function login(payload) {
  return api.post("/auth/login", payload);
}

export function signup(payload) {
  return api.post("/auth/signup", payload);
}

export function getMe() {
  return api.get("/auth/me");
}

export function updateProfile(payload) {
  return api.patch("/auth/profile", payload);
}

export function logout() {
  return api.post("/auth/logout");
}
