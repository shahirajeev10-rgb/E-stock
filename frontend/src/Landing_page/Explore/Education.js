import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../auth";
import useReveal from "../../hooks/useReveal";
import { fetchLessonProgress } from "../../api/client";
import { buildLessonProgressLookup, LESSON_CATALOG } from "../../data/lessonCatalog";

function Education() {
  const { ref, visible } = useReveal();
  const isLoggedIn = auth.isLoggedIn();
  const [progressItems, setProgressItems] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      if (!isLoggedIn) {
        setProgressItems([]);
        return;
      }

      try {
        const res = await fetchLessonProgress();
        if (!active) return;
        setProgressItems(res?.data || []);
      } catch {
        if (active) setProgressItems([]);
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const modules = useMemo(() => {
    const icons = {
      fundamentals: "📘",
      "price-movement": "📈",
      "profit-loss-portfolio": "💰",
      "risk-management": "🛡️",
      "trading-simulator": "🧪",
    };

    const lookup = buildLessonProgressLookup(progressItems);

    return LESSON_CATALOG.map((lesson) => ({
      title: lesson.title.replace("Lesson 1: ", "").replace("Lesson 2: ", "").replace("Lesson 3: ", "").replace("Lesson 4: ", ""),
      desc: lesson.desc,
      badge: lesson.tag,
      icon: icons[lesson.lessonKey] || "✅",
      unlocked: Boolean(isLoggedIn),
      path: lesson.to,
      progress: Math.round(Number(lookup[lesson.lessonKey]?.progressPct || 0)),
    }));
  }, [isLoggedIn, progressItems]);

  return (
    <section
      id="education"
      ref={ref}
      className={`py-5 reveal ${visible ? "show" : ""}`}
      style={{
        background:
          "linear-gradient(180deg,#f8fbff 0%, #eef4ff 50%, #f8fbff 100%)",
      }}
    >
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Structured Learning Path</h2>
          <p className="text-muted">
            Progress through modules like a professional trading program.
          </p>
        </div>

        <div className="row g-4">
          {modules.map((m, idx) => {
            const locked = !m.unlocked || !isLoggedIn;

            return (
              <div key={idx} className="col-12 col-md-6 col-lg-4">
                <div
                  className={`eduCard eduAppear h-100 ${
                    locked ? "eduLocked" : ""
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="fw-bold eduTitle">
                      <span className="eduIcon">{m.icon}</span>
                      {m.title}
                    </div>

                    <span
                      className={`badge rounded-pill ${
                        locked ? "bg-secondary" : "bg-success"
                      }`}
                    >
                      {locked ? "Locked" : m.badge}
                    </span>
                  </div>

                  <p className="text-muted small mt-3 mb-3">
                    {m.desc}
                  </p>

                  {!locked && m.progress !== undefined && (
                    <div className="mb-3">
                      <div className="progress" style={{ height: 6 }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                      <small className="text-muted">
                        {m.progress}% Complete
                      </small>
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-auto">
                    {locked ? (
                      <button
                        className="btn btn-sm btn-outline-secondary w-100"
                        disabled
                      >
                        Login to Unlock
                      </button>
                    ) : (
                      <Link
                        to={m.path}
                        className="btn btn-sm btn-primary w-100"
                      >
                        Continue
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .eduCard{
          background:#ffffff;
          border-radius:20px;
          padding:22px;
          border:1px solid rgba(15,23,42,0.06);
          box-shadow:0 10px 30px rgba(15,23,42,0.05);
          transition: all .25s ease;
          display:flex;
          flex-direction:column;
        }

        .eduAppear{
          opacity: 0;
          transform: translateY(12px);
        }

        .reveal.show .eduAppear{
          animation: eduIn .45s ease both;
        }

        .reveal.show .row > div:nth-child(2) .eduAppear{ animation-delay: 70ms; }
        .reveal.show .row > div:nth-child(3) .eduAppear{ animation-delay: 140ms; }
        .reveal.show .row > div:nth-child(4) .eduAppear{ animation-delay: 210ms; }
        .reveal.show .row > div:nth-child(5) .eduAppear{ animation-delay: 280ms; }
        .reveal.show .row > div:nth-child(6) .eduAppear{ animation-delay: 350ms; }

        .eduCard:hover{
          transform:translateY(-4px);
          box-shadow:0 20px 50px rgba(37,99,235,0.12);
        }

        .eduLocked{
          opacity:0.7;
          background:rgba(248,250,252,0.7);
        }

        .eduTitle{
          font-size:1rem;
          display:flex;
          align-items:center;
        }

        .eduIcon{
          margin-right:8px;
          font-size:1.2rem;
        }

        .progress{
          border-radius:20px;
          overflow:hidden;
          background:rgba(0,0,0,0.05);
        }

        .progress-bar{
          transition:width .4s ease;
        }

        @keyframes eduIn{
          from{
            opacity: 0;
            transform: translateY(12px);
          }
          to{
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce){
          .reveal.show .eduAppear{
            animation: none !important;
          }
          .eduCard,
          .eduCard:hover{
            transition: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

export default Education;
