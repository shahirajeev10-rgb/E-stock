import React from "react";

export default function Hero({ onOpenTicket }) {
  return (
    <section
      className="py-5"
      style={{
        background: "linear-gradient(135deg,#f8fbff 0%, #eef4ff 55%, #ecfdf5 100%)",
        border: "1px solid rgba(15,23,42,0.06)",
        borderRadius: "22px",
      }}
    >
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-8">
            <span
              className="badge rounded-pill"
              style={{
                background: "rgba(37,99,235,0.12)",
                color: "#1d4ed8",
                letterSpacing: "0.5px",
                padding: "8px 12px",
              }}
            >
              SUPPORT CENTER
            </span>
            <h1 className="fw-bold mt-3 mb-2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
              Need help with eStock?
            </h1>
            <p className="text-muted mb-0" style={{ maxWidth: 680 }}>
              Get quick answers for lessons, dashboard, and simulation usage. If you still need help,
              send a support ticket and we will guide you.
            </p>
          </div>

          <div className="col-12 col-lg-4 text-lg-end">
            <button type="button" className="btn btn-primary px-4 py-2" onClick={onOpenTicket}>
              Create Ticket
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
