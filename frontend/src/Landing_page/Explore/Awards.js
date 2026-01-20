import React from "react";
import "./Awards.css";

function Awards() {
  return (
    <section className="awards-section py-5">
      <div className="container">
        <div className="row align-items-center g-5">

          {/* Image */}
          <div className="col-12 col-md-6 text-center">
            <div className="image-card">
              <img
                src="/media/Honorsandawards.jpg"
                alt="Awards and recognition"
                className="img-fluid"
              />
            </div>
          </div>

          {/* Content */}
          <div className="col-12 col-md-6">
            <span className="section-tag">Why eStock?</span>

            <h2 className="fw-bold mt-2 mb-3">
              Stock Learning Platform for Beginners
            </h2>

            <p className="text-muted mb-4">
              Learning stock trading can be confusing at the beginning.
              eStock simplifies this journey by combining clear explanations
              with practical, hands-on learning so users can build confidence
              before investing real money.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                 Beginner-friendly lessons
              </div>
              <div className="feature-item">
                 Risk-free trading simulation
              </div>
              <div className="feature-item">
                 Step-by-step guided learning
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Awards;