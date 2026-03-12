import React from "react";
import { useNavigate } from "react-router-dom";

export default function FundamentalsModal() {
  const navigate = useNavigate();

  const goToLesson = () => {
    // close modal (Bootstrap will close if js is loaded)
    const el = document.getElementById("fundamentalsModal");
    if (window.bootstrap && el) {
      const instance = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
      instance.hide();
    }

    // go to full lesson page
    navigate("/lessons/fundamentals");
  };

  return (
    <div className="modal fade" id="fundamentalsModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">

          <div
            className="modal-header border-0 text-white"
            style={{ background: "linear-gradient(135deg,#16a34a,#22c55e,#2f6fed)" }}
          >
            <h5 className="modal-title fw-bold">📘 Stock Market Fundamentals (Preview)</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
          </div>

          <div className="modal-body p-4">
            <p className="text-muted mb-3">
              Quick preview of what you’ll learn in this module. When you’re ready, open the full lesson page.
            </p>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="p-3 rounded-4 bg-light h-100">
                  <div className="fw-semibold mb-2">Key ideas</div>
                  <ul className="text-muted mb-0">
                    <li>What a stock really is</li>
                    <li>Why companies sell shares</li>
                    <li>How exchanges work</li>
                    <li>Why prices move</li>
                  </ul>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded-4 bg-light h-100">
                  <div className="fw-semibold mb-2">Mini example</div>
                  <div className="text-muted">
                    If you buy a share at <b>£10</b> and later it becomes <b>£12</b>,
                    your profit is <b>£2</b> per share.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-4" style={{ background: "rgba(47,111,237,0.08)" }}>
              <div className="fw-semibold mb-1">What happens next?</div>
              <div className="text-muted">
                The full lesson includes clear explanation, real-world analogies, and a small interactive practice area.
              </div>
            </div>
          </div>

          <div className="modal-footer border-0 px-4 pb-4">
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" className="btn btn-primary px-4" onClick={goToLesson}>
              Start Full Lesson →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}