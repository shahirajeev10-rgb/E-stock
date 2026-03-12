import React from "react";
import { Link } from "react-router-dom";
import useReveal from "../../hooks/useReveal";

export default function ProHighlights() {
  const { ref, visible } = useReveal();

  const categories = [
    "Stock Basics",
    "Chart Reading",
    "Risk Control",
    "Simulation Lab",
    "Mini Quizzes",
  ];

  const cards = [
    {
      title: "Beginner Track",
      sub: "From zero to confident",
      tag: "Start Here",
      tone: "blue",
      to: "/lessons/fundamentals",
    },
    {
      title: "Price Movement",
      sub: "Understand why markets move",
      tag: "Core",
      tone: "green",
      to: "/lessons/price-movement",
    },
    {
      title: "Interactive Practice",
      sub: "Try decisions safely",
      tag: "Practice",
      tone: "violet",
      to: "/demo/price-movement",
    },
  ];

  return (
    <section
      ref={ref}
      className={`studioSection py-5 reveal ${visible ? "show" : ""}`}
    >
      <div className="container">
        <div className="studioShell">
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-5">
              <div className="studioLeft h-100">
                <span className="studioBadge">LEARNING WORKSPACE</span>
                <h2>Pick a style, start learning faster</h2>
                <p>
                  Explore lessons in a clean workspace layout inspired by modern
                  creator tools: structured, visual, and easy to navigate.
                </p>

                <div className="studioChips">
                  {categories.map((c) => (
                    <span key={c} className="studioChip">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="studioActions">
                  <Link to="/signup" className="btn btn-primary px-4 fw-semibold">
                    Start Free
                  </Link>
                  <a href="#education" className="btn btn-outline-secondary px-4 fw-semibold">
                    View Modules
                  </a>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="studioGrid">
                {cards.map((card, idx) => (
                  <Link key={card.title} to={card.to} className={`studioCard studioCardIn ${card.tone}`} style={{ animationDelay: `${idx * 90}ms` }}>
                    <span className="studioTag">{card.tag}</span>
                    <h3>{card.title}</h3>
                    <p>{card.sub}</p>
                    <span className="studioArrow">Open →</span>
                  </Link>
                ))}
              </div>

              <div className="trustRow">
                <span>Trusted by beginner learners</span>
                <span>Student friendly</span>
                <span>No real-money risk</span>
                <span>Guided path</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .studioSection{
          background:
            radial-gradient(circle at 8% 20%, rgba(37,99,235,0.12), transparent 42%),
            radial-gradient(circle at 92% 88%, rgba(16,185,129,0.10), transparent 40%),
            linear-gradient(180deg, #f7faff 0%, #ffffff 100%);
        }

        .studioShell{
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 20px 48px rgba(15,23,42,0.08);
        }

        .studioLeft{
          display:flex;
          flex-direction:column;
          justify-content:center;
        }

        .studioBadge{
          display:inline-flex;
          width:max-content;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.55px;
          color: #1d4ed8;
          background: rgba(37,99,235,0.12);
          border: 1px solid rgba(37,99,235,0.2);
        }

        .studioLeft h2{
          margin-top: 12px;
          margin-bottom: 8px;
          font-size: clamp(1.55rem, 2.7vw, 2.2rem);
          font-weight: 900;
          color: #0f172a;
        }

        .studioLeft p{
          margin: 0;
          color: #475569;
          line-height: 1.65;
        }

        .studioChips{
          margin-top: 14px;
          display:flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .studioChip{
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(15,23,42,0.10);
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .studioActions{
          margin-top: 16px;
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .studioGrid{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .studioCard{
          text-decoration:none;
          color: inherit;
          border-radius: 18px;
          padding: 14px;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 14px 32px rgba(15,23,42,0.08);
          min-height: 182px;
          display:flex;
          flex-direction:column;
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .studioCardIn{
          opacity: 0;
          transform: translateY(12px);
        }

        .reveal.show .studioCardIn{
          animation: studioCardIn .45s ease both;
        }

        .studioCard:hover{
          transform: translateY(-3px);
          box-shadow: 0 24px 48px rgba(15,23,42,0.14);
        }

        .studioCard.blue{
          background: linear-gradient(165deg, rgba(37,99,235,0.16), rgba(255,255,255,0.95));
        }

        .studioCard.green{
          background: linear-gradient(165deg, rgba(16,185,129,0.16), rgba(255,255,255,0.95));
        }

        .studioCard.violet{
          background: linear-gradient(165deg, rgba(124,58,237,0.15), rgba(255,255,255,0.95));
        }

        .studioTag{
          width:max-content;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .35px;
          color: rgba(15,23,42,0.7);
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(15,23,42,0.08);
        }

        .studioCard h3{
          margin-top: 10px;
          margin-bottom: 4px;
          font-size: 1.1rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.25;
        }

        .studioCard p{
          margin: 0;
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .studioArrow{
          margin-top: auto;
          padding-top: 12px;
          font-size: 12px;
          font-weight: 900;
          color: #0f172a;
        }

        .trustRow{
          margin-top: 12px;
          display:grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .trustRow span{
          text-align: center;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
          background: rgba(248,250,252,0.9);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          padding: 8px;
        }

        @keyframes studioCardIn{
          from{
            opacity: 0;
            transform: translateY(12px);
          }
          to{
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 992px){
          .studioGrid{
            grid-template-columns: 1fr;
          }
          .trustRow{
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (prefers-reduced-motion: reduce){
          .studioCardIn{
            opacity: 1;
            transform: none;
            animation: none !important;
          }
          .studioCard,
          .studioCard:hover{
            transition: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
