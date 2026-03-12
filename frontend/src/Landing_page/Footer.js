import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#cbd5e1",
        paddingTop: "60px",
        paddingBottom: "30px",
      }}
    >
      <div className="container">
        <div className="row gy-4">
          {/* Logo + Description */}
          <div className="col-12 col-md-6 col-lg-3">
            <h4 className="fw-bold text-white">eStock</h4>
            <p style={{ fontSize: "0.95rem", marginTop: "15px" }}>
              Learn stock trading with clarity and confidence.
              Practice safely before entering real markets.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3 col-lg-3">
            <h6 className="text-white fw-semibold mb-3">Quick Links</h6>
            <ul className="list-unstyled m-0">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><a href="#stats" className="footer-link">Learn</a></li>
              <li><a href="#pricing" className="footer-link">Pricing</a></li>
              <li><a href="#open-account" className="footer-link">Open Account</a></li>
            </ul>
          </div>

          {/* Learning */}
          <div className="col-6 col-md-3 col-lg-3">
            <h6 className="text-white fw-semibold mb-3">Learning</h6>
            <ul className="list-unstyled m-0">
              <li><span className="footer-link">Stock Basics</span></li>
              <li><span className="footer-link">Market Trends</span></li>
              <li><span className="footer-link">Trading Simulation</span></li>
              <li><span className="footer-link">Risk Management</span></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-12 col-md-6 col-lg-3">
            <h6 className="text-white fw-semibold mb-3">Support</h6>
            <ul className="list-unstyled m-0">
              <li><span className="footer-link">Contact</span></li>
              <li><span className="footer-link">FAQ</span></li>
              <li><span className="footer-link">Privacy Policy</span></li>
              <li><span className="footer-link">Terms & Conditions</span></li>
            </ul>
          </div>
        </div>

        {/* ✅ Medium divider (NOT <hr>) */}
        <div
          style={{
            height: "1px",
            width: "100%",
            background: "rgba(255,255,255,0.10)",
            marginTop: "38px",
            marginBottom: "22px",
          }}
        />

        {/* Bottom */}
        <div className="text-center small" style={{ color: "#94a3b8" }}>
          © {new Date().getFullYear()} eStock. All rights reserved. <br />
          <span style={{ fontSize: "0.8rem" }}>
            eStock is an educational platform and does not provide financial advice.
          </span>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-block;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }
        .footer-link:hover {
          color: #22c55e;
          transform: translateX(4px);
        }
      `}</style>
    </footer>
  );
}

export default Footer;