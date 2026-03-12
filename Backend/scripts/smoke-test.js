const assert = require("assert");

function mustLoad(label, loader) {
  const mod = loader();
  assert.ok(mod, `${label} did not load`);
  return mod;
}

mustLoad("authController", () => require("../controllers/authController"));
mustLoad("profileController", () => require("../controllers/profileController"));
mustLoad("supportController", () => require("../controllers/supportController"));
mustLoad("progressController", () => require("../controllers/progressController"));
mustLoad("holdingController", () => require("../controllers/holdingController"));
mustLoad("tradeController", () => require("../controllers/tradeController"));
mustLoad("dashboardController", () => require("../controllers/dashboardController"));

mustLoad("authRoutes", () => require("../routes/authRoutes"));
mustLoad("profileRoutes", () => require("../routes/profileRoutes"));
mustLoad("supportRoutes", () => require("../routes/supportRoutes"));
mustLoad("progressRoutes", () => require("../routes/progressRoutes"));
mustLoad("holdingRoutes", () => require("../routes/holdingRoutes"));
mustLoad("tradeRoutes", () => require("../routes/tradeRoutes"));
mustLoad("dashboardRoutes", () => require("../routes/dashboardRoutes"));

console.log("Backend smoke test passed.");
