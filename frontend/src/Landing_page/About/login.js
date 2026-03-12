import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../auth"; // ✅ login.js is inside /About so go one level up

export default function Login({ show, onClose }) {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (show) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show, onClose]);

  // Stop background scroll when modal open
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  // Reset fields when modal opens
  useEffect(() => {
    if (!show) return;
    setEmail("");
    setPassword("");
    setError("");
    setLoading(false);
    setShowPass(false);
  }, [show]);

  if (!show) return null;

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await auth.signin({
        email: cleanEmail,
        password,
      });

      onClose?.();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    onClose?.();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="loginBackdrop" onClick={onClose} />

      {/* Modal */}
      <div className="loginWrap" role="dialog" aria-modal="true">
        <div
          className="loginModal border-0 rounded-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="loginHeader px-4 pt-4 pb-3">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <div className="logoBubble mb-2">e$</div>
                <h5 className="fw-bold mb-1">Welcome back</h5>
                <div className="text-muted small">
                  Login to continue your learning journey.
                </div>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            <form className="d-grid gap-3" onSubmit={handleLogin}>
              {/* Error */}
              {error && (
                <div
                  className="alert alert-danger py-2 mb-0"
                  style={{ borderRadius: 12, fontWeight: 700 }}
                >
                  {error}
                </div>
              )}

              <div>
                <label className="form-label fw-semibold">Email</label>
                <div className="input-group inputGroupPremium">
                  <span className="input-group-text bg-white border-end-0">
                    📧
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-lg border-start-0"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label fw-semibold">Password</label>
                <div className="input-group inputGroupPremium">
                  <span className="input-group-text bg-white border-end-0">
                    🔒
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control form-control-lg border-start-0 border-end-0"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3"
                    onClick={() => setShowPass((s) => !s)}
                    disabled={loading}
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="rememberMe"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-decoration-none fw-semibold"
                  style={{ color: "#2f6fed" }}
                  onClick={onClose}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-lg fw-semibold text-white loginPrimary"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="dividerLine my-1">
                <span>or</span>
              </div>

              <button
                type="button"
                className="btn btn-outline-dark btn-lg fw-semibold"
                onClick={handleGuest}
                disabled={loading}
              >
                Continue as Guest
              </button>

              <div className="text-center text-muted small mt-1">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-decoration-none fw-semibold"
                  style={{ color: "#198754" }}
                  onClick={onClose}
                >
                  Open one
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .loginBackdrop{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          z-index: 2000;
          animation: fadeIn .15s ease;
        }

        .loginWrap{
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          z-index: 2001;
          padding: 16px;
        }

        .loginModal{
          width: 100%;
          max-width: 520px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          box-shadow: 0 25px 60px rgba(0,0,0,0.18);
          animation: popIn .18s ease;
        }

        .loginHeader{
          background: linear-gradient(135deg, rgba(47,111,237,0.16), rgba(123,97,255,0.10), rgba(25,135,84,0.10));
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .logoBubble{
          width: 44px; height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg,#2f6fed,#7b61ff);
          color: white;
          font-weight: 800;
          box-shadow: 0 12px 26px rgba(47,111,237,0.25);
        }

        .inputGroupPremium .form-control:focus{ box-shadow: none; }
        .inputGroupPremium{
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
        }
        .inputGroupPremium .input-group-text,
        .inputGroupPremium .form-control,
        .inputGroupPremium .btn{
          border-color: rgba(0,0,0,0.10);
        }

        .loginPrimary{
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg,#2f6fed,#7b61ff);
          box-shadow: 0 14px 30px rgba(47,111,237,0.22);
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .loginPrimary:hover{
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(123,97,255,0.24);
        }

        .dividerLine{
          position: relative;
          text-align: center;
          color: rgba(0,0,0,0.45);
          font-size: 12px;
        }
        .dividerLine::before,
        .dividerLine::after{
          content: "";
          position: absolute;
          top: 50%;
          width: 46%;
          height: 1px;
          background: rgba(0,0,0,0.10);
        }
        .dividerLine::before{ left: 0; }
        .dividerLine::after{ right: 0; }
        .dividerLine span{
          background: rgba(255,255,255,0.92);
          padding: 0 10px;
        }

        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn { from{opacity:0; transform: translateY(8px) scale(.98)} to{opacity:1; transform:none} }
      `}</style>
    </>
  );
}
