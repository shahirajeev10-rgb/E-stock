const User = require("../model/User");
const { resolveUserId } = require("../utils/requestUser");
const { sanitizeUser } = require("../utils/userView");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function getProfile(req, res) {
  try {
    const access = resolveUserId(req);
    if (!access.ok) {
      return res.status(access.status).json({
        ok: false,
        message: access.message,
      });
    }

    const user = await User.findById(access.userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found.",
      });
    }

    return res.json({
      ok: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

async function updateProfile(req, res) {
  try {
    const access = resolveUserId(req);
    if (!access.ok) {
      return res.status(access.status).json({
        ok: false,
        message: access.message,
      });
    }

    const user = await User.findById(access.userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found.",
      });
    }

    const body = req.body || {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2 || name.length > 80) {
        return res.status(400).json({
          ok: false,
          message: "Name must be between 2 and 80 characters.",
        });
      }
      user.name = name;
    }

    if (body.email !== undefined) {
      const email = normalizeEmail(body.email);
      if (!email || !email.includes("@")) {
        return res.status(400).json({
          ok: false,
          message: "Valid email is required.",
        });
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      }).select("_id");

      if (existingUser) {
        return res.status(409).json({
          ok: false,
          message: "An account with this email already exists.",
        });
      }

      user.email = email;
    }

    if (body.preferredCurrency !== undefined) {
      const preferredCurrency = String(body.preferredCurrency).trim().toUpperCase();
      const allowedCurrencies = ["GBP", "USD", "EUR", "INR"];

      if (!allowedCurrencies.includes(preferredCurrency)) {
        return res.status(400).json({
          ok: false,
          message: "Preferred currency must be one of GBP, USD, EUR, or INR.",
        });
      }

      user.preferredCurrency = preferredCurrency;
    }

    if (body.country !== undefined) {
      const country = String(body.country).trim();
      if (!country || country.length > 60) {
        return res.status(400).json({
          ok: false,
          message: "Country must be between 1 and 60 characters.",
        });
      }
      user.country = country;
    }

    if (body.onboardingCompleted !== undefined) {
      user.onboardingCompleted = Boolean(body.onboardingCompleted);
    }

    await user.save();

    return res.json({
      ok: true,
      message: "Profile updated.",
      user: sanitizeUser(user),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        ok: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
