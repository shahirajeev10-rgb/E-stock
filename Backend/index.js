const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const holdingRoutes = require("./routes/holdingRoutes");
const profileRoutes = require("./routes/profileRoutes");
const progressRoutes = require("./routes/progressRoutes");
const supportRoutes = require("./routes/supportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const tradeRoutes = require("./routes/tradeRoutes");

dotenv.config();

const app = express();

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const clientOrigins = Array.from(
  new Set([
    ...splitCsv(process.env.CLIENT_URL),
    ...splitCsv(process.env.CLIENT_URLS),
  ])
);

const localOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3003",
];

const allowedOrigins = Array.from(
  new Set([
    ...clientOrigins,
    ...(process.env.NODE_ENV === "production" ? [] : localOrigins),
  ])
);

function isAllowedLocalOrigin(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      isAllowedLocalOrigin(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({
    ok: true,
    db: connected ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/holdings", holdingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trades", tradeRoutes);

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

async function startServer() {
  if (!MONGO_URI) {
    throw new Error("Missing MongoDB URI. Add MONGO_URI or MONGO_URL in .env");
  }

  if (
    process.env.NODE_ENV === "production" &&
    String(process.env.SESSION_SECRET || "").trim().length < 16
  ) {
    throw new Error("SESSION_SECRET must be at least 16 characters in production.");
  }

  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");

  app.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup error:", err.message);
  process.exit(1);
});
