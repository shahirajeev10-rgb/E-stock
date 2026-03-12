const crypto = require("crypto");

const COOKIE_NAME = "estock_session";
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 7);
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

function parseBoolean(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function getCookieSameSite() {
  const configured = String(process.env.COOKIE_SAME_SITE || "")
    .trim()
    .toLowerCase();

  if (["lax", "strict", "none"].includes(configured)) {
    return configured;
  }

  return process.env.NODE_ENV === "production" ? "none" : "lax";
}

function getCookieSecure(sameSite) {
  const configured = parseBoolean(process.env.COOKIE_SECURE);
  if (configured !== null) return configured;
  return process.env.NODE_ENV === "production" || sameSite === "none";
}

function getCookieDomain() {
  const configured = String(process.env.COOKIE_DOMAIN || "").trim();
  return configured || undefined;
}

function getCookieOptions() {
  const sameSite = getCookieSameSite();
  const secure = getCookieSecure(sameSite);
  const domain = getCookieDomain();

  if (sameSite === "none" && !secure) {
    throw new Error(
      "COOKIE_SECURE must be true when COOKIE_SAME_SITE is set to none."
    );
  }

  const options = {
    httpOnly: true,
    sameSite,
    secure,
    path: "/",
  };

  if (domain) {
    options.domain = domain;
  }

  return options;
}

function getSessionSecret() {
  const configured = String(process.env.SESSION_SECRET || "").trim();
  if (configured.length >= 16) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set with at least 16 characters in production."
    );
  }

  return "estock-dev-session-secret";
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const index = pair.indexOf("=");
      if (index === -1) return acc;
      const key = pair.slice(0, index);
      const value = pair.slice(index + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function sign(data) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(data)
    .digest("base64url");
}

function safeEqual(a, b) {
  const aBuffer = Buffer.from(String(a));
  const bBuffer = Buffer.from(String(b));
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function createSessionToken(userId) {
  const payload = {
    id: String(userId),
    exp: Date.now() + SESSION_TTL_MS,
  };

  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${data}.${sign(data)}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = sign(data);
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload?.id || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSessionUserId(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const session = verifySessionToken(cookies[COOKIE_NAME]);
  return session?.id || null;
}

function setSessionCookie(res, userId) {
  res.cookie(COOKIE_NAME, createSessionToken(userId), {
    maxAge: SESSION_TTL_MS,
    ...getCookieOptions(),
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
  });
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_MS,
  getSessionUserId,
  setSessionCookie,
  clearSessionCookie,
};
