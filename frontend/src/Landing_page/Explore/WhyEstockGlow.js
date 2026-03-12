import React from "react";
import "./WhyEstockGlow.css";
import useReveal from "../../hooks/useReveal";

export default function WhyEstockGlow() {
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      className={`whyGlow-wrap py-5 reveal ${visible ? "show" : ""}`}
    >
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left text */}
          <div className="col-12 col-lg-6">
            <span className="whyGlow-tag">WHY eSTOCK</span>

            <h2 className="whyGlow-title">
              Learn smarter. <span className="accent">Practice safer.</span>
            </h2>

            <p className="whyGlow-sub">
              Stop guessing and start understanding. eStock teaches stock
              trading with clean visuals, guided steps, and a risk free practice
              space so beginners build real confidence before investing.
            </p>

            <div className="whyGlow-pills">
              <span className="pill">Beginner friendly</span>
              <span className="pill">Risk-free simulation</span>
              <span className="pill">Step-by-step guidance</span>
              <span className="pill">Track progress</span>
            </div>
          </div>

          {/* Right animation */}
          <div className="col-12 col-lg-6">
            <div className="floatingWrap">
              <div className="fadeLeft" />
              <div className="fadeRight" />

              <div className="floatingTrack">
                {[
                  "Learn market concepts",
                  "Practice before investing",
                  "Track learning progress",
                  "Risk-free simulation",
                  "Beginner-friendly design",
                  "Guided learning path",
                  "Build confidence safely",
                  "No real money required",
                  // duplicate for smooth loop
                  "Learn market concepts",
                  "Practice before investing",
                  "Track learning progress",
                  "Risk-free simulation",
                  "Beginner-friendly design",
                  "Guided learning path",
                  "Build confidence safely",
                  "No real money required",
                ].map((item, i) => (
                  <div key={i} className="floatingItem">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
