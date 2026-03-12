const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const {
  COOKIE_NAME,
  getSessionUserId,
  setSessionCookie,
} = require("../utils/sessionAuth");
const { resolveUserId } = require("../utils/requestUser");

function createMockResponse() {
  return {
    cookieName: "",
    cookieValue: "",
    cookie(name, value) {
      this.cookieName = name;
      this.cookieValue = value;
    },
  };
}

function buildRequestFromResponse(res, extra = {}) {
  return {
    headers: {
      cookie: `${res.cookieName}=${res.cookieValue}`,
    },
    query: {},
    body: {},
    params: {},
    ...extra,
  };
}

test("session cookie round-trips back to the same user id", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const res = createMockResponse();

  setSessionCookie(res, userId);

  assert.equal(res.cookieName, COOKIE_NAME);
  assert.ok(res.cookieValue);

  const req = buildRequestFromResponse(res);
  assert.equal(getSessionUserId(req), userId);
});

test("resolveUserId accepts the authenticated session user", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const res = createMockResponse();

  setSessionCookie(res, userId);

  const req = buildRequestFromResponse(res, {
    query: { userId },
  });

  const result = resolveUserId(req);
  assert.equal(result.ok, true);
  assert.equal(result.userId, userId);
});

test("resolveUserId rejects mismatched user ids", () => {
  const sessionUserId = new mongoose.Types.ObjectId().toString();
  const requestedUserId = new mongoose.Types.ObjectId().toString();
  const res = createMockResponse();

  setSessionCookie(res, sessionUserId);

  const req = buildRequestFromResponse(res, {
    query: { userId: requestedUserId },
  });

  const result = resolveUserId(req);
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

test("tampered cookies are treated as unauthenticated", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const res = createMockResponse();

  setSessionCookie(res, userId);

  const tampered = `${res.cookieValue.slice(0, -1)}x`;
  const req = {
    headers: {
      cookie: `${COOKIE_NAME}=${tampered}`,
    },
    query: {},
    body: {},
    params: {},
  };

  assert.equal(getSessionUserId(req), null);

  const result = resolveUserId(req);
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
});
