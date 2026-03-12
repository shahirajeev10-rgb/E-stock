import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbaar from "../Navbar";
import Footer from "../Footer";
import { requestPasswordReset, resetPassword } from "../../api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [requestMsg, setRequestMsg] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = String(searchParams.get("token") || "").trim();
    const emailFromUrl = String(searchParams.get("email") || "").trim();

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setResetMsg("Reset link detected. Set your new password below.");
    }

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      setRequestLoading(true);
      setRequestError("");
      setRequestMsg("");
      const res = await requestPasswordReset({ email: email.trim().toLowerCase() });
      const previewToken = res?.previewToken;
      const deliveryMode = res?.delivery?.mode;
      setRequestMsg(
        previewToken
          ? `Preview reset token: ${previewToken}`
          : deliveryMode === "smtp"
            ? "If the email exists, a reset link has been sent. Check your inbox and spam folder."
          : deliveryMode === "disabled"
            ? "Password reset delivery is disabled in this environment. Use preview mode locally or configure a mail provider."
            : res?.message || "If your email exists, a reset token was generated."
      );
    } catch (err) {
      setRequestError(err.message || "Unable to request password reset.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setResetLoading(true);
      setResetError("");
      setResetMsg("");
      await resetPassword({
        token: token.trim(),
        password,
      });
      setResetMsg("Password reset successful. Redirecting to dashboard...");
      window.setTimeout(() => navigate("/dashboard", { replace: true }), 900);
    } catch (err) {
      setResetError(err.message || "Unable to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <Navbaar />
      <section
        className="py-5"
        style={{
          minHeight: "70vh",
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 45%), linear-gradient(135deg,#f8fbff 0%, #eef4ff 55%, #ecfdf5 100%)",
        }}
      >
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-lg-6">
              <div
                className="bg-white rounded-4 shadow-sm p-4"
                style={{ border: "1px solid rgba(15,23,42,0.08)" }}
              >
                <h4 className="fw-bold mb-2">Forgot password</h4>
                <p className="text-muted small mb-3">
                  Step 1: request a reset link by email. In preview mode, the token is shown here for local testing.
                </p>
                <form onSubmit={handleRequest} className="d-grid gap-3">
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {requestMsg && <div className="alert alert-success py-2">{requestMsg}</div>}
                  {requestError && <div className="alert alert-danger py-2">{requestError}</div>}
                  <button className="btn btn-primary" disabled={requestLoading}>
                    {requestLoading ? "Requesting..." : "Request reset token"}
                  </button>
                </form>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div
                className="bg-white rounded-4 shadow-sm p-4"
                style={{ border: "1px solid rgba(15,23,42,0.08)" }}
              >
                <h4 className="fw-bold mb-2">Reset password</h4>
                <p className="text-muted small mb-3">
                  Step 2: open the reset link from your email or paste the token manually, then set your new password.
                </p>
                <form onSubmit={handleReset} className="d-grid gap-3">
                  <div>
                    <label className="form-label">Reset token</label>
                    <input
                      className="form-control"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">New password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  {resetMsg && <div className="alert alert-success py-2">{resetMsg}</div>}
                  {resetError && <div className="alert alert-danger py-2">{resetError}</div>}
                  <button className="btn btn-dark" disabled={resetLoading}>
                    {resetLoading ? "Resetting..." : "Reset password"}
                  </button>
                </form>
                <div className="small text-muted mt-3">
                  <Link to="/home">Back to home</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
