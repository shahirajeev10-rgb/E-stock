import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useReveal from "../../hooks/useReveal";

const heroSlides = [
  {
    src: "https://images.pexels.com/photos/7108045/pexels-photo-7108045.jpeg?cs=srgb&dl=pexels-tiger-lily-7108045.jpg&fm=jpg",
    alt: "Laptop with stock market chart",
    title: "Start with guided lessons",
    sub: "Warm, step-by-step learning designed for beginners.",
    chip: "Lesson path",
    objectPosition: "center center",
  },
  {
    src: "https://images.pexels.com/photos/24709181/pexels-photo-24709181.jpeg?cs=srgb&dl=pexels-tabtrader-com-app-180445110-24709181.jpg&fm=jpg",
    alt: "Woman reviewing stock trading charts on a laptop",
    title: "Read the market clearly",
    sub: "See charts, patterns, and portfolio moves in a simple way.",
    chip: "Chart reading",
    objectPosition: "center center",
  },
  {
    src: "https://images.pexels.com/photos/7693758/pexels-photo-7693758.jpeg?cs=srgb&dl=pexels-yankrukov-7693758.jpg&fm=jpg",
    alt: "Team reviewing financial charts on a laptop",
    title: "Build progress you can see",
    sub: "Track milestones, unlock lessons, and improve with structure.",
    chip: "Progress view",
    objectPosition: "center center",
  },
  {
    src: "https://images.pexels.com/photos/28504955/pexels-photo-28504955.jpeg?cs=srgb&dl=pexels-stockradars-co-1851828201-28504955.jpg&fm=jpg",
    alt: "Mobile and laptop trading setup",
    title: "Practice before real risk",
    sub: "Use the simulator to learn decisions without using real money.",
    chip: "Safe practice",
    objectPosition: "center center",
  },
  {
    src: "https://images.pexels.com/photos/7567226/pexels-photo-7567226.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-7567226.jpg&fm=jpg",
    alt: "Market learning and portfolio practice",
    title: "Grow a steady routine",
    sub: "Study, practice, review, and repeat with a cleaner workflow.",
    chip: "Student flow",
    objectPosition: "center center",
  },
];

function Hero() {
  const { ref, visible } = useReveal();
  const focusWords = ["Confidence", "Knowledge", "Discipline"];
  const [wordIndex, setWordIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const intervalId = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % focusWords.length);
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [focusWords.length]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const intervalId = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      ref={ref}
      className={`py-5 position-relative overflow-hidden reveal ${visible ? "show" : ""}`}
      style={{
        background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 45%, #ffffff 100%)",
      }}
    >
      {/* Soft background blobs */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          top: -140,
          left: -140,
          background: "radial-gradient(circle, rgba(37,99,235,0.18), rgba(255,255,255,0) 65%)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          bottom: -220,
          right: -220,
          background: "radial-gradient(circle, rgba(16,185,129,0.14), rgba(255,255,255,0) 65%)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />

      <div className="container position-relative">
        <div className="row align-items-center g-5">
          {/* LEFT */}
          <div className="col-12 col-lg-6 text-center text-lg-start">
            {/* Badge */}
            <span
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{
                background: "rgba(37,99,235,0.10)",
                color: "#1d4ed8",
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontSize: 12,
              }}
            >
              🚀 BEGINNER LEARNING PLATFORM
            </span>

            {/* Heading */}
            <h1 className="heroHeadline fw-bold mt-3">
              <span className="heroLine heroLineOne">Learn Markets.</span>
              <span className="heroLine heroLineTwo">Practice Safely.</span>
                <span className="heroLine heroLineThree">
                  Build
                  <span className="heroFocusWrap" aria-live="polite" aria-atomic="true">
                    <span key={focusWords[wordIndex]} className="heroFocusWord">
                      {focusWords[wordIndex]}
                    </span>
                  </span>
                </span>
            </h1>

            {/* Subtitle */}
            <p className="text-muted mt-3 fs-5" style={{ maxWidth: 520 }}>
              Learn stock market fundamentals through guided lessons and risk-free
              trading practice — made for students and complete beginners.
            </p>

            {/* CTA Buttons */}
            <div className="d-flex flex-wrap gap-3 mt-4 justify-content-center justify-content-lg-start">
              <Link
                to="/signup"
                className="btn btn-primary btn-lg px-4"
                style={{
                  borderRadius: 14,
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 36px rgba(37,99,235,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Sign Up Free
              </Link>

              <a
                href="#stats"
                className="btn btn-outline-secondary btn-lg px-4"
                style={{ borderRadius: 14 }}
              >
                Explore Learning
              </a>

              <button
                type="button"
                className="btn btn-outline-dark btn-lg px-4"
                style={{ borderRadius: 14 }}
                data-bs-toggle="modal"
                data-bs-target="#fundamentalsModal"
              >
                Quick Lesson Preview
              </button>
            </div>

            {/* Trust indicators - styled */}
            <div className="d-flex flex-wrap gap-2 mt-4 justify-content-center justify-content-lg-start">
              {[
                "Beginner Friendly",
                "Risk-Free Simulation",
                "No Real Money Required",
              ].map((t) => (
                <span
                  key={t}
                  className="px-3 py-2 rounded-pill"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    color: "rgba(15,23,42,0.75)",
                    fontWeight: 600,
                    fontSize: 13,
                    boxShadow: "0 10px 24px rgba(17,24,39,0.06)",
                  }}
                >
                  ✔ {t}
                </span>
              ))}
            </div>

            {/* Mini stats strip */}
            <div
              className="mt-4 p-3 rounded-4"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 18px 40px rgba(17,24,39,0.08)",
                maxWidth: 560,
                marginInline: "auto",
              }}
            >
              <div className="row text-center g-2">
                <div className="col-4">
                  <div className="fw-bold" style={{ color: "#0f172a" }}>Lessons</div>
                  <div className="text-muted small">Step-by-step</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold" style={{ color: "#0f172a" }}>Practice</div>
                  <div className="text-muted small">Virtual trading</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold" style={{ color: "#0f172a" }}>Confidence</div>
                  <div className="text-muted small">Before investing</div>
                </div>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="mt-4 text-muted small">
              Scroll to see how eStock works ↓
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-12 col-lg-6 text-center">
            <div
              className="heroVisualCard p-3 p-md-4 rounded-4"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,248,240,0.92), rgba(255,255,255,0.88) 46%, rgba(239,246,255,0.86))",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 26px 70px rgba(17,24,39,0.10)",
              }}
            >
              <div className="heroSliderShell">
                {heroSlides.map((slide, index) => (
                  <div
                    key={`${slide.title}-${index}`}
                    className={`heroSlide ${index === slideIndex ? "isActive" : ""}`}
                  >
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className="heroSlideImage"
                      style={{ objectPosition: slide.objectPosition }}
                    />
                    <div className="heroSlideOverlay" />
                    <div className="heroSlideCaption">
                      <span className="heroSlideChip">{slide.chip}</span>
                      <h3>{slide.title}</h3>
                      <p>{slide.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="heroSlideDots" role="tablist" aria-label="Homepage visual slides">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    className={`heroDot ${index === slideIndex ? "isActive" : ""}`}
                    aria-label={`Show slide ${index + 1}`}
                    aria-pressed={index === slideIndex}
                    onClick={() => setSlideIndex(index)}
                  />
                ))}
              </div>

              <div className="heroSlideMeta">
                <div className="heroMetaCard">
                  <span>Mode</span>
                  <strong>Guided learning</strong>
                </div>
                <div className="heroMetaCard">
                  <span>Rotation</span>
                  <strong>Every 7 seconds</strong>
                </div>
                <div className="heroMetaCard">
                  <span>Focus</span>
                  <strong>Warm beginner experience</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        .heroHeadline{
          line-height: 1.08;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          letter-spacing: -0.02em;
        }

        .heroVisualCard{
          position: relative;
          overflow: hidden;
        }

        .heroSliderShell{
          position: relative;
          min-height: 440px;
          border-radius: 26px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.02));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);
        }

        .heroSlide{
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: scale(1.02);
          transition: opacity 640ms ease, transform 900ms ease;
          pointer-events: none;
        }

        .heroSlide.isActive{
          opacity: 1;
          transform: scale(1);
        }

        .heroSlideImage{
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .heroSlideOverlay{
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.12) 45%, rgba(15,23,42,0.62) 100%),
            linear-gradient(135deg, rgba(255,247,237,0.16), transparent 42%, rgba(37,99,235,0.12) 100%);
        }

        .heroSlideCaption{
          position: absolute;
          left: 22px;
          right: 22px;
          bottom: 22px;
          padding: 18px;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          text-align: left;
          color: #ffffff;
          box-shadow: 0 18px 40px rgba(15,23,42,0.18);
        }

        .heroSlideCaption h3{
          margin: 10px 0 6px;
          font-size: clamp(1.25rem, 2vw, 1.8rem);
          line-height: 1.1;
          font-weight: 800;
        }

        .heroSlideCaption p{
          margin: 0;
          font-size: 0.98rem;
          color: rgba(255,255,255,0.88);
          line-height: 1.6;
          max-width: 34ch;
        }

        .heroSlideChip{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.22);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .heroSlideDots{
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }

        .heroDot{
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: none;
          background: rgba(15,23,42,0.18);
          transition: transform 180ms ease, background 180ms ease, width 180ms ease;
        }

        .heroDot.isActive{
          width: 28px;
          background: linear-gradient(90deg, #f59e0b, #ef4444);
        }

        .heroSlideMeta{
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .heroMetaCard{
          padding: 12px 14px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,250,245,0.78));
          border: 1px solid rgba(15,23,42,0.06);
          text-align: left;
          box-shadow: 0 10px 24px rgba(17,24,39,0.06);
        }

        .heroMetaCard span{
          display: block;
          font-size: 11px;
          color: rgba(15,23,42,0.56);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .heroMetaCard strong{
          display: block;
          margin-top: 4px;
          color: #0f172a;
          font-size: 0.95rem;
        }

        .heroLine{
          display: block;
          opacity: 0;
          transform: translateY(14px);
          animation: heroLineIn 560ms ease forwards;
        }

        .heroLineTwo{ animation-delay: 90ms; }
        .heroLineThree{ animation-delay: 180ms; }

        .heroFocusWrap{
          display: inline-flex;
          align-items: center;
          margin-left: 10px;
          padding-right: 2px;
          min-width: 8.8ch;
        }

        .heroFocusWord{
          display: inline-block;
          font-weight: 900;
          background: linear-gradient(90deg, #2563eb, #16a34a, #7c3aed);
          background-size: 180% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: heroWordSwap 220ms ease both, focusGlow 1.6s linear infinite;
        }

        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes focusGlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 180% 50%; }
        }

        @keyframes heroWordSwap {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .heroLine{
            opacity: 1;
            transform: none;
            animation: none;
          }

          .heroFocusWrap{
            height: auto;
            overflow: visible;
          }

          .heroFocusWord{
            animation: none;
            transform: none;
          }

          .heroSlide{
            transition: none;
            transform: none;
          }

          .heroDot{
            transition: none;
          }
        }

        @media (max-width: 991.98px) {
          .heroSliderShell{
            min-height: 360px;
          }

          .heroSlideMeta{
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 575.98px) {
          .heroSliderShell{
            min-height: 300px;
          }

          .heroSlideCaption{
            left: 14px;
            right: 14px;
            bottom: 14px;
            padding: 14px;
          }

          .heroSlideCaption p{
            max-width: none;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;
