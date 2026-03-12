import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbaar from "../Navbar";
import Footer from "../Footer";

export default function PriceMovement() {
  const [searchParams] = useSearchParams();

  const readQueryNumberString = (key, fallback) => {
    const raw = searchParams.get(key);
    if (raw === null || raw === "") return String(fallback);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? String(parsed) : String(fallback);
  };

  const [demand, setDemand] = useState(62);
  const [supply, setSupply] = useState(44);
  const [news, setNews] = useState("neutral");
  const [focus, setFocus] = useState("AAPL");
  const [simAccount, setSimAccount] = useState(() => readQueryNumberString("account", 10000));
  const [simRiskPct, setSimRiskPct] = useState(() => readQueryNumberString("riskPct", 1.5));
  const [simEntry, setSimEntry] = useState(() => readQueryNumberString("entry", 150));
  const [simStop, setSimStop] = useState(() => readQueryNumberString("stop", 145));
  const [simTarget, setSimTarget] = useState(() => readQueryNumberString("target", 162));
  const [simLeverage, setSimLeverage] = useState(() => readQueryNumberString("leverage", 1.5));
  const [simSlippage, setSimSlippage] = useState(() => readQueryNumberString("slippage", 0.8));
  const fromRiskLab = searchParams.get("from") === "risk-lab";

  const [hover, setHover] = useState(null);

  const stocks = useMemo(
    () => [
      { sym: "AAPL", name: "Apple", base: 182.4, color: "rgba(47,111,237,0.95)" },
      { sym: "TSLA", name: "Tesla", base: 193.2, color: "rgba(220,53,69,0.90)" },
      { sym: "SONY", name: "Sony", base: 89.3, color: "rgba(25,135,84,0.92)" },
      { sym: "SSNLF", name: "Samsung", base: 52.8, color: "rgba(123,97,255,0.90)" },
    ],
    []
  );

  const newsShift = useMemo(() => {
    if (news === "good") return 10;
    if (news === "bad") return -10;
    return 0;
  }, [news]);

  const pressure = useMemo(() => {
    const raw = (demand - supply) * 0.45 + newsShift;
    return Math.max(-30, Math.min(30, raw));
  }, [demand, supply, newsShift]);

  const marketStatus = useMemo(() => {
    if (pressure >= 18)
      return {
        title: "Bullish momentum",
        tone: "success",
        statusLine: "Buyers are dominating sellers",
        msg:
          "Demand is clearly stronger than supply. When buyers compete for limited shares, price tends to lift faster.",
        effect:
          "Prices rise quicker and volatility can increase, especially in high-sensitivity stocks.",
        whatToDo:
          "Don’t chase sudden spikes. If you enter, use smaller size and have a plan (risk control).",
        drivers: "High demand + positive sentiment",
      };

    if (pressure >= 6)
      return {
        title: "Steady upward movement",
        tone: "primary",
        statusLine: "More buyers than sellers",
        msg:
          "Buyers are slightly ahead of sellers. Price tends to rise, but usually in a smoother way.",
        effect:
          "More stable uptrend. News reactions still matter.",
        whatToDo:
          "Great for learning: observe how news changes the curve and how quickly it reacts.",
        drivers: "Buyers slightly ahead of sellers",
      };

    if (pressure > -6)
      return {
        title: "Range / balance",
        tone: "secondary",
        statusLine: "Demand and supply are balanced",
        msg:
          "Neither side dominates. Price often moves sideways and reacts in small bursts to events.",
        effect:
          "Small swings, short bursts, then stabilises.",
        whatToDo:
          "Be patient. Watch for a clear reason (news/event) before expecting direction.",
        drivers: "Supply roughly matches demand",
      };

    if (pressure > -18)
      return {
        title: "Soft sell-off",
        tone: "warning",
        statusLine: "Sellers are slightly stronger",
        msg:
          "Selling pressure is ahead of buying interest. Prices can drift down slowly, especially if confidence weakens.",
        effect:
          "Downtrend with cautious buyers.",
        whatToDo:
          "Avoid panic. Learn why it’s dropping (news vs fear). Don’t go all-in on one stock.",
        drivers: "Sellers slightly ahead of buyers",
      };

    return {
      title: "Bearish pressure",
      tone: "danger",
      statusLine: "Sellers dominate the market",
      msg:
        "Supply is dominating demand. When many people sell at once, price can fall quickly.",
      effect:
        "Faster drops + higher volatility.",
      whatToDo:
        "This is where risk-control matters most: diversify, use small positions, avoid emotional decisions.",
      drivers: "High supply + negative sentiment",
    };
  }, [pressure]);

  const series = useMemo(() => {
    const N = 48;
    const drift = pressure / 240;

    const rhythm = (i) =>
      Math.sin(i / 4.6) * 0.0026 + Math.sin(i / 10.5) * 0.0019;

    const sensitivity = { AAPL: 0.9, TSLA: 1.4, SONY: 0.75, SSNLF: 0.65 };

    const make = (base, sym) => {
      const out = [];
      let p = base;

      for (let i = 0; i < N; i++) {
        const newsPulse = (newsShift / 1100) * (1 - i / (N - 1));
        const micro = Math.sin((i + base) / 3.9) * 0.0012;

        const step =
          drift * sensitivity[sym] +
          rhythm(i) * sensitivity[sym] +
          newsPulse * sensitivity[sym] +
          micro;

        p = Math.max(1, p * (1 + step));
        out.push(Number(p.toFixed(2)));
      }

      return out;
    };

    const result = {};
    stocks.forEach((s) => (result[s.sym] = make(s.base, s.sym)));

    const idxArr = [];
    const len = result[stocks[0].sym].length;
    for (let i = 0; i < len; i++) {
      const avg =
        (result.AAPL[i] + result.TSLA[i] + result.SONY[i] + result.SSNLF[i]) / 4;
      idxArr.push(Number(avg.toFixed(2)));
    }
    result.INDEX = idxArr;

    return result;
  }, [pressure, newsShift, stocks]);

  const chartMeta = useMemo(() => {
    const all = Object.values(series).flat();
    const min = Math.min(...all);
    const max = Math.max(...all);
    const pad = (max - min) * 0.14 || 1;
    return { min: min - pad, max: max + pad };
  }, [series]);

  const focusStock = stocks.find((s) => s.sym === focus);

  const focusArr = series[focus] || [];
  const focusFirst = focusArr[0] || focusStock?.base || 1;
  const focusLast = focusArr[focusArr.length - 1] || focusFirst;
  const pct = ((focusLast - focusFirst) / focusFirst) * 100;
  const pctText = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;

  const hoverIndex = hover?.index ?? null;
  const shownIndex = hoverIndex ?? (focusArr.length ? focusArr.length - 1 : 0);

  const currentPrice = (sym) => {
    const arr = series[sym] || [];
    return arr[Math.min(arr.length - 1, Math.max(0, shownIndex))];
  };

  const indexNow = currentPrice("INDEX");
  const indexStart = (series.INDEX && series.INDEX[0]) || indexNow || 1;
  const indexPct = ((indexNow - indexStart) / indexStart) * 100;

  const riskSim = useMemo(() => {
    const account = Math.max(0, Number(simAccount) || 0);
    const riskPct = Math.max(0, Number(simRiskPct) || 0);
    const entryPrice = Math.max(0, Number(simEntry) || 0);
    const stopPrice = Math.max(0, Number(simStop) || 0);
    const targetPrice = Math.max(0, Number(simTarget) || 0);
    const leverage = Math.max(1, Number(simLeverage) || 1);
    const slippagePct = Math.max(0, Number(simSlippage) || 0);

    const riskBudget = (account * riskPct) / 100;
    const stopValid = stopPrice < entryPrice;
    const targetValid = targetPrice > entryPrice;
    const riskPerShare = stopValid ? entryPrice - stopPrice : 0;
    const rewardPerShare = targetValid ? targetPrice - entryPrice : 0;
    const shares = riskPerShare > 0 ? Math.floor(riskBudget / riskPerShare) : 0;
    const rr = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
    const positionValue = shares * entryPrice;
    const requiredCapital = leverage > 0 ? positionValue / leverage : positionValue;
    const gapPerShare = (entryPrice * slippagePct) / 100;
    const stressedLoss = shares * (riskPerShare + gapPerShare);

    const checks = {
      riskCap: riskPct > 0 && riskPct <= 2,
      stopValid,
      targetValid,
      rrGood: rr >= 2,
      capitalFit: requiredCapital <= account,
    };

    const score = Object.values(checks).filter(Boolean).length;
    const pass = score >= 4;

    return {
      riskBudget,
      shares,
      rr,
      positionValue,
      requiredCapital,
      stressedLoss,
      checks,
      score,
      pass,
    };
  }, [simAccount, simRiskPct, simEntry, simStop, simTarget, simLeverage, simSlippage]);

  const riskValidation = useMemo(() => {
    const account = Number(simAccount);
    const riskPct = Number(simRiskPct);
    const entryPrice = Number(simEntry);
    const stopPrice = Number(simStop);
    const targetPrice = Number(simTarget);
    const leverage = Number(simLeverage);
    const notes = [];

    if (!(account > 0)) notes.push("Account must be greater than GBP 0.");
    if (!(riskPct > 0)) notes.push("Risk % must be above 0.");
    else if (riskPct > 2) notes.push("Risk % should stay at 2 or below.");
    if (!(entryPrice > 0)) notes.push("Entry must be greater than GBP 0.");
    if (!(stopPrice > 0)) notes.push("Stop must be greater than GBP 0.");
    if (!(targetPrice > 0)) notes.push("Target must be greater than GBP 0.");
    if (entryPrice > 0 && stopPrice >= entryPrice) notes.push("Stop must be below entry for a long setup.");
    if (entryPrice > 0 && targetPrice <= entryPrice) notes.push("Target should be above entry.");
    if (Number.isFinite(leverage) && leverage < 1) notes.push("Leverage must be at least 1x.");
    if (
      riskSim.shares === 0 &&
      account > 0 &&
      riskPct > 0 &&
      entryPrice > 0 &&
      stopPrice > 0 &&
      stopPrice < entryPrice
    ) {
      notes.push("Budget is too small for 1 share. Increase account/risk or tighten stop.");
    }

    return notes;
  }, [simAccount, simRiskPct, simEntry, simStop, simTarget, simLeverage, riskSim.shares]);

  return (
    <>
      <Navbaar />

      <section
        className="py-5"
        style={{
          minHeight: "78vh",
          background:
            "radial-gradient(circle at top left, #eef4ff 0%, #ffffff 44%, #eafff2 100%)",
        }}
      >
        <div className="container">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
            <div>
              <span
                className="badge rounded-pill"
                style={{
                  background: "rgba(47,111,237,0.12)",
                  color: "#2f6fed",
                  padding: "10px 14px",
                  letterSpacing: "0.6px",
                }}
              >
                INTERACTIVE • PRICE MOVEMENT
              </span>

              <h2 className="fw-bold mt-3 mb-2" style={{ fontSize: "2.25rem" }}>
                Supply, demand, news → price movement
              </h2>

              <p className="text-muted mb-0" style={{ maxWidth: 920 }}>
                Hover the chart to inspect values like a real trading app. The demo is simplified,
                but it follows real market logic: <b>orders + sentiment</b> drive price.
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <Link to="/lessons/price-movement" className="btn btn-outline-secondary px-4">
                ← Back to Lesson
              </Link>
              <Link to="/" className="btn btn-success px-4">
                Home
              </Link>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <div
                className="rounded-4 shadow-sm p-4 p-md-5 h-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(245,250,255,0.96))",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <h4 className="fw-bold mb-1">Market controls</h4>
                    <div className="text-muted small">
                      Adjust the drivers and watch the index + stocks react.
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-muted small">Focus</div>
                    <select
                      className="form-select form-select-sm"
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      style={{ minWidth: 150 }}
                    >
                      {stocks.map((s) => (
                        <option key={s.sym} value={s.sym}>
                          {s.sym}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="d-flex justify-content-between">
                    <div className="fw-semibold">Demand (buyers)</div>
                    <div className="text-muted small">{demand}/100</div>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    value={demand}
                    onChange={(e) => setDemand(Number(e.target.value))}
                  />
                  <div className="text-muted small">
                    More demand → buyers compete → prices usually rise.
                  </div>
                </div>

                <div className="mt-4">
                  <div className="d-flex justify-content-between">
                    <div className="fw-semibold">Supply (sellers)</div>
                    <div className="text-muted small">{supply}/100</div>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    value={supply}
                    onChange={(e) => setSupply(Number(e.target.value))}
                  />
                  <div className="text-muted small">
                    More supply → more selling pressure → prices usually fall.
                  </div>
                </div>

                <div className="mt-4">
                  <div className="fw-semibold mb-2">News sentiment</div>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn btn-outline-success ${news === "good" ? "active" : ""}`}
                      onClick={() => setNews("good")}
                    >
                      Good
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-secondary ${news === "neutral" ? "active" : ""}`}
                      onClick={() => setNews("neutral")}
                    >
                      Neutral
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-danger ${news === "bad" ? "active" : ""}`}
                      onClick={() => setNews("bad")}
                    >
                      Bad
                    </button>
                  </div>
                  <div className="text-muted small mt-2">
                    News shifts emotion → emotion changes buy/sell behaviour.
                  </div>
                </div>

                <div className={`mt-4 rounded-4 p-3 riskImportBox ${fromRiskLab ? "fromLab" : ""}`}>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <div className="fw-bold">Risk setup {fromRiskLab ? "from Lesson 4" : ""}</div>
                      <div className="text-muted small">
                        {fromRiskLab
                          ? "Auto-filled from Risk Lab. You can tweak and continue in demo."
                          : "Set trade values and preview risk before practicing."}
                      </div>
                    </div>
                    <span className={`badge rounded-pill ${riskSim.pass ? "text-bg-success" : "text-bg-danger"}`}>
                      {riskSim.pass ? "Pass" : "Needs Fix"}
                    </span>
                  </div>

                  <div className="row g-2 mt-1">
                    <RiskField label="Account (£)" value={simAccount} setValue={setSimAccount} />
                    <RiskField label="Risk % " value={simRiskPct} setValue={setSimRiskPct} />
                    <RiskField label="Entry (£)" value={simEntry} setValue={setSimEntry} />
                    <RiskField label="Stop (£)" value={simStop} setValue={setSimStop} />
                    <RiskField label="Target (£)" value={simTarget} setValue={setSimTarget} />
                    <RiskField label="Leverage (x)" value={simLeverage} setValue={setSimLeverage} />
                    <RiskField label="Slippage % " value={simSlippage} setValue={setSimSlippage} />
                  </div>

                  {riskValidation.length > 0 && (
                    <div className="riskInlineWarnList mt-2">
                      {riskValidation.map((msg, i) => (
                        <div key={i} className="riskInlineWarn">
                          {msg}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="row g-2 mt-2">
                    <RiskMetric label="Risk Budget" value={`£${riskSim.riskBudget.toFixed(2)}`} />
                    <RiskMetric label="Shares" value={String(riskSim.shares)} />
                    <RiskMetric label="R:R" value={riskSim.rr > 0 ? `1 : ${riskSim.rr.toFixed(2)}` : "-"} />
                    <RiskMetric label="Required Capital" value={`£${riskSim.requiredCapital.toFixed(2)}`} />
                    <RiskMetric label="Stress Loss" value={`£${riskSim.stressedLoss.toFixed(2)}`} />
                    <RiskMetric label="Score" value={`${riskSim.score} / 5`} />
                  </div>
                </div>

                <div
                  className="mt-4 rounded-4 p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,0.03), rgba(47,111,237,0.06))",
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <div className="text-muted small">Status</div>
                      <div className={`fw-bold text-${marketStatus.tone}`} style={{ fontSize: "1.05rem" }}>
                        {marketStatus.title}
                      </div>
                      <div className="text-muted small">{marketStatus.statusLine}</div>
                    </div>

                    <div className="text-end">
                      <div className="text-muted small">Index (basket)</div>
                      <div className="fw-bold">
                        £{indexNow?.toFixed(2)}{" "}
                        <span className={indexPct >= 0 ? "text-success" : "text-danger"}>
                          ({indexPct >= 0 ? "+" : ""}{indexPct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-muted" style={{ lineHeight: 1.7 }}>
                    <b>What’s happening:</b> {marketStatus.msg}
                  </div>

                  <div className="mt-2 text-muted" style={{ lineHeight: 1.7 }}>
                    <b>Effect:</b> {marketStatus.effect}
                  </div>

                  <div className="mt-2 text-muted" style={{ lineHeight: 1.7 }}>
                    <b>What you should do:</b> {marketStatus.whatToDo}
                  </div>

                  <div className="mt-3">
                    <div className="text-muted small">Main drivers</div>
                    <div className="fw-semibold">{marketStatus.drivers}</div>
                  </div>

                  <div
                    className="mt-3 rounded-4 p-3"
                    style={{
                      background: "rgba(25,135,84,0.08)",
                      border: "1px solid rgba(25,135,84,0.14)",
                    }}
                  >
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <div className="text-muted small">
                        Focus: <b>{focusStock?.name}</b> ({focus})
                      </div>
                      <div className="fw-bold">
                        £{currentPrice(focus)?.toFixed(2)}{" "}
                        <span className={pct >= 0 ? "text-success" : "text-danger"}>
                          ({pctText})
                        </span>
                      </div>
                    </div>
                    <div className="text-muted small mt-2">
                      Hover chart to inspect each moment (like real trading apps).
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div
                className="rounded-4 shadow-sm p-4 p-md-5 h-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(247,252,255,0.96))",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div>
                    <h4 className="fw-bold mb-1">Market view</h4>
                    <div className="text-muted small">
                      4 stocks + basket index. Hover for values.
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-muted small">Time</div>
                    <div className="fw-semibold">
                      {hoverIndex === null ? "Now" : `Point ${hoverIndex + 1}`}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setFocus("AAPL")}
                    className={`btn btn-sm chipBtn ${focus === "AAPL" ? "chipActive" : ""}`}
                  >
                    AAPL
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocus("TSLA")}
                    className={`btn btn-sm chipBtn ${focus === "TSLA" ? "chipActive" : ""}`}
                  >
                    TSLA
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocus("SONY")}
                    className={`btn btn-sm chipBtn ${focus === "SONY" ? "chipActive" : ""}`}
                  >
                    SONY
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocus("SSNLF")}
                    className={`btn btn-sm chipBtn ${focus === "SSNLF" ? "chipActive" : ""}`}
                  >
                    SSNLF
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocus("AAPL")}
                    className="btn btn-sm chipBtn"
                    style={{ marginLeft: 6, opacity: 0.8 }}
                    title="Index follows all lines together"
                  >
                    INDEX
                  </button>
                </div>

                <div className="mt-4">
                  <Chart
                    stocks={stocks}
                    series={series}
                    focus={focus}
                    chartMeta={chartMeta}
                    onHover={setHover}
                  />

                  <div className="d-flex justify-content-between text-muted small mt-2">
                    <span>Earlier</span>
                    <span>Now</span>
                  </div>
                </div>

                <hr className="my-4" />

                <h5 className="fw-bold mb-2">How to read this like a real trader</h5>
                <div className="text-muted" style={{ lineHeight: 1.9 }}>
                  <b>Step 1:</b> Check the <b>Index</b> first → is the overall market rising or falling?<br />
                  <b>Step 2:</b> Compare each stock line → which one reacts more strongly (volatility)?<br />
                  <b>Step 3:</b> Ask “what changed?” → demand, supply, or news sentiment.<br />
                  <b>Step 4:</b> Your broker sends your orders to the market — orders create pressure → pressure moves price.
                </div>

                <div className="mt-4 p-3 rounded-4 tipBox">
                  <div className="fw-semibold mb-1">Pro learning tip</div>
                  <div className="text-muted">
                    Don’t only watch the direction — hover and compare values.
                    Learning becomes faster when you can <b>see</b> cause → effect.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            .form-range::-webkit-slider-thumb { cursor: pointer; }
            .form-range::-moz-range-thumb { cursor: pointer; }

            .chipBtn{
              border-radius: 999px;
              border: 1px solid rgba(15,23,42,0.12);
              background: rgba(15,23,42,0.02);
              transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
            }
            .chipBtn:hover{
              transform: translateY(-1px);
              box-shadow: 0 10px 20px rgba(15,23,42,0.08);
              background: rgba(47,111,237,0.06);
            }
            .chipActive{
              border: 1px solid rgba(47,111,237,0.35);
              background: rgba(47,111,237,0.08);
            }

            .tipBox{
              background: linear-gradient(135deg, rgba(25,135,84,0.08), rgba(47,111,237,0.06));
              border: 1px solid rgba(15,23,42,0.08);
            }

            .riskImportBox{
              border: 1px solid rgba(15,23,42,0.08);
              background: linear-gradient(135deg, rgba(15,23,42,0.03), rgba(255,255,255,0.92));
            }
            .riskImportBox.fromLab{
              border-color: rgba(37,99,235,0.28);
              background: linear-gradient(135deg, rgba(37,99,235,0.10), rgba(255,255,255,0.95));
            }
            .riskTinyField{
              border: 1px solid rgba(15,23,42,0.10);
              border-radius: 10px;
              padding: 6px 8px;
              width: 100%;
            }
            .riskTinyMetric{
              border: 1px solid rgba(15,23,42,0.08);
              border-radius: 10px;
              background: rgba(255,255,255,0.72);
              padding: 8px;
            }
            .riskInlineWarnList{
              display: grid;
              gap: 6px;
            }
            .riskInlineWarn{
              border-radius: 10px;
              border: 1px solid rgba(220,53,69,0.24);
              background: rgba(220,53,69,0.08);
              color: #7f1d1d;
              font-size: 12px;
              font-weight: 700;
              padding: 7px 9px;
            }
          `}</style>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Chart({ stocks, series, focus, chartMeta, onHover }) {
  const W = 720;
  const H = 250;
  const padX = 20;
  const padY = 18;

  const gridY = 5;
  const gridX = 7;

  const yLabels = useMemo(() => {
    const { min, max } = chartMeta;
    const out = [];
    for (let i = 0; i <= gridY; i++) {
      const v = max - (i * (max - min)) / gridY;
      out.push(v);
    }
    return out;
  }, [chartMeta]);

  const buildPath = (arr) => {
    const { min, max } = chartMeta;

    const scaleX = (i) => padX + (i * (W - padX * 2)) / (arr.length - 1);
    const scaleY = (v) => {
      if (max === min) return H / 2;
      return padY + ((max - v) * (H - padY * 2)) / (max - min);
    };

    let d = "";
    arr.forEach((v, i) => {
      const x = scaleX(i);
      const y = scaleY(v);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  };

  const idxArr = series.INDEX || [];

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;

    const any = idxArr.length ? idxArr : series[stocks[0].sym];
    if (!any || any.length < 2) return;

    const i = Math.round(((mx - padX) / (rect.width - padX * 2)) * (any.length - 1));
    const index = Math.max(0, Math.min(any.length - 1, i));

    const payload = {
      index,
      values: {
        INDEX: idxArr[index],
        AAPL: series.AAPL?.[index],
        TSLA: series.TSLA?.[index],
        SONY: series.SONY?.[index],
        SSNLF: series.SSNLF?.[index],
      },
    };

    onHover?.(payload);
  };

  const handleLeave = () => onHover?.(null);

  const scaleX = (i, len) => padX + (i * (W - padX * 2)) / (len - 1);

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="250"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          background: "linear-gradient(180deg, rgba(47,111,237,0.06), rgba(255,255,255,0.0))",
          borderRadius: 18,
          border: "1px solid rgba(47,111,237,0.10)",
        }}
      >
        {Array.from({ length: gridY + 1 }).map((_, i) => {
          const y = padY + (i * (H - padY * 2)) / gridY;
          return (
            <g key={`gy${i}`}>
              <line
                x1={padX}
                y1={y}
                x2={W - padX}
                y2={y}
                stroke="rgba(15,23,42,0.08)"
                strokeWidth="1"
              />
              <text x={padX} y={y - 6} fontSize="10" fill="rgba(15,23,42,0.55)">
                £{yLabels[i].toFixed(0)}
              </text>
            </g>
          );
        })}

        {Array.from({ length: gridX + 1 }).map((_, i) => {
          const x = padX + (i * (W - padX * 2)) / gridX;
          return (
            <line
              key={`gx${i}`}
              x1={x}
              y1={padY}
              x2={x}
              y2={H - padY}
              stroke="rgba(15,23,42,0.06)"
              strokeWidth="1"
            />
          );
        })}

        <path
          d={idxArr.length ? buildPath(idxArr) : ""}
          fill="none"
          stroke="rgba(15,23,42,0.70)"
          strokeWidth={2.6}
          opacity={0.95}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {stocks.map((s) => {
          const arr = series[s.sym];
          if (!arr) return null;
          const isFocus = focus === s.sym;

          return (
            <path
              key={s.sym}
              d={buildPath(arr)}
              fill="none"
              stroke={s.color}
              strokeWidth={isFocus ? 3.6 : 2.2}
              opacity={isFocus ? 1 : 0.52}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {typeof onHover === "function" && idxArr.length > 0 ? (
          <HoverLine idxArr={idxArr} scaleX={(i) => scaleX(i, idxArr.length)} />
        ) : null}

        <rect x="0" y="0" width={W} height={H} fill="none" stroke="rgba(15,23,42,0.06)" rx="18" />
      </svg>
    </div>
  );
}

function HoverLine({ idxArr, scaleX }) {
  return (
    <g opacity="0.0">
      <line x1={0} y1={0} x2={0} y2={0} />
    </g>
  );
}

function RiskField({ label, value, setValue }) {
  return (
    <div className="col-6 col-md-4">
      <label className="small text-muted d-block mb-1">{label}</label>
      <input
        type="number"
        className="riskTinyField"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

function RiskMetric({ label, value }) {
  return (
    <div className="col-6 col-md-4">
      <div className="riskTinyMetric h-100">
        <div className="small text-muted">{label}</div>
        <div className="fw-semibold">{value}</div>
      </div>
    </div>
  );
}
