const configuredApiBase = String(process.env.REACT_APP_API_URL || "").replace(
  /\/+$/,
  ""
);

function resolveApiBase() {
  if (typeof window === "undefined") {
    return configuredApiBase || "http://localhost:3002";
  }

  const isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

  if (process.env.NODE_ENV === "production" && !isLocalHost) {
    return "";
  }

  return configuredApiBase || "http://localhost:3002";
}

const API_BASE = resolveApiBase();

function withQuery(path, extraParams = {}) {
  const params = new URLSearchParams();

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function parseResponse(res) {
  const text = await res.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message = payload?.message || `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  return parseResponse(res);
}

export function getApiBase() {
  return API_BASE;
}

export async function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutUser() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export async function fetchCurrentUser() {
  return request("/api/auth/me");
}

export async function requestPasswordReset(payload) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload) {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchDashboardData() {
  return request("/api/dashboard");
}

export async function fetchProfile() {
  return request("/api/profile");
}

export async function updateProfile(payload) {
  return request("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchHoldings() {
  return request("/api/holdings");
}

export async function seedHoldings(replace = false) {
  return request("/api/holdings/seed", {
    method: "POST",
    body: JSON.stringify({ replace }),
  });
}

export async function createHolding(payload) {
  return request("/api/holdings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateHolding(holdingId, payload) {
  return request(`/api/holdings/${holdingId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteHolding(holdingId) {
  return request(`/api/holdings/${holdingId}`, {
    method: "DELETE",
  });
}

export async function fetchTrades(limit = 40) {
  return request(withQuery("/api/trades", { limit }));
}

export async function fetchTradeSummary() {
  return request("/api/trades/summary");
}

export async function createTrade(payload) {
  return request("/api/trades", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPracticeAccount(reseed = true) {
  return request("/api/trades/reset", {
    method: "POST",
    body: JSON.stringify({ reseed }),
  });
}

export async function fetchLessonProgress() {
  return request("/api/progress");
}

export async function fetchLessonProgressItem(lessonKey) {
  return request(`/api/progress/${lessonKey}`);
}

export async function saveLessonProgress(lessonKey, payload = {}) {
  return request(`/api/progress/${lessonKey}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createSupportTicket(payload) {
  return request("/api/support", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSupportTickets(status = "") {
  return request(withQuery("/api/support", { status }));
}

export async function fetchMySupportTickets() {
  return request("/api/support/mine");
}

export async function fetchSupportTicket(ticketId) {
  return request(`/api/support/${ticketId}`);
}

export async function updateSupportTicket(ticketId, payload) {
  return request(`/api/support/${ticketId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
