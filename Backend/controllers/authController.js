const User = require("../model/User");
const crypto = require("crypto");
const {
  clearSessionCookie,
  getSessionUserId,
  setSessionCookie,
} = require("../utils/sessionAuth");
const { deliverPasswordReset } = require("../utils/passwordResetDelivery");
const { sanitizeUser } = require("../utils/userView");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

async function authenticateUser(email, password) {
  return new Promise((resolve, reject) => {
    User.authenticate()(email, password, (err, user, details) => {
      if (err) return reject(err);
      if (!user) {
        return resolve({
          user: null,
          message: details?.message || "Invalid email or password.",
        });
      }

      return resolve({ user, message: "" });
    });
  });
}

async function register(req, res) {
  try {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (name.length < 2) {
      return res.status(400).json({
        ok: false,
        message: "Name must be at least 2 characters.",
      });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        ok: false,
        message: "Valid email is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const user = new User({
      name,
      email,
      preferredCurrency: body.preferredCurrency || "GBP",
      country: body.country || "UK",
    });

    const registeredUser = await User.register(user, password);
    setSessionCookie(res, registeredUser._id);

    return res.status(201).json({
      ok: true,
      message: "Account created.",
      user: sanitizeUser(registeredUser),
    });
  } catch (err) {
    if (err?.name === "UserExistsError" || err?.code === 11000) {
      return res.status(409).json({
        ok: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function login(req, res) {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email and password are required.",
      });
    }

    const { user, message } = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ ok: false, message });
    }

    setSessionCookie(res, user._id);

    return res.json({
      ok: true,
      message: "Login successful.",
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function me(req, res) {
  try {
    const userId = getSessionUserId(req);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Not authenticated.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({
        ok: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.json({
      ok: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function logout(req, res) {
  clearSessionCookie(res);
  return res.json({ ok: true, message: "Logged out." });
}

async function forgotPassword(req, res) {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        ok: false,
        message: "Valid email is required.",
      });
    }

    const user = await User.findOne({ email }).select(
      "+resetPasswordTokenHash +resetPasswordExpiresAt"
    );

    let resetToken = null;
    if (user) {
      resetToken = crypto.randomBytes(24).toString("hex");
      user.resetPasswordTokenHash = hashResetToken(resetToken);
      user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
    }

    let delivery = {
      mode: "silent",
      message: "If the email exists, a password reset token has been generated.",
      previewToken: null,
      previewHint: "",
      recipient: email,
    };

    if (user) {
      try {
        delivery = await deliverPasswordReset({ email, token: resetToken });
      } catch (deliveryErr) {
        return res.status(500).json({
          ok: false,
          message:
            "Unable to send password reset email right now. Check your email settings and try again.",
        });
      }
    }

    return res.json({
      ok: true,
      message: user ? delivery.message : "If the email exists, a password reset token has been generated.",
      delivery: {
        mode: delivery.mode,
        recipient: delivery.recipient,
        previewHint: delivery.previewHint,
      },
      ...(delivery.previewToken
        ? {
            previewToken: delivery.previewToken,
          }
        : {}),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const body = req.body || {};
    const token = String(body.token || "").trim();
    const password = String(body.password || "");

    if (!token) {
      return res.status(400).json({
        ok: false,
        message: "Reset token is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const tokenHash = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select("+resetPasswordTokenHash +resetPasswordExpiresAt");

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "Reset token is invalid or expired.",
      });
    }

    await user.setPassword(password);
    user.resetPasswordTokenHash = "";
    user.resetPasswordExpiresAt = null;
    await user.save();
    setSessionCookie(res, user._id);

    return res.json({
      ok: true,
      message: "Password reset successful.",
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
};
