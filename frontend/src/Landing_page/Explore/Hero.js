import React from 'react';

function Hero() {
  return (
    <div className="container p-5">
      <div className="row justify-content-center text-center">
        <div className="col-12 col-md-8">

          <img
            src="/media/img1.jpg"
            alt="Stock learning illustration"
            className="img-fluid mb-4 rounded-3 shadow"
            style={{ maxHeight: "420px", objectFit: "contain" }}
          />

          <h1 className="fw-bold mt-4">
            Grow Your Wealth, Secure Your Dream
          </h1>

          <p className="text-muted mt-3">
            Platform to learn stock market and trading
          </p>

          <button className="btn btn-primary btn-lg mt-3">
            Sign Up Now
          </button>

        </div>
      </div>
    </div>
  );
}

export default Hero;