const express = require("express");
const {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { createRateLimiter } = require("../utils/rateLimit");

const router = express.Router();
const authWriteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Too many auth attempts. Please try again in 15 minutes.",
});

router.post("/register", authWriteLimiter, register);
router.post("/login", authWriteLimiter, login);
router.post("/logout", logout);
router.post("/forgot-password", authWriteLimiter, forgotPassword);
router.post("/reset-password", authWriteLimiter, resetPassword);
router.get("/me", me);

module.exports = router;
