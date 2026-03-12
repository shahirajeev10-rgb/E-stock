import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbaar from "../Navbar";
import Footer from "../Footer";
import { auth } from "../auth";

function Signup() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isLoggedIn()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const styles = {
    page: {
      minHeight: "85vh",
      background:
        "radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 45%), radial-gradient(circle at bottom right, rgba(34,197,94,0.18), transparent 45%), linear-gradient(135deg,#f8fbff 0%, #eef4ff 55%, #ecfdf5 100%)",
    },
    leftCard: {
      borderRadius: "18px",
      padding: "28px",
      background:
        "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(34,197,94,0.14))",
      border: "1px solid rgba(255,255,255,0.55)",
      boxShadow: "0 22px 55px rgba(15,23,42,0.10)",
      backdropFilter: "blur(10px)",
      color: "#0f172a",
    },
    greet: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontWeight: 700,
      fontSize: "1.2rem",
      marginBottom: "8px",
    },
    welcome: {
      fontWeight: 900,
      fontSize: "2.1rem",
      lineHeight: 1.1,
      marginBottom: "10px",
    },
    mini: {
      color: "#1f2937",
      opacity: 0.9,
      fontSize: "1rem",
      marginBottom: "18px",
    },
    dotRow: { display: "flex", gap: 10, marginTop: 10 },
    dot: (c) => ({
      width: 10,
      height: 10,
      borderRadius: 999,
      background: c,
      boxShadow: `0 0 0 7px ${c}22`,
    }),
    formWrap: {
      borderRadius: "18px",
      padding: "2px",
      background:
        "linear-gradient(135deg, rgba(37,99,235,0.85), rgba(34,197,94,0.75), rgba(147,51,234,0.65))",
      boxShadow: "0 24px 60px rgba(15,23,42,0.14)",
    },
    formCard: {
      borderRadius: "16px",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)",
      padding: "26px",
    },
    title: { fontWeight: 900, color: "#0f172a" },
    subtitle: { color: "#64748b" },
    input: { borderRadius: "12px" },
    primaryBtn: {
      borderRadius: "12px",
      border: "none",
      background: "linear-gradient(135deg,#2563eb,#22c55e)",
      boxShadow: "0 14px 30px rgba(37,99,235,0.22)",
      transition:
        "transform 200ms ease, box-shadow 200ms ease, filter 200ms ease",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const fullName = `${firstName} ${middleName} ${lastName}`
      .replace(/\s+/g, " ")
      .trim();

    if (!agree) {
      setError("Please accept the Terms & Privacy Policy.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await auth.register({
        name: fullName || firstName.trim() || "Learner",
        email: cleanEmail,
        password,
        preferredCurrency: "GBP",
        country: "UK",
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbaar />

      <section className="py-5" style={styles.page}>
        <div className="container">
          <div className="row justify-content-center align-items-stretch g-4">
            <div className="col-12 col-lg-5">
              <div style={styles.leftCard} className="h-100">
                <div style={styles.greet}>{greeting},</div>
                <div style={styles.welcome}>Welcome to the eStock family.</div>
                <div style={styles.mini}>
                  Create your account and start learning today.
                </div>

                <div style={styles.dotRow}>
                  <span style={styles.dot("#2563eb")} />
                  <span style={styles.dot("#22c55e")} />
                  <span style={styles.dot("#9333ea")} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div style={styles.formWrap} className="h-100">
                <div style={styles.formCard} className="h-100">
                  <div className="text-center mb-4">
                    <h3 className="mb-1" style={styles.title}>
                      Create your account
                    </h3>
                    <p className="mb-0" style={styles.subtitle}>
                      Quick signup to get started.
                    </p>
                  </div>

                  <form className="row g-3" onSubmit={handleSubmit}>
                    {error && (
                      <div className="col-12">
                        <div className="alert alert-danger py-2 small mb-2">
                          {error}
                        </div>
                      </div>
                    )}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        First name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        style={styles.input}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Middle{" "}
                        <span className="text-muted fw-normal">(opt)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        style={styles.input}
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Last name</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        style={styles.input}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        style={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Password</label>
                      <div className="input-group input-group-lg">
                        <input
                          type={showPass ? "text" : "password"}
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPass((v) => !v)}
                        >
                          {showPass ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Confirm password
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          type={showConfirm ? "text" : "password"}
                          className="form-control"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirm((v) => !v)}
                        >
                          {showConfirm ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          required
                        />
                        <label className="form-check-label">
                          I agree to the Terms & Privacy Policy
                        </label>
                      </div>
                    </div>

                    <div className="col-12 d-grid mt-2">
                      <button
                        type="submit"
                        className="btn btn-lg text-white fw-semibold d-flex justify-content-center align-items-center gap-2"
                        style={{
                          ...styles.primaryBtn,
                          opacity: loading ? 0.8 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                        disabled={loading}
                      >
                        {loading && (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          />
                        )}
                        {loading ? "Creating..." : "Create account"}
                      </button>
                    </div>

                    <div className="col-12 text-center mt-2">
                      <p className="mb-0" style={{ color: "#64748b" }}>
                        Already have an account?{" "}
                        <Link
                          to="/"
                          className="fw-semibold text-decoration-none"
                        >
                          Back to Home
                        </Link>
                      </p>
                    </div>
                  </form>
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

export default Signup;
