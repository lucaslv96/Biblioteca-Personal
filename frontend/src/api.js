const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" && body.detail ? body.detail : "Request failed";
    throw new Error(message);
  }

  return body;
}

export function getHealth() {
  return request("/api/v1/health");
}

export function createUser(user) {
  return request("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function loginUser(credentials) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export { API_BASE_URL };
