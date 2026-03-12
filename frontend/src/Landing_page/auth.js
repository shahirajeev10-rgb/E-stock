import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/client";

const STORAGE_KEY = "estock_user";

function isValidObjectId(value) {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;

  const next = { ...user };
  const existingId = next.id || next._id;

  if (isValidObjectId(existingId)) {
    next.id = existingId;
  } else {
    delete next.id;
  }

  delete next._id;
  return next;
}

function saveUser(user) {
  const normalized = normalizeUser(user);
  if (!normalized) return null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export const auth = {
  login(user) {
    return saveUser(user);
  },

  async register(payload) {
    const res = await registerUser(payload);
    return saveUser(res.user || res.data);
  },

  async signin(payload) {
    const res = await loginUser(payload);
    return saveUser(res.user || res.data);
  },

  async hydrate() {
    try {
      const res = await fetchCurrentUser();
      return saveUser(res.user || res.data);
    } catch {
      clearStoredUser();
      return null;
    }
  },

  async logout() {
    try {
      await logoutUser();
    } catch {
      // Clear local state even if the backend is unavailable.
    } finally {
      clearStoredUser();
    }
  },

  getUser() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeUser(parsed);

      if (!normalized) {
        clearStoredUser();
        return null;
      }

      if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }

      return normalized;
    } catch {
      clearStoredUser();
      return null;
    }
  },

  getUserId() {
    const user = this.getUser();
    return user?.id || null;
  },

  isLoggedIn() {
    return !!this.getUser();
  },
};
