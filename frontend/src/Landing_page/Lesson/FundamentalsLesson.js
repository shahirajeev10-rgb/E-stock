import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbaar from "../Navbar";
import Footer from "../Footer";
import useLessonProgress from "./useLessonProgress";

/** tiny sparkline */
function Sparkline({ points = [8, 10, 9, 12, 11, 13, 12], height = 34 }) {
  const width = 120;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

function Pill({ children, tone = "blue" }) {
  const styles = {
    blue: { bg: "rgba(47,111,237,0.10)", color: "#2f6fed" },
    green: { bg: "rgba(25,135,84,0.10)", color: "#198754" },
    gray: { bg: "rgba(108,117,125,0.12)", color: "#6c757d" },
    purple: { bg: "rgba(123,97,255,0.10)", color: "#6f5bff" },
  }[tone];

  return (
    <span
      className="badge rounded-pill"
      style={{
        background: styles.bg,
        color: styles.color,
        padding: "10px 14px",
        letterSpacing: "0.4px",
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-4 shadow-sm p-3 p-md-4 premiumCard ${className}`}
      style={{ border: "1px solid rgba(15,23,42,0.07)" }}
    >
      {children}
    </div>
  );
}

export default function FundamentalsLesson() {
  // fake “market” demo data (not live)
  const assets = useMemo(
    () => [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        exch: "NASDAQ",
        price: 187.42,
        change: +1.23,
        changePct: +0.66,
        sector: "Technology",
        cap: "Large-cap",
        vol: "Medium",
        volume: "58.4M",
        spark: [178, 180, 179, 182, 185, 184, 187],
        catalysts: [
          "Earnings beat expectations",
          "New product demand stronger than forecast",
          "Analyst upgrade increased demand",
        ],
      },
      {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        exch: "NASDAQ",
        price: 198.1,
        change: -2.95,
        changePct: -1.47,
        sector: "Automotive / EV",
        cap: "Large-cap",
        vol: "High",
        volume: "122.1M",
        spark: [210, 206, 204, 201, 203, 200, 198],
        catalysts: [
          "Market risk-off mood (more selling)",
          "Delivery numbers uncertainty",
          "High volatility attracts short-term trades",
        ],
      },
      {
        symbol: "SONY",
        name: "Sony Group Corp.",
        exch: "NYSE",
        price: 92.55,
        change: +0.18,
        changePct: +0.19,
        sector: "Entertainment / Tech",
        cap: "Large-cap",
        vol: "Low–Med",
        volume: "6.2M",
        spark: [89, 90, 90, 91, 92, 92, 92.5],
        catalysts: [
          "Stable performance + steady buyers",
          "Stronger demand in gaming segment",
          "Lower volatility = smoother moves",
        ],
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        exch: "NASDAQ",
        price: 412.18,
        change: +3.44,
        changePct: +0.84,
        sector: "Technology",
        cap: "Large-cap",
        vol: "Low–Med",
        volume: "31.7M",
        spark: [401, 404, 402, 406, 409, 410, 412],
        catalysts: [
          "Cloud growth remains strong",
          "AI feature rollout boosts sentiment",
          "Broader tech sector strength",
        ],
      },
      {
        symbol: "AMZN",
        name: "Amazon.com, Inc.",
        exch: "NASDAQ",
        price: 176.92,
        change: -1.06,
        changePct: -0.6,
        sector: "Consumer / Tech",
        cap: "Large-cap",
        vol: "Medium",
        volume: "45.9M",
        spark: [182, 181, 180, 178, 179, 177.5, 176.9],
        catalysts: [
          "Retail margin concerns in news",
          "Market rotation out of growth",
          "E-commerce demand steady but competitive",
        ],
      },
      {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        exch: "NASDAQ",
        price: 846.55,
        change: +11.2,
        changePct: +1.34,
        sector: "Semiconductors",
        cap: "Large-cap",
        vol: "High",
        volume: "52.3M",
        spark: [812, 820, 835, 828, 842, 838, 846],
        catalysts: [
          "AI chip demand headlines",
          "Strong guidance expectations",
          "Higher volatility attracts traders",
        ],
      },
    ],
    []
  );

  const [selected, setSelected] = useState(assets[0]);

  // demo “news” feed (UI only)
  const news = useMemo(
    () => [
      {
        t: `${selected.symbol} • Market update`,
        s: `Price ${
          selected.change >= 0 ? "rising" : "falling"
        } today as traders react to fresh headlines and market mood.`,
        tone: selected.change >= 0 ? "pos" : "neg",
      },
      {
        t: "Macro • Rates & sentiment",
        s: "When rates rise, growth stocks can wobble. When sentiment improves, buyers return faster.",
        tone: "info",
      },
      {
        t: "Tip • Ask ‘why is it moving?’",
        s: "Before buying, look for a reason: earnings, guidance, news, or supply/demand imbalance.",
        tone: "tip",
      },
    ],
    [selected]
  );

  const glossary = useMemo(
    () => [
      { k: "Ticker", v: "Short code for a stock (AAPL, TSLA)." },
      { k: "Bid / Ask", v: "Bid = buyers offer, Ask = sellers want." },
      { k: "Spread", v: "Ask − Bid. Smaller spread usually means more liquidity." },
      { k: "Volatility", v: "How fast and how much price moves." },
      { k: "Volume", v: "How many shares traded in a period." },
    ],
    []
  );

  // section navigation
  const sections = useMemo(
    () => [
      { key: "basics", title: "What is a stock?" },
      { key: "prices", title: "Why prices move" },
      { key: "exchange", title: "How trading works" },
      { key: "practice", title: "Practice (order + P/L)" },
      { key: "recap", title: "Beginner recap + mini quiz" },
    ],
    []
  );
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState(0);
  const practiceSectionIndex = sections.findIndex((s) => s.key === "practice");

  const introModules = useMemo(
    () => [
      {
        num: "01",
        title: "Understand Ownership",
        short: "A stock is part ownership of a company.",
        kicker: "Foundation",
        metric: "Business first",
        detail:
          "Classical investing books teach one key idea: do not treat stocks as random numbers. Treat them as real businesses. When you buy a share, you own a small part of the company's future.",
        example:
          "Example: if a cafe has 1,000 shares and you own 10, you own 1% of that business. If it grows profits over years, ownership value can grow too.",
        points: [
          "Always ask what the company actually sells.",
          "Check how it makes revenue and profit.",
          "Think like an owner, not a gambler.",
        ],
      },
      {
        num: "02",
        title: "See Price Logic",
        short: "Price moves by demand and supply.",
        kicker: "Market Behavior",
        metric: "Demand > Supply",
        detail:
          "Price rises when more people want to buy than sell. Price falls when sellers are stronger than buyers. News, earnings, and market mood all influence this balance.",
        example:
          "Everyday analogy: concert tickets. If many people rush to buy, ticket price rises. If interest drops, price falls. Stock prices work similarly, but much faster.",
        points: [
          "Good news can increase demand quickly.",
          "Fear can trigger heavy selling pressure.",
          "High volatility means faster, larger moves.",
        ],
      },
      {
        num: "03",
        title: "Learn Order Types",
        short: "Use market and limit orders correctly.",
        kicker: "Execution Basics",
        metric: "Price vs Speed",
        detail:
          "A market order focuses on execution speed. A limit order focuses on price control. Beginners should understand this difference before placing any trade.",
        example:
          "If a stock trades near $100: market order may fill near current price, while a limit order at $99.50 fills only if price reaches that level.",
        points: [
          "Market order: faster, less price control.",
          "Limit order: more control, no fill guarantee.",
          "Use the order type that matches your plan.",
        ],
      },
      {
        num: "04",
        title: "Practice Profit & Loss",
        short: "Small moves become big with larger quantity.",
        kicker: "Risk Awareness",
        metric: "P/L = (Sell - Buy) x Qty",
        detail:
          "Profit and loss should be calculated before trade entry, not after. Quantity amplifies both gains and losses, so position size matters as much as direction.",
        example:
          "Buy at $50, sell at $52 with 10 shares = +$20. With 100 shares, same move = +$200. The opposite is true for losses.",
        points: [
          "Know worst-case loss before buying.",
          "Never size a trade without a plan.",
          "Protect capital first, profit second.",
        ],
      },
      {
        num: "05",
        title: "Recap and Self-check",
        short: "Confirm understanding before Lesson 2.",
        kicker: "Readiness Check",
        metric: "5-step confidence",
        detail:
          "Strong learners pause for a recap. This step helps you identify weak spots before moving to the next lesson on price movement and market dynamics.",
        example:
          "If you can explain ownership, demand/supply, order types, and P/L in your own words, you are ready for Lesson 2.",
        points: [
          "Review glossary once more.",
          "Retake mini quiz if needed.",
          "Move forward only when concepts are clear.",
        ],
      },
    ],
    []
  );
  const [introOpen, setIntroOpen] = useState(0);
  const activeIntro = introModules[introOpen] || introModules[0];

  // smooth animate when changing sections
  const [animateKey, setAnimateKey] = useState(0);
  useEffect(() => {
    setAnimateKey((k) => k + 1);
  }, [active, selected]);

  // practice: order ticket + pnl
  const [orderType, setOrderType] = useState("market"); // market | limit
  const [limitPrice, setLimitPrice] = useState(
    String(selected.price.toFixed(2))
  );
  const [qty, setQty] = useState("5");
  const qtyNum = Number(qty);
  const lpNum = Number(limitPrice);

  const effectivePrice = orderType === "market" ? selected.price : lpNum;
  const estCost =
    Number.isFinite(effectivePrice) && Number.isFinite(qtyNum)
      ? effectivePrice * qtyNum
      : 0;

  const [buy, setBuy] = useState("10");
  const [sell, setSell] = useState("12");
  const buyNum = Number(buy);
  const sellNum = Number(sell);
  const pnlPerShare =
    Number.isFinite(buyNum) && Number.isFinite(sellNum) ? sellNum - buyNum : 0;
  const totalPnL =
    Number.isFinite(pnlPerShare) && Number.isFinite(qtyNum)
      ? pnlPerShare * qtyNum
      : 0;

  const [quiz, setQuiz] = useState({ q1: "", q2: "", q3: "" });
  const quizScore =
    Number(quiz.q1 === "ownership") +
    Number(quiz.q2 === "demand") +
    Number(quiz.q3 === "limit");
  const quizDone = quiz.q1 && quiz.q2 && quiz.q3;

  const up = selected.change >= 0;
  const lessonProgressPct = useMemo(() => {
    if (!started) return 10;

    let pct = ((active + 1) / sections.length) * 85;
    if (active === sections.length - 1 && quizDone) pct += 10;
    if (active === sections.length - 1 && quizScore === 3) pct += 5;
    return Math.min(100, Number(pct.toFixed(1)));
  }, [active, quizDone, quizScore, sections.length, started]);

  const lessonProgress = useLessonProgress({
    lessonKey: "fundamentals",
    title: "Lesson 1: Fundamentals",
    path: "/lessons/fundamentals",
    progressPct: lessonProgressPct,
    lastStep: started ? active + 1 : 0,
    totalSteps: sections.length,
  });

  return (
    <>
      <Navbaar />

      <section className="premiumBg py-4">
        <div className="container">
          {/* Header */}
          <div className="d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-4">
            <div>
              <Pill tone="blue">LESSON 1 • STOCK MARKET FUNDAMENTALS</Pill>
              <h1 className="fw-bold mt-3 mb-2 premiumTitle">
                Stock Market Fundamentals
              </h1>
              <p className="text-muted mb-0" style={{ maxWidth: 860 }}>
                Built for true beginners: start with a simple introduction, then
                move section-by-section with examples, practice, and recap — all
                using safe mock data (no real money).
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <Pill tone="gray">Progress {Math.round(lessonProgress.progressPct)}%</Pill>
              <Link
                to="/home"
                className="btn btn-outline-secondary px-4 premiumBtnSoft"
              >
                Back Home
              </Link>
              <button
                className="btn btn-success px-4 premiumBtn"
                onClick={() => {
                  setStarted(true);
                  if (practiceSectionIndex >= 0) setActive(practiceSectionIndex);
                }}
              >
                Go to Practice
              </button>
            </div>
          </div>

          {!started ? (
            <Card className="mb-4">
              <div className="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-3">
                <div>
                  <div className="fw-bold introScript" style={{ fontSize: "1.45rem" }}>
                    Start here: Beginner introduction
                  </div>
                  <div className="text-muted mt-2" style={{ maxWidth: 760, lineHeight: 1.72 }}>
                    Before charts and numbers, understand the big picture:
                    what a stock is, why prices move, and how to think safely as
                    a beginner. Then continue one section at a time.
                  </div>
                </div>
                <Pill tone="green">Step-by-step • Beginner friendly</Pill>
              </div>

              <div className="lessonIntroGrid mt-3">
                {introModules.map((item, idx) => (
                  <button
                    key={item.num}
                    type="button"
                    className={`introStep introStepBtn ${introOpen === idx ? "isActive" : ""}`}
                    onClick={() => setIntroOpen(idx)}
                  >
                    <div className="introNum">{item.num}</div>
                    <div>
                      <div className="fw-semibold">{item.title}</div>
                      <div className="text-muted small">{item.short}</div>
                      <div className="introStat">{item.metric}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="introDetail mt-3">
                <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                  <div>
                    <div className="introKicker">{activeIntro.kicker}</div>
                    <div className="fw-bold" style={{ fontSize: "1.08rem" }}>
                      {activeIntro.title}
                    </div>
                  </div>
                  <span className="introBadge">{activeIntro.metric}</span>
                </div>

                <p className="text-muted mt-2 mb-2" style={{ lineHeight: 1.72 }}>
                  {activeIntro.detail}
                </p>

                <div className="miniPanel">
                  <div className="fw-semibold mb-1">Worked example</div>
                  <div className="text-muted">{activeIntro.example}</div>
                </div>

                <ul className="text-muted mb-0 mt-3" style={{ paddingLeft: "1.1rem", lineHeight: 1.7 }}>
                  {activeIntro.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="d-flex gap-2 flex-wrap mt-3">
                <button
                  type="button"
                  className="btn btn-primary px-4 premiumBtn"
                  onClick={() => {
                    setStarted(true);
                    setActive(0);
                  }}
                >
                  Start Lesson 1
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 premiumBtnSoft"
                  onClick={() => {
                    setStarted(true);
                    if (practiceSectionIndex >= 0) setActive(practiceSectionIndex);
                  }}
                >
                  Jump to Practice
                </button>
              </div>
            </Card>
          ) : (
            <>
          {/* Market Snapshot */}
          <Card className="mb-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
              <div>
                <div className="fw-bold">Market snapshot (demo)</div>
                <div className="text-muted small">
                  This looks like a trading app watchlist. Numbers are mock for
                  learning.
                </div>
              </div>
              <Pill tone="gray">Mock data • Educational</Pill>
            </div>

            <div className="moverRow">
              <div className="moverItem">
                <div className="moverLabel">Selected</div>
                <div className="moverValue">{selected.symbol}</div>
                <div className={`moverSub ${up ? "pos" : "neg"}`}>
                  {up ? "+" : ""}
                  {selected.change.toFixed(2)} ({up ? "+" : ""}
                  {selected.changePct.toFixed(2)}%)
                </div>
              </div>
              <div className="moverItem">
                <div className="moverLabel">Today’s volume</div>
                <div className="moverValue">{selected.volume}</div>
                <div className="moverSub">Demo liquidity signal</div>
              </div>
              <div className="moverItem">
                <div className="moverLabel">Volatility</div>
                <div className="moverValue">{selected.vol}</div>
                <div className="moverSub">Risk level indicator</div>
              </div>
            </div>

            <div className="row g-3 mt-3">
              {assets.map((a) => {
                const isSelected = a.symbol === selected.symbol;
                const isUp = a.change >= 0;
                return (
                  <div key={a.symbol} className="col-12 col-lg-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(a);
                        setLimitPrice(String(a.price.toFixed(2)));
                      }}
                      className="w-100 text-start p-0 border-0 bg-transparent"
                      style={{ outline: "none" }}
                    >
                      <div
                        className={`rounded-4 p-3 h-100 watchCard ${
                          isSelected ? "watchActive" : ""
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div
                              className="fw-bold"
                              style={{ fontSize: "1.05rem" }}
                            >
                              {a.symbol}{" "}
                              <span className="text-muted fw-semibold">
                                • {a.exch}
                              </span>
                            </div>
                            <div className="text-muted small">{a.name}</div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">${a.price.toFixed(2)}</div>
                            <div
                              className="small fw-semibold"
                              style={{
                                color: isUp ? "#198754" : "#dc3545",
                              }}
                            >
                              {isUp ? "+" : ""}
                              {a.change.toFixed(2)} ({isUp ? "+" : ""}
                              {a.changePct.toFixed(2)}%)
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between mt-3">
                          <div className="text-muted small">
                            <span className="fw-semibold">Sector:</span>{" "}
                            {a.sector}
                          </div>
                          <div style={{ color: isUp ? "#198754" : "#dc3545" }}>
                            <Sparkline points={a.spark} />
                          </div>
                        </div>

                        <div className="mt-3 d-flex flex-wrap gap-2">
                          <span className="miniTag">Cap: {a.cap}</span>
                          <span className="miniTag">Volatility: {a.vol}</span>
                          <span className="miniTag">Volume: {a.volume}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Main layout */}
          <div className="row g-4">
            {/* Left content */}
            <div className="col-12 col-lg-8">
              <Card>
                {/* section title + progress */}
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.2rem" }}>
                      {sections[active].title}
                    </div>
                    <div className="text-muted small">
                      Section {active + 1} of {sections.length} • Built like a
                      real learning module
                    </div>
                  </div>

                  <div className="d-none d-md-flex align-items-center gap-2">
                    <span className="text-muted small">Selected:</span>
                    <span className="fw-bold">{selected.symbol}</span>
                    <span className="text-muted small">
                      (${selected.price.toFixed(2)})
                    </span>
                  </div>
                </div>

                {/* animated content container */}
                <div key={animateKey} className="fadeSlide">
                  {active === 0 && (
                    <>
                      <div className="premiumCallout">
                        <div className="fw-semibold mb-1">Big idea</div>
                        <div className="text-muted">
                          A stock is ownership. You’re not “buying a chart” —
                          you’re buying a tiny piece of a real business.
                        </div>
                      </div>

                      <p className="text-muted mt-3" style={{ lineHeight: 1.75 }}>
                        When a company wants to grow, it needs money. One way is
                        to sell ownership to the public through shares. If you
                        buy shares of{" "}
                        <span className="fw-semibold">{selected.name}</span>,
                        you become a small owner. Owners benefit if the company
                        grows in value — but they also share the risk when the
                        company struggles.
                      </p>

                      <div className="row g-3 mt-2">
                        <div className="col-12 col-md-6">
                          <div className="miniPanel">
                            <div className="fw-semibold mb-1">
                              Ownership example
                            </div>
                            <div className="text-muted">
                              If a company has 1,000 shares and you own 10
                              shares, you own 1% of it. That doesn’t mean you
                              control it — but it means you share the outcomes.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="miniPanel">
                            <div className="fw-semibold mb-1">
                              Why people invest
                            </div>
                            <div className="text-muted">
                              People invest hoping the company grows, earns
                              more, and becomes more valuable — so others pay
                              more for its shares later.
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="miniPanel mt-3">
                        <div className="fw-semibold mb-2">Before buying any stock, ask:</div>
                        <ul className="text-muted mb-0" style={{ paddingLeft: "1.1rem" }}>
                          <li className="mb-1">What does this company actually do?</li>
                          <li className="mb-1">Why is the price moving right now?</li>
                          <li>What is my risk if the trade goes against me?</li>
                        </ul>
                      </div>
                    </>
                  )}

                  {active === 1 && (
                    <>
                      <div className="premiumCallout">
                        <div className="fw-semibold mb-1">
                          The engine: supply & demand
                        </div>
                        <div className="text-muted">
                          If demand (buyers) increases faster than supply
                          (sellers), prices tend to rise — and vice versa.
                        </div>
                      </div>

                      <p className="text-muted mt-3" style={{ lineHeight: 1.75 }}>
                        Prices change every second because people place orders
                        constantly. If lots of traders decide{" "}
                        <span className="fw-semibold">{selected.symbol}</span>{" "}
                        is worth owning, they compete to buy it, pushing the
                        price up. If fear grows and many sell, the price falls.
                        A trading app often shows you “what changed today” —
                        usually news, earnings, guidance, or market mood.
                      </p>

                      <div className="row g-3 mt-2">
                        <div className="col-12 col-lg-4">
                          <div className="scenarioCard">
                            <div className="fw-semibold">📣 Good news</div>
                            <div className="text-muted small">
                              Strong results → more buyers → price often rises.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-lg-4">
                          <div className="scenarioCard">
                            <div className="fw-semibold">⚠️ Bad news</div>
                            <div className="text-muted small">
                              Weak outlook → more sellers → price can fall.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-lg-4">
                          <div className="scenarioCard">
                            <div className="fw-semibold">🔥 Hype / trend</div>
                            <div className="text-muted small">
                              Buzz → fast moves → higher risk (volatility).
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 miniPanel">
                        <div className="fw-semibold mb-2">
                          Catalysts for {selected.symbol} (example)
                        </div>
                        <ul
                          className="text-muted mb-0"
                          style={{ paddingLeft: "1.1rem" }}
                        >
                          {selected.catalysts.map((c, i) => (
                            <li key={i} className="mb-2">
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {active === 2 && (
                    <>
                      <div className="premiumCallout">
                        <div className="fw-semibold mb-1">How trading works</div>
                        <div className="text-muted">
                          Trading apps connect you to exchanges, match your
                          order, and show you price/volume/volatility.
                        </div>
                      </div>

                      <p className="text-muted mt-3" style={{ lineHeight: 1.75 }}>
                        You trade using a{" "}
                        <span className="fw-semibold">ticker</span> (like{" "}
                        {selected.symbol}). Your broker routes your order to an
                        exchange where buyers and sellers meet. Two important
                        prices appear in real trading:{" "}
                        <span className="fw-semibold">Bid</span> (what buyers
                        offer) and <span className="fw-semibold">Ask</span>{" "}
                        (what sellers want). The gap is the{" "}
                        <span className="fw-semibold">spread</span>.
                      </p>

                      <div className="row g-3 mt-2">
                        <div className="col-12 col-md-6">
                          <div className="miniPanel">
                            <div className="fw-semibold mb-1">Market order</div>
                            <div className="text-muted">
                              You want the trade now. You accept the current
                              available price.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="miniPanel">
                            <div className="fw-semibold mb-1">Limit order</div>
                            <div className="text-muted">
                              You set the price you’re willing to pay. It
                              executes only if the market reaches your price.
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {active === 3 && (
                    <>
                      <div className="premiumCallout">
                        <div className="fw-semibold mb-1">
                          Practice like a real app
                        </div>
                        <div className="text-muted">
                          Use an order ticket + profit/loss calculator. This is
                          how beginners build confidence.
                        </div>
                      </div>

                      <div className="row g-3 mt-3">
                        {/* Order ticket */}
                        <div className="col-12 col-lg-6">
                          <div className="orderTicket">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <div className="fw-bold">
                                  Order Ticket (demo)
                                </div>
                                <div className="text-muted small">
                                  {selected.symbol} • {selected.exch}
                                </div>
                              </div>
                              <span
                                className={`badge rounded-pill ${
                                  up
                                    ? "bg-success-subtle text-success"
                                    : "bg-danger-subtle text-danger"
                                }`}
                              >
                                {up ? "Up today" : "Down today"}
                              </span>
                            </div>

                            <div className="d-flex gap-2 mb-3">
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  orderType === "market"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() => setOrderType("market")}
                              >
                                Market
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  orderType === "limit"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() => setOrderType("limit")}
                              >
                                Limit
                              </button>
                            </div>

                            {orderType === "limit" && (
                              <div className="mb-3">
                                <label className="form-label fw-semibold">
                                  Limit price ($)
                                </label>
                                <input
                                  className="form-control form-control-lg"
                                  value={limitPrice}
                                  onChange={(e) =>
                                    setLimitPrice(e.target.value)
                                  }
                                  inputMode="decimal"
                                />
                                <div className="text-muted small mt-1">
                                  Your order executes only if price reaches your
                                  limit.
                                </div>
                              </div>
                            )}

                            <div className="mb-3">
                              <label className="form-label fw-semibold">
                                Quantity
                              </label>
                              <input
                                className="form-control form-control-lg"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                inputMode="numeric"
                              />
                            </div>

                            <div className="estBox">
                              <div className="text-muted small">
                                Estimated cost
                              </div>
                              <div
                                className="fw-bold"
                                style={{ fontSize: "1.15rem" }}
                              >
                                $
                                {Number.isFinite(estCost)
                                  ? estCost.toFixed(2)
                                  : "0.00"}
                              </div>
                              <div className="text-muted small">
                                (Demo) This is how apps preview your order
                                value.
                              </div>
                            </div>

                            <button
                              type="button"
                              className="btn btn-success w-100 mt-3 fw-semibold"
                            >
                              Place Demo Order
                            </button>
                          </div>
                        </div>

                        {/* P/L calculator */}
                        <div className="col-12 col-lg-6">
                          <div className="orderTicket">
                            <div className="fw-bold mb-1">
                              Profit / Loss calculator
                            </div>
                            <div className="text-muted small mb-3">
                              Change numbers and instantly see profit/loss
                              (demo).
                            </div>

                            <div className="row g-3">
                              <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold">
                                  Buy ($)
                                </label>
                                <input
                                  className="form-control form-control-lg"
                                  value={buy}
                                  onChange={(e) => setBuy(e.target.value)}
                                  inputMode="decimal"
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold">
                                  Sell ($)
                                </label>
                                <input
                                  className="form-control form-control-lg"
                                  value={sell}
                                  onChange={(e) => setSell(e.target.value)}
                                  inputMode="decimal"
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold">
                                  Qty
                                </label>
                                <input
                                  className="form-control form-control-lg"
                                  value={qty}
                                  onChange={(e) => setQty(e.target.value)}
                                />
                              </div>
                            </div>

                            <div
                              className="mt-3 pnlBox"
                              style={{
                                background:
                                  totalPnL >= 0
                                    ? "rgba(25,135,84,0.08)"
                                    : "rgba(220,53,69,0.08)",
                              }}
                            >
                              <div>
                                <div className="text-muted small">
                                  P/L per share
                                </div>
                                <div className="fw-bold">
                                  ${pnlPerShare.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted small">Total P/L</div>
                                <div className="fw-bold">
                                  ${totalPnL.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-muted small align-self-end">
                                (Sell − Buy) × Qty
                              </div>
                            </div>

                            <div className="miniPanel mt-3">
                              <div className="fw-semibold mb-1">
                                What you should learn here
                              </div>
                              <div className="text-muted">
                                Small price changes become big gains/losses with
                                higher quantity — that’s why risk management
                                matters.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {active === 4 && (
                    <>
                      <div className="premiumCallout">
                        <div className="fw-semibold mb-1">Recap for beginners</div>
                        <div className="text-muted">
                          If you remember these points, you are ready for Lesson 2.
                        </div>
                      </div>

                      <div className="row g-3 mt-2">
                        <div className="col-12 col-md-6">
                          <div className="miniPanel h-100">
                            <div className="fw-semibold mb-1">What a stock is</div>
                            <div className="text-muted">
                              A share is a small ownership piece of a company.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="miniPanel h-100">
                            <div className="fw-semibold mb-1">Why prices change</div>
                            <div className="text-muted">
                              Prices move because buyer demand and seller supply
                              keep changing.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="miniPanel h-100">
                            <div className="fw-semibold mb-1">How orders work</div>
                            <div className="text-muted">
                              Market order = faster execution, limit order = price control.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="miniPanel h-100">
                            <div className="fw-semibold mb-1">Risk first mindset</div>
                            <div className="text-muted">
                              Size and stop-loss matter more than guessing a perfect entry.
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="orderTicket mt-3">
                        <div className="fw-bold mb-1">Mini quiz (quick check)</div>
                        <div className="text-muted small mb-3">
                          Pick one answer for each question.
                        </div>

                        <div className="mb-3">
                          <div className="fw-semibold mb-2">
                            1) Buying a stock means:
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              type="button"
                              className={`btn btn-sm ${quiz.q1 === "ownership" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => setQuiz((q) => ({ ...q, q1: "ownership" }))}
                            >
                              Owning part of a company
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${quiz.q1 === "loan" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => setQuiz((q) => ({ ...q, q1: "loan" }))}
                            >
                              Giving a loan to a bank
                            </button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="fw-semibold mb-2">
                            2) Price usually rises when:
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              type="button"
                              className={`btn btn-sm ${quiz.q2 === "demand" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => setQuiz((q) => ({ ...q, q2: "demand" }))}
                            >
                              Demand is stronger than supply
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${quiz.q2 === "fees" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => setQuiz((q) => ({ ...q, q2: "fees" }))}
                            >
                              Broker fees increase
                            </button>
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="fw-semibold mb-2">
                            3) Limit order means:
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              type="button"
                              className={`btn btn-sm ${quiz.q3 === "limit" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => setQuiz((q) => ({ ...q, q3: "limit" }))}
                            >
                              You choose the maximum buy price
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${quiz.q3 === "instant" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => setQuiz((q) => ({ ...q, q3: "instant" }))}
                            >
                              It always executes instantly
                            </button>
                          </div>
                        </div>

                        {quizDone && (
                          <div className="mt-3 miniPanel">
                            <div className="fw-semibold mb-1">
                              Score: {quizScore} / 3
                            </div>
                            <div className="text-muted">
                              {quizScore === 3
                                ? "Great work. You’re ready to move to Lesson 2."
                                : "Good attempt. Review wrong points and try again."}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom controls */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button
                    className="btn btn-outline-secondary px-4 premiumBtnSoft"
                    onClick={() => setActive((s) => Math.max(0, s - 1))}
                    disabled={active === 0}
                  >
                    ← Previous
                  </button>

                  <div className="text-muted small d-none d-md-block">
                    Smooth lesson flow • Looks like a real course platform
                  </div>

                  <button
                    className="btn btn-primary px-4 premiumBtn"
                    onClick={() =>
                      setActive((s) => Math.min(sections.length - 1, s + 1))
                    }
                    disabled={active === sections.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </Card>

              {/* ✅ Moved below to remove huge blank gap */}
              <div className="row g-3 mt-3">
                <div className="col-12 col-lg-6">
                  <Card>
                    <div className="fw-bold mb-2">News & insights (demo)</div>
                    <div className="text-muted small mb-3">
                      Not live news — just example headlines to teach how to
                      think.
                    </div>

                    <div className="newsList">
                      {news.map((n, i) => (
                        <div key={i} className={`newsItem ${n.tone}`}>
                          <div className="newsTitle">{n.t}</div>
                          <div className="newsSub">{n.s}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <div className="fw-semibold" style={{ fontSize: 13 }}>
                        Catalysts for {selected.symbol}
                      </div>
                      <ul
                        className="text-muted mb-0"
                        style={{ paddingLeft: "1.1rem", marginTop: 8 }}
                      >
                        {selected.catalysts.map((c, i) => (
                          <li key={i} className="mb-2">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </div>

                <div className="col-12 col-lg-6">
                  <Card>
                    <div className="fw-bold mb-2">Quick glossary</div>
                    <div className="text-muted small mb-3">
                      Trading words you’ll see in apps
                    </div>

                    <div className="glossary">
                      {glossary.map((g, i) => (
                        <div key={i} className="glossRow">
                          <div className="glossKey">{g.k}</div>
                          <div className="glossVal">{g.v}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="col-12">
                  <Card>
                    <div className="fw-bold mb-2">Safety note</div>
                    <div className="text-muted" style={{ lineHeight: 1.65 }}>
                      eStock is an educational platform. These examples are mock
                      data and do not provide financial advice. Real markets
                      involve risk.
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right sidebar (only short cards to avoid empty left space) */}
            <div className="col-12 col-lg-4">
              <Card>
                <div className="fw-bold mb-2">Lesson roadmap</div>
                <div className="text-muted small mb-3">Jump to any section</div>

                <div className="d-grid gap-2">
                  {sections.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setActive(i)}
                      className={`btn text-start ${
                        i === active ? "btn-primary" : "btn-outline-primary"
                      }`}
                      style={{
                        borderRadius: 12,
                        background:
                          i === active
                            ? "linear-gradient(135deg,#2f6fed,#7b61ff)"
                            : undefined,
                        border: i === active ? "none" : undefined,
                        transition: "all .18s ease",
                      }}
                    >
                      <span className="fw-semibold">{s.title}</span>
                      <div className="small opacity-75 mt-1">
                        {i === 0 && "Ownership + examples"}
                        {i === 1 && "Demand, news, volatility"}
                        {i === 2 && "Bid/ask, market vs limit"}
                        {i === 3 && "Order + calculator"}
                        {i === 4 && "Recap + mini quiz"}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <div className="mt-4">
                <Card>
                  <div className="fw-bold mb-2">Selected asset</div>

                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">{selected.symbol}</div>
                      <div className="text-muted small">{selected.name}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">${selected.price.toFixed(2)}</div>
                      <div
                        className="small fw-semibold"
                        style={{ color: up ? "#198754" : "#dc3545" }}
                      >
                        {up ? "+" : ""}
                        {selected.change.toFixed(2)} ({up ? "+" : ""}
                        {selected.changePct.toFixed(2)}%)
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <span className="miniTag">Sector: {selected.sector}</span>
                    <span className="miniTag">Volatility: {selected.vol}</span>
                    <span className="miniTag">Volume: {selected.volume}</span>
                  </div>

                  <div className="mt-3 text-muted small">
                    This sidebar makes the page feel like a real trading
                    education app.
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* bottom actions */}
          <div className="mt-2 mb-3 d-flex gap-2 flex-wrap">
            <Link
              to="/home"
              className="btn btn-outline-secondary px-4 premiumBtnSoft"
            >
              Back to Home
            </Link>
            <Link
              to="/home#education"
              className="btn btn-success px-4 premiumBtn"
            >
              Back to Modules
            </Link>
          </div>
            </>
          )}
        </div>

        {/* Premium CSS inside component (no external file needed) */}
        <style>{`
          .premiumBg{
            position: relative;
            isolation: isolate;
            overflow: hidden;
            background:
              radial-gradient(circle at 12% 8%, rgba(37,99,235,0.11) 0%, rgba(37,99,235,0.02) 38%),
              radial-gradient(circle at 88% 92%, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.01) 42%),
              linear-gradient(180deg, #f7f9fc 0%, #f2f6fc 48%, #ffffff 100%);
          }

          .premiumBg > .container{
            position: relative;
            z-index: 1;
          }

          .premiumBg::before{
            content: "";
            position: absolute;
            inset: -20% -10%;
            pointer-events: none;
            z-index: 0;
            background: linear-gradient(
              120deg,
              rgba(255,255,255,0.00) 0%,
              rgba(255,255,255,0.42) 46%,
              rgba(255,255,255,0.00) 100%
            );
            transform: translateX(-45%);
            animation: premiumSweep 18s ease-in-out infinite;
          }

          .premiumBg::after{
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            opacity: 0.35;
            background:
              repeating-linear-gradient(90deg, rgba(15,23,42,0.014) 0 1px, transparent 1px 120px),
              repeating-linear-gradient(0deg, rgba(15,23,42,0.01) 0 1px, transparent 1px 120px);
          }

          .premiumTitle{ letter-spacing: -0.4px; }

          .premiumCard{
            transition: transform .18s ease, box-shadow .18s ease;
          }
          .premiumCard:hover{
            transform: translateY(-1px);
            box-shadow: 0 18px 40px rgba(15,23,42,0.06);
          }

          .watchCard{
            border: 1px solid rgba(15,23,42,0.10);
            background: rgba(255,255,255,0.75);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          }
          .watchCard:hover{
            transform: translateY(-2px);
            box-shadow: 0 18px 40px rgba(15,23,42,0.08);
            border-color: rgba(47,111,237,0.22);
          }
          .watchActive{
            border-color: rgba(47,111,237,0.35) !important;
            box-shadow: 0 18px 45px rgba(47,111,237,0.10);
          }

          .miniTag{
            display: inline-flex;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(15,23,42,0.05);
            color: rgba(15,23,42,0.75);
            font-size: 12px;
            font-weight: 700;
          }

          .premiumCallout{
            border-radius: 16px;
            padding: 14px 14px;
            background: linear-gradient(135deg, rgba(47,111,237,0.10), rgba(123,97,255,0.06));
            border: 1px solid rgba(47,111,237,0.14);
          }

          .miniPanel{
            border-radius: 16px;
            padding: 14px 14px;
            background: rgba(15,23,42,0.03);
            border: 1px solid rgba(15,23,42,0.07);
          }

          .lessonIntroGrid{
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 10px;
          }

          .introStep{
            border-radius: 14px;
            padding: 12px;
            border: 1px solid rgba(15,23,42,0.08);
            background: rgba(255,255,255,0.82);
            display: flex;
            align-items: flex-start;
            gap: 10px;
          }

          .introStepBtn{
            width: 100%;
            text-align: left;
            transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          }
          .introStepBtn:hover{
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(15,23,42,0.10);
            border-color: rgba(47,111,237,0.26);
          }
          .introStepBtn.isActive{
            border-color: rgba(47,111,237,0.35);
            background: linear-gradient(135deg, rgba(47,111,237,0.10), rgba(123,97,255,0.07));
            box-shadow: 0 14px 30px rgba(47,111,237,0.14);
          }

          .introNum{
            width: 30px;
            height: 30px;
            border-radius: 999px;
            display: grid;
            place-items: center;
            font-size: 11px;
            font-weight: 900;
            color: #2f6fed;
            background: rgba(47,111,237,0.12);
            border: 1px solid rgba(47,111,237,0.2);
            flex-shrink: 0;
          }

          .introStat{
            margin-top: 6px;
            font-size: 11px;
            font-weight: 900;
            color: #334155;
            letter-spacing: .2px;
          }

          .introDetail{
            border-radius: 16px;
            padding: 14px;
            border: 1px solid rgba(15,23,42,0.09);
            background: rgba(255,255,255,0.88);
            box-shadow: 0 12px 30px rgba(15,23,42,0.06);
          }

          .introKicker{
            font-size: 12px;
            font-weight: 900;
            color: rgba(15,23,42,0.55);
            text-transform: uppercase;
            letter-spacing: .45px;
          }

          .introBadge{
            display: inline-flex;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            color: #1d4ed8;
            border: 1px solid rgba(47,111,237,0.20);
            background: rgba(47,111,237,0.10);
          }

          .introScript{
            font-family: "Caveat", "Bradley Hand", "Brush Script MT", cursive;
            letter-spacing: .3px;
          }

          .scenarioCard{
            border-radius: 16px;
            padding: 14px;
            background: rgba(255,255,255,0.75);
            border: 1px solid rgba(15,23,42,0.08);
            box-shadow: 0 14px 28px rgba(15,23,42,0.05);
          }

          .orderTicket{
            border-radius: 18px;
            padding: 16px;
            background: rgba(255,255,255,0.78);
            border: 1px solid rgba(15,23,42,0.08);
            box-shadow: 0 16px 34px rgba(15,23,42,0.06);
          }

          .estBox{
            border-radius: 14px;
            padding: 12px;
            background: rgba(47,111,237,0.07);
            border: 1px solid rgba(47,111,237,0.12);
          }

          .pnlBox{
            border-radius: 14px;
            padding: 12px;
            border: 1px solid rgba(15,23,42,0.08);
            display: flex;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }

          .premiumBtn{
            border: none !important;
            background: linear-gradient(135deg,#2f6fed,#7b61ff) !important;
            box-shadow: 0 14px 30px rgba(47,111,237,0.20);
            border-radius: 12px !important;
            transition: transform .18s ease, box-shadow .18s ease;
          }
          .premiumBtn:hover{
            transform: translateY(-2px);
            box-shadow: 0 18px 40px rgba(123,97,255,0.22);
          }

          .premiumBtnSoft{ border-radius: 12px !important; }

          .fadeSlide{ animation: fadeSlide .28s ease both; }
          @keyframes fadeSlide{
            from{ opacity: 0; transform: translateY(8px); }
            to{ opacity: 1; transform: translateY(0); }
          }

          @keyframes premiumSweep{
            0%{ transform: translateX(-45%) translateY(-2%); }
            50%{ transform: translateX(25%) translateY(2%); }
            100%{ transform: translateX(-45%) translateY(-2%); }
          }

          .moverRow{
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .moverItem{
            border-radius: 16px;
            padding: 12px;
            background: rgba(15,23,42,0.03);
            border: 1px solid rgba(15,23,42,0.07);
          }
          .moverLabel{
            font-size: 12px;
            font-weight: 800;
            color: rgba(15,23,42,0.55);
          }
          .moverValue{
            margin-top: 4px;
            font-weight: 950;
            color: #0f172a;
            font-size: 18px;
            letter-spacing: -0.2px;
          }
          .moverSub{
            margin-top: 4px;
            font-size: 12px;
            font-weight: 800;
            color: rgba(15,23,42,0.55);
          }
          .moverSub.pos{ color: #198754; }
          .moverSub.neg{ color: #dc3545; }

          .newsList{ display: grid; gap: 10px; }
          .newsItem{
            border-radius: 16px;
            padding: 12px;
            border: 1px solid rgba(15,23,42,0.08);
            background: rgba(255,255,255,0.70);
            box-shadow: 0 12px 26px rgba(15,23,42,0.04);
          }
          .newsItem.pos{ border-color: rgba(25,135,84,0.18); background: rgba(25,135,84,0.06); }
          .newsItem.neg{ border-color: rgba(220,53,69,0.18); background: rgba(220,53,69,0.06); }
          .newsItem.info{ border-color: rgba(47,111,237,0.18); background: rgba(47,111,237,0.06); }
          .newsItem.tip{ border-color: rgba(123,97,255,0.18); background: rgba(123,97,255,0.06); }
          .newsTitle{ font-weight: 950; color: #0f172a; }
          .newsSub{ margin-top: 4px; font-size: 12px; font-weight: 800; color: rgba(15,23,42,0.60); line-height: 1.6; }

          .glossary{ display: grid; gap: 10px; }
          .glossRow{
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(15,23,42,0.03);
            border: 1px solid rgba(15,23,42,0.07);
          }
          .glossKey{ font-weight: 950; color: #0f172a; font-size: 13px; }
          .glossVal{ font-weight: 800; color: rgba(15,23,42,0.62); font-size: 12px; line-height: 1.55; }

          @media (max-width: 768px){
            .moverRow{ grid-template-columns: 1fr; }
            .glossRow{ grid-template-columns: 1fr; }
            .lessonIntroGrid{ grid-template-columns: 1fr; }
          }

          @media (max-width: 1200px){
            .lessonIntroGrid{
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 992px){
            .lessonIntroGrid{
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (prefers-reduced-motion: reduce){
            .premiumBg::before{
              animation: none;
            }
          }
        `}</style>
      </section>

      <Footer />
    </>
  );
}
