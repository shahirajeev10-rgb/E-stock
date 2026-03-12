import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbaar from "../Navbar";
import Footer from "../Footer";
import useLessonProgress from "./useLessonProgress";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

function formatGBP(value) {
  return gbp.format(value);
}

function formatPct(value) {
  const n = Number(value || 0);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export default function PortfolioLesson() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState("holdings");
  const [entry, setEntry] = useState("182.4");
  const [stop, setStop] = useState("178.8");
  const [target, setTarget] = useState("190");
  const [riskBudget, setRiskBudget] = useState("80");

  const plannerTouched = useMemo(
    () =>
      entry !== "182.4" ||
      stop !== "178.8" ||
      target !== "190" ||
      riskBudget !== "80" ||
      view === "orders",
    [entry, riskBudget, stop, target, view]
  );

  const positions = useMemo(
    () => [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        sector: "Technology",
        qty: 12,
        avg: 178.2,
        last: 182.4,
        dayPct: 1.12,
      },
      {
        symbol: "MSFT",
        name: "Microsoft",
        sector: "Technology",
        qty: 5,
        avg: 405.1,
        last: 418.8,
        dayPct: 0.84,
      },
      {
        symbol: "TSLA",
        name: "Tesla",
        sector: "Automotive",
        qty: 8,
        avg: 198.6,
        last: 193.2,
        dayPct: -0.84,
      },
      {
        symbol: "SONY",
        name: "Sony",
        sector: "Consumer",
        qty: 16,
        avg: 87.5,
        last: 89.3,
        dayPct: 0.35,
      },
    ],
    []
  );

  const orders = useMemo(
    () => [
      { time: "09:42", side: "Buy", symbol: "AAPL", qty: 4, price: 181.7, status: "Filled" },
      { time: "10:18", side: "Sell", symbol: "TSLA", qty: 2, price: 194.1, status: "Filled" },
      { time: "11:03", side: "Buy", symbol: "MSFT", qty: 1, price: 417.4, status: "Filled" },
      { time: "11:27", side: "Buy", symbol: "SONY", qty: 6, price: 89.0, status: "Partial" },
    ],
    []
  );

  const {
    totalValue,
    unrealizedPnL,
    dayPnL,
    cash,
    buyingPower,
    totalPnLPct,
    dayPnLPct,
    allocations,
    riskScore,
  } = useMemo(() => {
    const totals = positions.reduce(
      (acc, p) => {
        const marketValue = p.qty * p.last;
        const cost = p.qty * p.avg;
        const unrealized = marketValue - cost;
        const dayMove = marketValue * (p.dayPct / 100);
        acc.value += marketValue;
        acc.cost += cost;
        acc.unrealized += unrealized;
        acc.day += dayMove;
        acc.sectors[p.sector] = (acc.sectors[p.sector] || 0) + marketValue;
        return acc;
      },
      { value: 0, cost: 0, unrealized: 0, day: 0, sectors: {} }
    );

    const cashValue = 2450;
    const bp = cashValue * 3;
    const portValue = totals.value + cashValue;
    const totalPct = totals.cost > 0 ? (totals.unrealized / totals.cost) * 100 : 0;
    const dayPct = totals.value > 0 ? (totals.day / totals.value) * 100 : 0;

    const rawAlloc = Object.entries(totals.sectors).map(([sector, value]) => ({
      sector,
      value,
      pct: totals.value > 0 ? (value / totals.value) * 100 : 0,
    }));

    const concentration = rawAlloc.reduce((m, x) => Math.max(m, x.pct), 0);
    const lossNames = positions.filter((x) => x.last < x.avg).length;
    const score = Math.round(Math.min(100, concentration * 0.8 + lossNames * 8));

    return {
      totalValue: portValue,
      unrealizedPnL: totals.unrealized,
      dayPnL: totals.day,
      cash: cashValue,
      buyingPower: bp,
      totalPnLPct: totalPct,
      dayPnLPct: dayPct,
      allocations: rawAlloc.sort((a, b) => b.value - a.value),
      riskScore: score,
    };
  }, [positions]);

  const {
    riskPerShare,
    rewardPerShare,
    suggestedShares,
    plannedRisk,
    plannedReward,
    rr,
    breakEven,
  } = useMemo(() => {
    const e = Number(entry);
    const s = Number(stop);
    const t = Number(target);
    const rb = Number(riskBudget);

    const risk = Number.isFinite(e) && Number.isFinite(s) ? Math.max(0, e - s) : 0;
    const reward = Number.isFinite(e) && Number.isFinite(t) ? Math.max(0, t - e) : 0;
    const shares = risk > 0 && Number.isFinite(rb) ? Math.max(0, Math.floor(rb / risk)) : 0;
    const r = risk > 0 ? reward / risk : 0;

    return {
      riskPerShare: risk,
      rewardPerShare: reward,
      suggestedShares: shares,
      plannedRisk: shares * risk,
      plannedReward: shares * reward,
      rr: r,
      breakEven: e,
    };
  }, [entry, stop, target, riskBudget]);

  const riskTone = riskScore >= 70 ? "danger" : riskScore >= 45 ? "warning" : "success";
  const riskLabel = riskScore >= 70 ? "High Concentration" : riskScore >= 45 ? "Balanced-Moderate" : "Low";

  const lessonProgressPct = useMemo(() => {
    if (!started) return 15;
    let pct = 70;
    if (view === "orders") pct += 15;
    if (plannerTouched) pct += 15;
    return Math.min(100, pct);
  }, [plannerTouched, started, view]);

  const lessonProgress = useLessonProgress({
    lessonKey: "profit-loss-portfolio",
    title: "Lesson 3: Profit, Loss & Portfolio",
    path: "/lessons/profit-loss-portfolio",
    progressPct: lessonProgressPct,
    lastStep: started ? (plannerTouched ? 3 : view === "orders" ? 2 : 1) : 0,
    totalSteps: 3,
  });

  return (
    <>
      <Navbaar />

      <section
        className="py-5"
        style={{
          minHeight: "76vh",
          background: "radial-gradient(circle at top left, #eef4ff 0%, #ffffff 50%, #ebfdf5 100%)",
        }}
      >
        <div className="container">
          <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-end gap-3 mb-4">
            <div>
              <span
                className="badge rounded-pill"
                style={{
                  background: "rgba(15,23,42,0.08)",
                  color: "#0f172a",
                  padding: "8px 14px",
                  letterSpacing: "0.5px",
                }}
              >
                LESSON 3 - PROFIT, LOSS & PORTFOLIO
              </span>
              <h2 className="fw-bold mt-3 mb-2" style={{ fontSize: "2rem" }}>
                {started ? "Portfolio Terminal" : "Lesson 3 Briefing"}
              </h2>
              <p className="text-muted mb-0" style={{ maxWidth: 760 }}>
                {started
                  ? "Read your P/L like a broker screen: position value, unrealized gain/loss, day move, allocation, and risk-adjusted position sizing."
                  : "First understand what each panel means. Then open the terminal and practice with confidence."}
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <span className="badge rounded-pill text-bg-light border align-self-center">
                Progress {Math.round(lessonProgress.progressPct)}%
              </span>
              <Link to="/dashboard" className="btn btn-outline-secondary px-4">
                Back to Dashboard
              </Link>
              {started ? (
                <Link to="/demo/price-movement" className="btn btn-primary px-4">
                  Open Demo
                </Link>
              ) : (
                <Link to="/lessons/price-movement" className="btn btn-primary px-4">
                  Review Lesson 2
                </Link>
              )}
            </div>
          </div>

          {!started ? (
            <div className="row g-4">
              <div className="col-12 col-xl-8">
                <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
                  <h5 className="fw-bold mb-3">Before You Start Lesson 3</h5>
                  <p className="text-muted mb-3">
                    In this lesson, you are not placing real trades. You are learning how to read a
                    portfolio screen like a broker app and make safer decisions.
                  </p>

                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <div className="rounded-4 p-3 h-100" style={{ background: "rgba(47,111,237,0.08)", border: "1px solid rgba(47,111,237,0.14)" }}>
                        <div className="fw-semibold mb-1">1. Read P/L Panels</div>
                        <div className="small text-muted">Portfolio value, day P/L, and unrealized P/L.</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="rounded-4 p-3 h-100" style={{ background: "rgba(25,135,84,0.08)", border: "1px solid rgba(25,135,84,0.14)" }}>
                        <div className="fw-semibold mb-1">2. Check Risk</div>
                        <div className="small text-muted">See allocation concentration and risk meter.</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="rounded-4 p-3 h-100" style={{ background: "rgba(123,97,255,0.08)", border: "1px solid rgba(123,97,255,0.14)" }}>
                        <div className="fw-semibold mb-1">3. Plan Position Size</div>
                        <div className="small text-muted">Use entry, stop, and risk budget to size trades.</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-4 p-3 mt-3" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.08)" }}>
                    <div className="small text-muted">
                      Recommended first: Lesson 1 and Lesson 2. This screen uses demo values only for training.
                    </div>
                  </div>

                  <div className="d-flex gap-2 flex-wrap mt-3">
                    <button type="button" className="btn btn-dark px-4" onClick={() => setStarted(true)}>
                      Start Lesson 3 Terminal
                    </button>
                    <Link to="/lessons/price-movement" className="btn btn-outline-secondary px-4">
                      Revise Lesson 2
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
                  <h6 className="fw-bold mb-3">Quick Terms</h6>
                  <ul className="list-unstyled d-grid gap-2 m-0">
                    <li className="small text-muted"><b>P/L:</b> Profit or Loss.</li>
                    <li className="small text-muted"><b>Unrealized P/L:</b> Gain/loss on open positions.</li>
                    <li className="small text-muted"><b>Day P/L:</b> Today's movement only.</li>
                    <li className="small text-muted"><b>Allocation:</b> How your money is split by sector/asset.</li>
                    <li className="small text-muted"><b>Risk Budget:</b> Max amount you're willing to lose per trade.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-3 mb-3">
                <Metric label="Portfolio Value" value={formatGBP(totalValue)} tone="dark" />
                <Metric label="Day P/L" value={`${formatGBP(dayPnL)} (${formatPct(dayPnLPct)})`} tone={dayPnL >= 0 ? "up" : "down"} />
                <Metric label="Total Unrealized P/L" value={`${formatGBP(unrealizedPnL)} (${formatPct(totalPnLPct)})`} tone={unrealizedPnL >= 0 ? "up" : "down"} />
                <Metric label="Cash / Buying Power" value={`${formatGBP(cash)} / ${formatGBP(buyingPower)}`} tone="muted" />
              </div>

              <div className="row g-4">
                <div className="col-12 col-xl-8">
                  <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <h5 className="fw-bold m-0">Positions</h5>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className={`btn ${view === "holdings" ? "btn-dark" : "btn-outline-secondary"}`}
                          onClick={() => setView("holdings")}
                        >
                          Holdings
                        </button>
                        <button
                          type="button"
                          className={`btn ${view === "orders" ? "btn-dark" : "btn-outline-secondary"}`}
                          onClick={() => setView("orders")}
                        >
                          Orders
                        </button>
                      </div>
                    </div>

                    {view === "holdings" ? (
                      <div className="table-responsive">
                        <table className="table align-middle mb-0">
                          <thead>
                            <tr className="small text-secondary">
                              <th>Symbol</th>
                              <th className="text-end">Qty</th>
                              <th className="text-end">Avg</th>
                              <th className="text-end">Last</th>
                              <th className="text-end">Market Value</th>
                              <th className="text-end">Unrealized</th>
                              <th className="text-end">Day</th>
                            </tr>
                          </thead>
                          <tbody>
                            {positions.map((p) => {
                              const mv = p.qty * p.last;
                              const unreal = p.qty * (p.last - p.avg);
                              const day = mv * (p.dayPct / 100);
                              return (
                                <tr key={p.symbol}>
                                  <td>
                                    <div className="fw-semibold">{p.symbol}</div>
                                    <div className="text-muted small">{p.name}</div>
                                  </td>
                                  <td className="text-end">{p.qty}</td>
                                  <td className="text-end">{formatGBP(p.avg)}</td>
                                  <td className="text-end">{formatGBP(p.last)}</td>
                                  <td className="text-end fw-semibold">{formatGBP(mv)}</td>
                                  <td className={`text-end fw-semibold ${unreal >= 0 ? "text-success" : "text-danger"}`}>
                                    {formatGBP(unreal)}
                                  </td>
                                  <td className={`text-end fw-semibold ${day >= 0 ? "text-success" : "text-danger"}`}>
                                    {formatGBP(day)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table align-middle mb-0">
                          <thead>
                            <tr className="small text-secondary">
                              <th>Time</th>
                              <th>Side</th>
                              <th>Symbol</th>
                              <th className="text-end">Qty</th>
                              <th className="text-end">Price</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((o, idx) => (
                              <tr key={`${o.symbol}-${idx}`}>
                                <td>{o.time}</td>
                                <td>
                                  <span className={`badge rounded-pill ${o.side === "Buy" ? "text-bg-success" : "text-bg-danger"}`}>
                                    {o.side}
                                  </span>
                                </td>
                                <td className="fw-semibold">{o.symbol}</td>
                                <td className="text-end">{o.qty}</td>
                                <td className="text-end">{formatGBP(o.price)}</td>
                                <td>
                                  <span className="badge rounded-pill text-bg-light border">{o.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-xl-4">
                  <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 mb-3" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
                    <h6 className="fw-bold mb-3">Allocation</h6>
                    <div className="d-grid gap-3">
                      {allocations.map((a) => (
                        <div key={a.sector}>
                          <div className="d-flex justify-content-between small mb-1">
                            <span className="fw-semibold">{a.sector}</span>
                            <span className="text-muted">{a.pct.toFixed(1)}%</span>
                          </div>
                          <div className="progress" style={{ height: 8 }}>
                            <div className="progress-bar bg-primary" style={{ width: `${a.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-4 shadow-sm p-3 p-md-4" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold m-0">Risk Meter</h6>
                      <span className={`badge rounded-pill text-bg-${riskTone}`}>{riskLabel}</span>
                    </div>
                    <div className="progress mb-2" style={{ height: 10 }}>
                      <div
                        className={`progress-bar bg-${riskTone}`}
                        role="progressbar"
                        style={{ width: `${riskScore}%` }}
                        aria-valuenow={riskScore}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                    <div className="small text-muted">
                      Score {riskScore}/100 based on sector concentration and losing positions.
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4 mt-1">
                <div className="col-12 col-xl-8">
                  <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
                    <h5 className="fw-bold mb-3">Position Size Planner</h5>
                    <div className="row g-3">
                      <Input label="Entry Price" value={entry} onChange={setEntry} />
                      <Input label="Stop Price" value={stop} onChange={setStop} />
                      <Input label="Target Price" value={target} onChange={setTarget} />
                      <Input label="Risk Budget (£)" value={riskBudget} onChange={setRiskBudget} />
                    </div>

                    <div className="row g-3 mt-1">
                      <div className="col-12 col-md-4">
                        <StatLine label="Risk / Share" value={formatGBP(riskPerShare)} />
                      </div>
                      <div className="col-12 col-md-4">
                        <StatLine label="Reward / Share" value={formatGBP(rewardPerShare)} />
                      </div>
                      <div className="col-12 col-md-4">
                        <StatLine label="R:R" value={rr > 0 ? `${rr.toFixed(2)} : 1` : "-"} />
                      </div>
                      <div className="col-12 col-md-4">
                        <StatLine label="Suggested Shares" value={String(suggestedShares)} />
                      </div>
                      <div className="col-12 col-md-4">
                        <StatLine label="Planned Risk" value={formatGBP(plannedRisk)} />
                      </div>
                      <div className="col-12 col-md-4">
                        <StatLine label="Planned Reward" value={formatGBP(plannedReward)} />
                      </div>
                    </div>

                    <div
                      className="rounded-4 p-3 mt-3"
                      style={{
                        background: "rgba(15,23,42,0.03)",
                        border: "1px solid rgba(15,23,42,0.08)",
                      }}
                    >
                      <div className="small text-muted">
                        Break-even starts near <b>{formatGBP(breakEven)}</b>. This is a training planner,
                        not live investment advice.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-xl-4">
                  <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
                    <h6 className="fw-bold mb-3">Lesson Outcomes</h6>
                    <ul className="list-unstyled d-grid gap-2 m-0">
                      <li className="small text-muted">- Read unrealized and day P/L fast.</li>
                      <li className="small text-muted">- Track allocation concentration risk.</li>
                      <li className="small text-muted">- Size trades using stop-based risk.</li>
                      <li className="small text-muted">- Keep cash and buying power in view.</li>
                    </ul>

                    <div className="d-grid gap-2 mt-4">
                      <Link to="/dashboard" className="btn btn-dark">
                        Back to Dashboard
                      </Link>
                      <Link to="/lessons/price-movement" className="btn btn-outline-secondary">
                        Review Lesson 2
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

function Metric({ label, value, tone }) {
  const toneStyles = {
    dark: { bg: "rgba(15,23,42,0.92)", color: "#fff" },
    up: { bg: "rgba(25,135,84,0.12)", color: "#198754" },
    down: { bg: "rgba(220,53,69,0.12)", color: "#dc3545" },
    muted: { bg: "rgba(15,23,42,0.06)", color: "#0f172a" },
  }[tone];

  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div
        className="rounded-4 p-3 h-100"
        style={{
          background: toneStyles.bg,
          color: toneStyles.color,
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <div className="small fw-semibold" style={{ opacity: 0.8 }}>
          {label}
        </div>
        <div className="fw-bold mt-1" style={{ fontSize: "1.2rem" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <label className="form-label small text-muted fw-semibold">{label}</label>
      <input
        type="number"
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function StatLine({ label, value }) {
  return (
    <div
      className="rounded-4 p-3 h-100"
      style={{ border: "1px solid rgba(15,23,42,0.08)", background: "rgba(15,23,42,0.02)" }}
    >
      <div className="small text-muted fw-semibold">{label}</div>
      <div className="fw-bold mt-1">{value}</div>
    </div>
  );
}
