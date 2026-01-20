import React from "react";

function Stats() {
  return (
    <section className="py-5" style={{ background: "linear-gradient(135deg,#f7f9fc,#eef4ff)" }}>
      <div className="container">
        <div className="row align-items-center g-5">
          
          {/* Left */}
          <div className="col-12 col-lg-6">
            <span
              className="badge rounded-pill text-bg-primary px-3 py-2"
              style={{ letterSpacing: "0.5px" }}
            >
              Learning Path
            </span>

            <h2 className="fw-bold mt-3 mb-2">
              Learn Stock Trading with Clarity
            </h2>

            <p className="text-muted mb-4" style={{ maxWidth: "520px" }}>
              eStock helps beginners learn stock trading through structured lessons
              and risk-free practice, so users build confidence before investing real money.
            </p>

            {/* Quick stats (unique + professional) */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-4">
                <div className="bg-white rounded-4 shadow-sm p-3 text-center">
                  <div className="fw-bold fs-5">10+</div>
                  <div className="text-muted small">Learning Modules</div>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="bg-white rounded-4 shadow-sm p-3 text-center">
                  <div className="fw-bold fs-5">0%</div>
                  <div className="text-muted small">Real-Money Risk</div>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="bg-white rounded-4 shadow-sm p-3 text-center">
                  <div className="fw-bold fs-5">Step-by-step</div>
                  <div className="text-muted small">Guided Journey</div>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="d-grid gap-3">
              {[
                {
                  title: "📘 Learn Stock Basics",
                  desc: "Stocks, prices, profit/loss, and market behaviour explained simply."
                },
                {
                  title: "📈 Understand Market Trends",
                  desc: "Learn how trends form and how price movement works over time."
                },
                {
                  title: "🧪 Risk-Free Practice",
                  desc: "Use virtual trading to practice decisions without real money."
                },
                {
                  title: "🎯 Build Confidence",
                  desc: "Gain confidence through guided learning before real investing."
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-4 shadow-sm"
                  style={{
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "default"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <div className="fw-semibold">{item.title}</div>
                  <div className="text-muted small">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-4 d-flex gap-2 flex-wrap">
              <button className="btn btn-primary btn-lg px-4">
                Start Learning
              </button>
              <button className="btn btn-outline-secondary btn-lg px-4">
                Try Simulation
              </button>
            </div>

            {/* Unique line (small but nice) */}
            <div className="text-muted small mt-3">
              Designed for beginners • Clear explanations • Practice before investing
            </div>
          </div>

          {/* Right */}
          <div className="col-12 col-lg-6 text-center">
            <div className="bg-white rounded-4 shadow-sm p-3 p-md-4">
              <img
                src="/media/d11000ebe1b5dd2c558f7a670e73aac66dbb0456d8afa87639edc613be626879.png"
                alt="eStock learning infographic"
                className="img-fluid rounded-3"
                style={{ maxHeight: "360px", objectFit: "contain", width: "100%" }}
              />
            </div>

            <div className="text-muted small mt-2">
              Visual overview of the eStock learning journey.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Stats;