const mongoose = require("mongoose");
const { getSessionUserId } = require("./sessionAuth");

function extractRequestedUserId(req) {
  const body = req.body || {};
  return (
    req.query.userId ||
    body.userId ||
    req.params.userId ||
    req.headers["x-user-id"] ||
    null
  );
}

function validateUserId(userId) {
  return mongoose.Types.ObjectId.isValid(userId);
}

function resolveUserId(req) {
  const sessionUserId = getSessionUserId(req);
  const requestedUserId = extractRequestedUserId(req);

  if (!sessionUserId) {
    return {
      userId: null,
      ok: false,
      status: 401,
      message: "Not authenticated.",
    };
  }

  if (
    requestedUserId &&
    String(sessionUserId) !== String(requestedUserId)
  ) {
    return {
      userId: null,
      ok: false,
      status: 403,
      message: "Authenticated user does not match requested userId.",
    };
  }

  const resolved = sessionUserId;

  if (!validateUserId(resolved)) {
    return {
      userId: null,
      ok: false,
      status: 400,
      message: "Valid userId is required.",
    };
  }

  return {
    userId: resolved,
    ok: true,
  };
}

module.exports = {
  validateUserId,
  resolveUserId,
};
