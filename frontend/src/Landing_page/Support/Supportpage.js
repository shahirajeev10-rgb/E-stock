import React from "react";
import Navbaar from "../Navbar";
import Footer from "../Footer";
import Hero from "./Hero";
import CreateTicket from "./CreateTicket";

const faqs = [
  {
    q: "Do I need real money to learn on eStock?",
    a: "No. eStock is an educational platform with simulation-based practice.",
  },
  {
    q: "Why can’t I open some lessons?",
    a: "You need to sign in first. Once you are logged in, all lessons and practice modules open from the dashboard and learning page.",
  },
  {
    q: "How do I go from lesson to dashboard?",
    a: "Use the top navbar or Dashboard button available in each lesson page.",
  },
  {
    q: "Can I reset my learning progress?",
    a: "Yes. Contact support with your account email and request a progress reset.",
  },
];

export default function Supportpage() {
  const onOpenTicket = () => {
    const el = document.getElementById("create-ticket");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbaar />

      <section
        className="py-4 py-md-5"
        style={{
          minHeight: "72vh",
          background: "linear-gradient(180deg,#f8fbff 0%, #ffffff 60%, #f6fffb 100%)",
        }}
      >
        <div className="container">
          <Hero onOpenTicket={onOpenTicket} />

          <div className="row g-4 mt-1">
            <div className="col-12 col-lg-7">
              <div
                className="bg-white rounded-4 shadow-sm p-4 h-100"
                style={{ border: "1px solid rgba(15,23,42,0.08)" }}
              >
                <h5 className="fw-bold mb-3">Frequently Asked Questions</h5>
                <div className="accordion" id="supportFaq">
                  {faqs.map((x, idx) => {
                    const collapseId = `faq-${idx}`;
                    const headingId = `heading-${idx}`;
                    return (
                      <div className="accordion-item" key={x.q}>
                        <h2 className="accordion-header" id={headingId}>
                          <button
                            className={`accordion-button ${idx === 0 ? "" : "collapsed"}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${collapseId}`}
                            aria-expanded={idx === 0 ? "true" : "false"}
                            aria-controls={collapseId}
                          >
                            {x.q}
                          </button>
                        </h2>
                        <div
                          id={collapseId}
                          className={`accordion-collapse collapse ${idx === 0 ? "show" : ""}`}
                          aria-labelledby={headingId}
                          data-bs-parent="#supportFaq"
                        >
                          <div className="accordion-body text-muted">{x.a}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <CreateTicket />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
