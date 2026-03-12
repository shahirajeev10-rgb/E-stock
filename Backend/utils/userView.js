function sanitizeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    preferredCurrency: user.preferredCurrency,
    country: user.country,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  sanitizeUser,
};
