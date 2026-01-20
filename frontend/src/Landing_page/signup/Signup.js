import React, { useState } from "react";
import Navbaar from "../Navbar";
import Footer from "../Footer";

function Signup() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Navbaar />

      <section
        className="py-5"
        style={{
          minHeight: "80vh",
          background:
            "radial-gradient(circle at top left, #dbeafe 0%, #eef2ff 35%, #fce7f3 80%)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-5">

              <div
                className="p-4 p-md-5 rounded-4 shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              >
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: "56px",
                      height: "56px",
                      background: "linear-gradient(135deg,#2563eb,#9333ea)",
                      color: "white",
                      fontSize: "22px",
                      boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
                    }}
                  >
                    e$
                  </div>

                  <h2 className="fw-bold mb-1">Create your eStock account</h2>
                  <p className="text-muted mb-0">
                    Start learning trading with confidence.
                  </p>
                </div>

                <form className="d-grid gap-3">
                  {/* Name */}
                  <div>
                    <label className="form-label fw-semibold">Full name</label>
                    <div className="input-group">
                      <span className="input-group-text">👤</span>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="form-label fw-semibold">Email</label>
                    <div className="input-group">
                      <span className="input-group-text">📧</span>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">🔒</span>
                      <input
                        type={showPass ? "text" : "password"}
                        className="form-control form-control-lg"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="form-label fw-semibold">
                      Confirm password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">✅</span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        className="form-control form-control-lg"
                        placeholder="Repeat password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    className="btn btn-lg text-white fw-semibold"
                    type="button"
                    style={{
                      background: "linear-gradient(135deg,#2563eb,#9333ea)",
                      border: "none",
                      transition: "all 0.25s ease",
                      boxShadow: "0 14px 30px rgba(37,99,235,0.22)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 18px 40px rgba(147,51,234,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 14px 30px rgba(37,99,235,0.22)";
                    }}
                  >
                    Create Account
                  </button>

                  <p className="text-muted small text-center mb-0">
                    Already have an account?{" "}
                    <a href="/login" className="text-decoration-none fw-semibold">
                      Login
                    </a>
                  </p>

                  <p className="text-muted small text-center mb-0">
                    Back to{" "}
                    <a href="/" className="text-decoration-none fw-semibold">
                      Home
                    </a>
                  </p>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Signup;