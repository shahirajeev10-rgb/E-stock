import React from "react";
import { Link } from "react-router-dom";
import Navbaar from "../Navbar";
import Footer from "../Footer";

function Aboutpage() {
  return (
    <>
      <Navbaar />

      <section
        className="py-5"
        style={{
          minHeight: "72vh",
          background: "linear-gradient(135deg,#f8fbff 0%, #eef4ff 55%, #ecfdf5 100%)",
        }}
      >
        <div className="container">
          <div
            className="bg-white rounded-4 shadow-sm p-4 p-md-5"
            style={{ border: "1px solid rgba(15,23,42,0.08)" }}
          >
            <span
              className="badge rounded-pill"
              style={{
                background: "rgba(37,99,235,0.12)",
                color: "#1d4ed8",
                padding: "8px 14px",
              }}
            >
              ABOUT ESTOCK
            </span>

            <h1 className="fw-bold mt-3 mb-2">Learning-first stock education</h1>
            <p className="text-muted mb-4" style={{ maxWidth: 760 }}>
              eStock helps global beginners understand stock markets with clear lessons,
              guided practice, and no real-money risk while learning.
            </p>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className="rounded-4 p-3 h-100" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.14)" }}>
                  <div className="fw-semibold mb-1">Clear Lessons</div>
                  <div className="small text-muted">Step-by-step modules for true beginners.</div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="rounded-4 p-3 h-100" style={{ background: "rgba(25,135,84,0.08)", border: "1px solid rgba(25,135,84,0.14)" }}>
                  <div className="fw-semibold mb-1">Practice Safely</div>
                  <div className="small text-muted">Simulation-first learning before real investing.</div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="rounded-4 p-3 h-100" style={{ background: "rgba(123,97,255,0.08)", border: "1px solid rgba(123,97,255,0.14)" }}>
                  <div className="fw-semibold mb-1">Global Access</div>
                  <div className="small text-muted">Built for learners from around the world.</div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 flex-wrap mt-4">
              <Link to="/home#education" className="btn btn-dark px-4">
                View All Lessons
              </Link>
              <Link to="/support" className="btn btn-outline-secondary px-4">
                Get Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Aboutpage;
