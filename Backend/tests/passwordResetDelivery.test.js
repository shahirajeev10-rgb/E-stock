const test = require("node:test");
const assert = require("node:assert/strict");

const modulePath = require.resolve("../utils/passwordResetDelivery");

function withEnv(overrides, run) {
  const previous = {
    PASSWORD_RESET_MODE: process.env.PASSWORD_RESET_MODE,
    CLIENT_URL: process.env.CLIENT_URL,
    PASSWORD_RESET_URL: process.env.PASSWORD_RESET_URL,
    NODE_ENV: process.env.NODE_ENV,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_SECURE: process.env.SMTP_SECURE,
    MAIL_FROM: process.env.MAIL_FROM,
  };

  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      delete process.env[key];
    } else {
      process.env[key] = String(value);
    }
  });

  delete require.cache[modulePath];

  try {
    return run(require("../utils/passwordResetDelivery"));
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
    delete require.cache[modulePath];
  }
}

test("defaults to preview mode locally when SMTP is not configured", () => {
  withEnv(
    {
      NODE_ENV: "development",
      PASSWORD_RESET_MODE: undefined,
      SMTP_HOST: undefined,
      SMTP_PORT: undefined,
      SMTP_USER: undefined,
      SMTP_PASS: undefined,
      MAIL_FROM: undefined,
    },
    ({ getResetDeliveryMode }) => {
      assert.equal(getResetDeliveryMode(), "preview");
    }
  );
});

test("auto-detects smtp mode when mail settings exist", () => {
  withEnv(
    {
      NODE_ENV: "production",
      PASSWORD_RESET_MODE: undefined,
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "587",
      SMTP_USER: "demo",
      SMTP_PASS: "secret",
      MAIL_FROM: "eStock <no-reply@example.com>",
    },
    ({ getResetDeliveryMode, hasSmtpConfig }) => {
      assert.equal(hasSmtpConfig(), true);
      assert.equal(getResetDeliveryMode(), "smtp");
    }
  );
});

test("buildPasswordResetUrl appends token and email to the frontend reset route", () => {
  withEnv(
    {
      CLIENT_URL: "http://localhost:3000",
      PASSWORD_RESET_URL: undefined,
    },
    ({ buildPasswordResetUrl }) => {
      const url = buildPasswordResetUrl("abc123", "student@example.com");
      assert.equal(
        url,
        "http://localhost:3000/forgot-password?token=abc123&email=student%40example.com"
      );
    }
  );
});
