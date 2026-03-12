const nodemailer = require("nodemailer");

function hasSmtpConfig() {
  return [
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
    process.env.SMTP_USER,
    process.env.SMTP_PASS,
    process.env.MAIL_FROM,
  ].every((value) => String(value || "").trim().length > 0);
}

function getResetDeliveryMode() {
  const explicit = String(process.env.PASSWORD_RESET_MODE || "").trim().toLowerCase();
  if (explicit === "preview" || explicit === "disabled" || explicit === "smtp") {
    return explicit;
  }

  if (hasSmtpConfig()) {
    return "smtp";
  }

  return process.env.NODE_ENV === "production" ? "disabled" : "preview";
}

function buildPasswordResetUrl(token, email) {
  const base =
    String(process.env.PASSWORD_RESET_URL || "").trim() ||
    `${String(process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "")}/forgot-password`;

  const url = new URL(base);
  url.searchParams.set("token", token);
  if (email) {
    url.searchParams.set("email", email);
  }
  return url.toString();
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    String(process.env.SMTP_SECURE || "").trim().toLowerCase() === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendResetEmail({ email, token }) {
  if (!hasSmtpConfig()) {
    throw new Error("SMTP configuration is incomplete.");
  }

  const resetUrl = buildPasswordResetUrl(token, email);
  const appName = process.env.APP_NAME || "eStock";
  const from = process.env.MAIL_FROM;

  const transporter = createTransporter();

  await transporter.sendMail({
    from,
    to: email,
    subject: `${appName} password reset`,
    text: [
      `You requested a password reset for ${appName}.`,
      "",
      `Open this link to reset your password:`,
      resetUrl,
      "",
      `If the link does not open, use this reset token: ${token}`,
      "",
      `This link expires in 30 minutes.`,
      `If you did not request this, you can ignore this email.`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
        <h2 style="margin-bottom:12px;">Reset your ${appName} password</h2>
        <p style="line-height:1.6;margin:0 0 12px;">
          You requested a password reset. Click the button below to create a new password.
        </p>
        <p style="margin:24px 0;">
          <a
            href="${resetUrl}"
            style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;"
          >
            Reset password
          </a>
        </p>
        <p style="line-height:1.6;margin:0 0 12px;">
          If the button does not work, paste this link into your browser:
        </p>
        <p style="word-break:break-all;color:#1d4ed8;">${resetUrl}</p>
        <p style="line-height:1.6;margin:16px 0 12px;">
          This reset link expires in 30 minutes.
        </p>
        <p style="font-size:13px;color:#64748b;">
          If you did not request a reset, you can ignore this email.
        </p>
      </div>
    `,
  });

  return resetUrl;
}

async function deliverPasswordReset({ email, token }) {
  const mode = getResetDeliveryMode();

  if (mode === "preview") {
    return {
      mode,
      message:
        "Reset token generated in preview mode. Use the token shown below to complete the reset.",
      previewToken: token,
      previewHint:
        "Preview mode is intended for development and academic demonstration only.",
      recipient: email,
      resetUrl: buildPasswordResetUrl(token, email),
    };
  }

  if (mode === "smtp") {
    const resetUrl = await sendResetEmail({ email, token });
    return {
      mode,
      message: "Password reset email sent. Check your inbox for the reset link.",
      previewToken: null,
      previewHint: "",
      recipient: email,
      resetUrl,
    };
  }

  return {
    mode,
    message:
      "Password reset email delivery is not configured in this environment. Configure SMTP or use preview mode locally.",
    previewToken: null,
    previewHint: "",
    recipient: email,
    resetUrl: null,
  };
}

module.exports = {
  buildPasswordResetUrl,
  deliverPasswordReset,
  getResetDeliveryMode,
  hasSmtpConfig,
};
