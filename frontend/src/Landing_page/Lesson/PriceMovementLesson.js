import React from "react";
import { Link } from "react-router-dom";
import Navbaar from "../Navbar";
import Footer from "../Footer";
import useLessonProgress from "./useLessonProgress";

export default function PriceMovementLesson() {
  const lessonProgress = useLessonProgress({
    lessonKey: "price-movement",
    title: "Lesson 2: Price Movement",
    path: "/lessons/price-movement",
    progressPct: 100,
    lastStep: 1,
    totalSteps: 1,
  });

  return (
    <>
      <Navbaar />

      <section
        className="py-5"
        style={{
          minHeight: "70vh",
          background:
            "radial-gradient(circle at top left, #e9fff2 0%, #ffffff 55%, #eef4ff 100%)",
        }}
      >
        <div className="container">
          {/* Header */}
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
            <div>
              <span
                className="badge rounded-pill"
                style={{
                  background: "rgba(25,135,84,0.12)",
                  color: "#198754",
                  padding: "10px 14px",
                  letterSpacing: "0.6px",
                }}
              >
                LESSON 2 • PRICE & MARKET MOVEMENT
              </span>

              <h2 className="fw-bold mt-3 mb-2" style={{ fontSize: "2.2rem" }}>
                Why do prices go up and down?
              </h2>

              <p className="text-muted mb-0" style={{ maxWidth: 760 }}>
                This lesson explains <b>Supply & Demand</b>, how news affects buyers/sellers,
                and where <b>brokers</b> fit in the process.
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <span className="badge rounded-pill text-bg-light border align-self-center">
                Progress {Math.round(lessonProgress.progressPct)}%
              </span>
              <Link to="/" className="btn btn-outline-secondary px-4">
                Back Home
              </Link>
              <Link
                to="/demo/price-movement"
                className="btn btn-success px-4"
                style={{ borderRadius: 12 }}
              >
                Go to Interactive Demo →
              </Link>
            </div>
          </div>

          {/* Intro cards */}
          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div
                className="bg-white rounded-4 shadow-sm p-4 p-md-5 h-100"
                style={{ border: "1px solid rgba(15,23,42,0.06)" }}
              >
                <h4 className="fw-bold mb-3">1) Supply & Demand (the real reason)</h4>

                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                  A stock price changes because of one simple thing:
                  <b> how many people want to buy</b> vs <b>how many people want to sell</b>.
                  If buyers are stronger, the price usually rises. If sellers are stronger,
                  the price usually falls.
                </p>

                <div className="row g-3 mt-2">
                  <div className="col-12 col-md-6">
                    <div
                      className="rounded-4 p-3"
                      style={{
                        background: "rgba(25,135,84,0.08)",
                        border: "1px solid rgba(25,135,84,0.14)",
                      }}
                    >
                      <div className="fw-semibold" style={{ color: "#198754" }}>
                        More buyers than sellers
                      </div>
                      <div className="text-muted small">
                        Demand ↑ → price often goes up.
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div
                      className="rounded-4 p-3"
                      style={{
                        background: "rgba(220,53,69,0.08)",
                        border: "1px solid rgba(220,53,69,0.14)",
                      }}
                    >
                      <div className="fw-semibold" style={{ color: "#dc3545" }}>
                        More sellers than buyers
                      </div>
                      <div className="text-muted small">
                        Supply ↑ → price often goes down.
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <h4 className="fw-bold mb-3">2) What changes demand?</h4>
                <ul className="text-muted" style={{ lineHeight: 1.8 }}>
                  <li><b>Company news:</b> profits, new products, scandals.</li>
                  <li><b>Market news:</b> interest rates, inflation, global events.</li>
                  <li><b>Investor emotion:</b> fear, hype, confidence.</li>
                  <li><b>Big buyers/sellers:</b> institutions can move price fast.</li>
                </ul>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div
                className="rounded-4 shadow-sm p-4 p-md-5 h-100"
                style={{
                  background: "linear-gradient(135deg, #ffffff, #f4fff7)",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <h4 className="fw-bold mb-3">Where does a Broker fit?</h4>

                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                  A <b>broker</b> is the service/app that sends your buy/sell order to the market.
                  You don’t trade “directly” with Apple/Tesla — your broker helps place the order
                  and match it with someone on the other side.
                </p>

                <div
                  className="rounded-4 p-3 mt-3"
                  style={{
                    background: "rgba(47,111,237,0.07)",
                    border: "1px solid rgba(47,111,237,0.12)",
                  }}
                >
                  <div className="fw-semibold mb-2" style={{ color: "#2f6fed" }}>
                    Simple flow
                  </div>
                  <div className="text-muted small" style={{ lineHeight: 1.7 }}>
                    You → Broker App → Stock Exchange → Another trader
                  </div>
                </div>

                <hr className="my-4" />

                <h5 className="fw-bold mb-2">Real examples (idea)</h5>
                <div className="text-muted small" style={{ lineHeight: 1.7 }}>
                  • A big company releases strong earnings → more buyers → price rises<br />
                  • Bad news or fear in the market → more sellers → price falls<br />
                  • Hype trend on social media → fast jump (but risky)
                </div>

                <div className="mt-4">
                  <Link
                    to="/demo/price-movement"
                    className="btn btn-primary w-100 fw-semibold"
                    style={{
                      borderRadius: 12,
                      background: "linear-gradient(135deg,#2f6fed,#7b61ff)",
                      border: "none",
                      boxShadow: "0 16px 36px rgba(47,111,237,0.18)",
                    }}
                  >
                    Start Interactive Demo →
                  </Link>
                  <div className="text-muted small text-center mt-2">
                    Change supply/demand and watch price react.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div className="text-center text-muted small mt-4">
            Tip: after demo, you’ll understand price movement much faster than reading only theory.
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
