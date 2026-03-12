import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./auth";

function OpenAccount() {
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isLoggedIn()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <section
      id="open-account"
      className="py-5"
      style={{
        background:
          "radial-gradient(circle at top left, #eef4ff 0%, #ffffff 55%, #eafff2 100%)",
      }}
    >
      <div className="container text-center">

        <span
          className="badge rounded-pill mb-3"
          style={{
            background: "rgba(25,135,84,0.12)",
            color: "#198754",
            padding: "8px 14px",
          }}
        >
          GET STARTED
        </span>

        <h2 className="fw-bold mb-3" style={{ fontSize: "2.2rem" }}>
          Ready to start learning the market?
        </h2>

        <p className="text-muted mb-4" style={{ maxWidth: 700, margin: "0 auto" }}>
          Create your eStock account and unlock structured lessons,
          interactive simulations, and guided learning — built for beginners.
        </p>

        <Link
          to="/signup"
          className="btn btn-lg px-5 fw-semibold text-white"
          style={{
            borderRadius: 14,
            background: "linear-gradient(135deg,#2f6fed,#7b61ff)",
            border: "none",
            boxShadow: "0 18px 40px rgba(47,111,237,0.22)",
          }}
        >
          Create Your Account →
        </Link>

      </div>
    </section>
  );
}

export default OpenAccount;