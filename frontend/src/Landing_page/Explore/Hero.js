import React from "react";
import useReveal from "../../hooks/useReveal";

function Hero() {
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      className={`py-5 reveal ${visible ? "show" : ""}`}
      style={{
        background: "linear-gradient(135deg, #f8fbff, #eef4ff)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center text-center">
          <div className="col-12 col-md-9 col-lg-7">
            <img
              src="/media/img1.jpg"
              alt="Stock learning illustration"
              className="img-fluid mb-4 rounded-4 shadow-sm"
              style={{
                maxHeight: "420px",
                objectFit: "contain",
                animation: "fadeUp 0.8s ease-out",
              }}
            />

            <h1 className="fw-bold mt-3" style={{ lineHeight: "1.2" }}>
              Grow Your Wealth, <br />
              <span className="text-primary">Secure Your Dream</span>
            </h1>

            <p className="text-muted mt-3 fs-5">
              Learn stock market fundamentals through guided lessons and
              risk-free trading practice.
            </p>

            <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
              <button
                className="btn btn-primary btn-lg px-4"
                style={{ transition: "all 0.25s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(13,110,253,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Sign Up Free
              </button>

              <a href="#stats" className="btn btn-outline-secondary btn-lg px-4">
                Explore Learning
              </a>
            </div>

            <div className="d-flex justify-content-center gap-4 mt-5 text-muted small flex-wrap">
              <span>✔ Beginner Friendly</span>
              <span>✔ Risk-Free Simulation</span>
              <span>✔ No Real Money Required</span>
            </div>

            <div className="mt-4 text-muted small">
              Scroll to see how eStock works ↓
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

export default Hero;