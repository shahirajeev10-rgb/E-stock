import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbaar from "../Navbar";
import useLessonProgress from "./useLessonProgress";
import Footer from "../Footer";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

function fmt(value) {
  return gbp.format(Number(value || 0));
}

function pct(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

export default function RiskManagementLesson() {
  const chapters = useMemo(
    () => [
      { id: "why", title: "Why Risk Matters", sub: "Past market lessons" },
      { id: "size", title: "Position Sizing", sub: "Risk-per-trade model" },
      { id: "stops", title: "Stops & Execution", sub: "Stop vs stop-limit" },
      { id: "diversify", title: "Diversification", sub: "Exposure control" },
      { id: "leverage", title: "Leverage Risk", sub: "Margin pressure" },
      { id: "expectancy", title: "Expectancy", sub: "Win-rate math" },
      { id: "playbook", title: "Your Playbook", sub: "Rules + sources" },
      { id: "lab", title: "Risk Lab", sub: "Hands-on challenge" },
    ],
    []
  );

  const [chapter, setChapter] = useState(0);
  const isLast = chapter === chapters.length - 1;

  const [account, setAccount] = useState("5000");
  const [riskPerTrade, setRiskPerTrade] = useState("1");
  const [entry, setEntry] = useState("182.4");
  const [stop, setStop] = useState("178.8");
  const [target, setTarget] = useState("190");

  const sizing = useMemo(() => {
    const acc = Number(account);
    const riskPct = Number(riskPerTrade);
    const e = Number(entry);
    const s = Number(stop);
    const t = Number(target);

    const riskBudget = Number.isFinite(acc) && Number.isFinite(riskPct) ? (acc * riskPct) / 100 : 0;
    const riskPerShare = Number.isFinite(e) && Number.isFinite(s) ? Math.max(0, e - s) : 0;
    const shares = riskPerShare > 0 ? Math.floor(riskBudget / riskPerShare) : 0;
    const positionValue = Number.isFinite(e) ? shares * e : 0;
    const rewardPerShare = Number.isFinite(e) && Number.isFinite(t) ? Math.max(0, t - e) : 0;
    const rr = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;

    return {
      riskBudget,
      riskPerShare,
      shares,
      positionValue,
      rewardPerShare,
      rr,
      plannedLoss: shares * riskPerShare,
      plannedProfit: shares * rewardPerShare,
    };
  }, [account, riskPerTrade, entry, stop, target]);

  const [goal, setGoal] = useState("exit_fast");

  const [tech, setTech] = useState("40");
  const [finance, setFinance] = useState("25");
  const [health, setHealth] = useState("20");
  const [energy, setEnergy] = useState("15");

  const diversification = useMemo(() => {
    const arr = [
      { name: "Technology", value: Number(tech) || 0 },
      { name: "Financials", value: Number(finance) || 0 },
      { name: "Healthcare", value: Number(health) || 0 },
      { name: "Energy", value: Number(energy) || 0 },
    ];
    const total = arr.reduce((a, b) => a + b.value, 0);
    const normalized = arr.map((x) => ({
      ...x,
      pct: total > 0 ? (x.value / total) * 100 : 0,
    }));
    const maxWeight = normalized.reduce((m, x) => Math.max(m, x.pct), 0);
    const tone = maxWeight >= 55 ? "danger" : maxWeight >= 40 ? "warning" : "success";
    return { normalized, total, maxWeight, tone };
  }, [tech, finance, health, energy]);

  const [capital, setCapital] = useState("5000");
  const [leverage, setLeverage] = useState("2");
  const [drop, setDrop] = useState("12");

  const leverageView = useMemo(() => {
    const c = Number(capital);
    const lev = Number(leverage);
    const d = Number(drop) / 100;
    const position = c * lev;
    const loan = Math.max(0, position - c);
    const afterDrop = position * (1 - d);
    const equityAfter = afterDrop - loan;
    const pnl = equityAfter - c;
    const pnlPct = c > 0 ? (pnl / c) * 100 : 0;
    return { position, loan, equityAfter, pnl, pnlPct };
  }, [capital, leverage, drop]);

  const [winRate, setWinRate] = useState("45");
  const [avgWin, setAvgWin] = useState("120");
  const [avgLoss, setAvgLoss] = useState("70");

  const expectancy = useMemo(() => {
    const w = (Number(winRate) || 0) / 100;
    const win = Number(avgWin) || 0;
    const loss = Number(avgLoss) || 0;
    const exp = w * win - (1 - w) * loss;
    return { exp };
  }, [winRate, avgWin, avgLoss]);

  const [rules, setRules] = useState({
    r1: false,
    r2: false,
    r3: false,
    r4: false,
    r5: false,
    r6: false,
  });
  const ruleCount = Object.values(rules).filter(Boolean).length;

  const [labAccount, setLabAccount] = useState("10000");
  const [labRiskPct, setLabRiskPct] = useState("1.5");
  const [labEntry, setLabEntry] = useState("150");
  const [labStop, setLabStop] = useState("145");
  const [labTarget, setLabTarget] = useState("162");
  const [labLeverage, setLabLeverage] = useState("1.5");
  const [labGapPct, setLabGapPct] = useState("0.8");

  const lab = useMemo(() => {
    const accountValue = Number(labAccount);
    const riskPctValue = Number(labRiskPct);
    const entryValue = Number(labEntry);
    const stopValue = Number(labStop);
    const targetValue = Number(labTarget);
    const leverageValue = Math.max(1, Number(labLeverage) || 1);
    const gapPctValue = Math.max(0, Number(labGapPct) || 0);

    const budget =
      Number.isFinite(accountValue) && Number.isFinite(riskPctValue)
        ? (accountValue * riskPctValue) / 100
        : 0;
    const riskPerShare = Number.isFinite(entryValue) && Number.isFinite(stopValue) ? entryValue - stopValue : 0;
    const rewardPerShare = Number.isFinite(entryValue) && Number.isFinite(targetValue) ? targetValue - entryValue : 0;
    const shares = riskPerShare > 0 ? Math.floor(budget / riskPerShare) : 0;
    const rr = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
    const positionValue = shares > 0 ? shares * entryValue : 0;
    const requiredCapital = leverageValue > 0 ? positionValue / leverageValue : positionValue;
    const capitalUsagePct = accountValue > 0 ? (requiredCapital / accountValue) * 100 : 0;

    const gapPerShare = entryValue > 0 ? (entryValue * gapPctValue) / 100 : 0;
    const stressedRiskPerShare = Math.max(0, riskPerShare + gapPerShare);
    const maxLoss = shares * riskPerShare;
    const stressedLoss = shares * stressedRiskPerShare;
    const budgetOverrunPct = budget > 0 ? (stressedLoss / budget) * 100 : 0;
    const stressedExit = stopValue - gapPerShare;

    const checks = {
      riskCap: riskPctValue > 0 && riskPctValue <= 2,
      stopValid: riskPerShare > 0,
      rrGood: rr >= 2,
      sharesValid: shares > 0,
      stressContained: stressedLoss <= budget * 1.25,
      capitalFit: requiredCapital <= accountValue,
    };

    const score = Object.values(checks).filter(Boolean).length;
    const pass = score >= 5;

    return {
      budget,
      riskPerShare,
      rewardPerShare,
      shares,
      rr,
      positionValue,
      requiredCapital,
      capitalUsagePct,
      maxLoss,
      stressedLoss,
      stressedRiskPerShare,
      budgetOverrunPct,
      stressedExit,
      gapPctValue,
      checks,
      score,
      pass,
    };
  }, [labAccount, labRiskPct, labEntry, labStop, labTarget, labLeverage, labGapPct]);

  const demoApplyLink = useMemo(() => {
    const params = new URLSearchParams({
      from: "risk-lab",
      account: String(labAccount),
      riskPct: String(labRiskPct),
      entry: String(labEntry),
      stop: String(labStop),
      target: String(labTarget),
      leverage: String(labLeverage),
      slippage: String(labGapPct),
    });
    return `/demo/price-movement?${params.toString()}`;
  }, [labAccount, labRiskPct, labEntry, labStop, labTarget, labLeverage, labGapPct]);

  const labWarnings = useMemo(() => {
    const accountValue = Number(labAccount);
    const riskPctValue = Number(labRiskPct);
    const entryValue = Number(labEntry);
    const stopValue = Number(labStop);
    const targetValue = Number(labTarget);
    const leverageValue = Number(labLeverage);
    const warnings = [];

    if (!(accountValue > 0)) warnings.push("Account size must be greater than GBP 0.");
    if (!(riskPctValue > 0)) warnings.push("Risk per trade must be above 0%.");
    else if (riskPctValue > 2) warnings.push("Risk per trade should be 2% or less for this lesson.");
    if (!(entryValue > 0)) warnings.push("Entry price must be greater than GBP 0.");
    if (!(stopValue > 0)) warnings.push("Stop price must be greater than GBP 0.");
    if (!(targetValue > 0)) warnings.push("Target price must be greater than GBP 0.");
    if (entryValue > 0 && stopValue >= entryValue) warnings.push("For a long setup, stop must stay below entry.");
    if (entryValue > 0 && targetValue <= entryValue) warnings.push("Target should be above entry for positive reward.");
    if (Number.isFinite(leverageValue) && leverageValue < 1) warnings.push("Leverage should be at least 1x.");
    if (
      lab.shares === 0 &&
      accountValue > 0 &&
      riskPctValue > 0 &&
      entryValue > 0 &&
      stopValue > 0 &&
      stopValue < entryValue
    ) {
      warnings.push("Risk budget is too small for 1 share. Increase account/risk or tighten stop.");
    }

    return warnings;
  }, [labAccount, labRiskPct, labEntry, labStop, labTarget, labLeverage, lab.shares]);

  const lessonProgressPct = useMemo(() => {
    let pct = ((chapter + 1) / chapters.length) * 80;
    if (chapter >= 6) {
      pct += (ruleCount / 6) * 10;
    }
    if (chapter === chapters.length - 1) {
      pct += lab.pass ? 10 : 5;
    }
    return Math.min(100, Number(pct.toFixed(1)));
  }, [chapter, chapters.length, lab.pass, ruleCount]);

  const lessonProgress = useLessonProgress({
    lessonKey: "risk-management",
    title: "Lesson 4: Risk Management",
    path: "/lessons/risk-management",
    progressPct: lessonProgressPct,
    lastStep: chapter + 1,
    totalSteps: chapters.length,
  });

  return (
    <>
      <Navbaar />

      <section className="riskBookPage py-5">
        <div className="container">
          <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-end gap-3 mb-4">
            <div>
              <span className="riskBadge">LESSON 4 • RISK MANAGEMENT PLAYBOOK</span>
              <h2 className="fw-bold mt-3 mb-2">Risk Management, Built as a Multi-Page Guide</h2>
              <p className="text-muted mb-0" style={{ maxWidth: 820 }}>
                Different format from earlier lessons: chapter-by-chapter pages like a study workbook,
                with practical calculators and decision frameworks.
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge rounded-pill text-bg-light border align-self-center">
                Progress {Math.round(lessonProgress.progressPct)}%
              </span>
              <Link to="/dashboard" className="btn btn-outline-secondary px-4">Back to Dashboard</Link>
              <Link to="/demo/price-movement" className="btn btn-dark px-4">Open Demo</Link>
            </div>
          </div>

          <div className="riskShell">
            <aside className="riskNav">
              <div className="riskNavHead">
                <div className="fw-bold">Lesson roadmap</div>
                <div className="small text-muted">Page {chapter + 1} of {chapters.length}</div>
              </div>
              <div className="riskNavList">
                {chapters.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChapter(i)}
                    className={`riskNavBtn ${chapter === i ? "isActive" : ""}`}
                  >
                    <span className="riskNavNum">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="riskNavTitle">{c.title}</span>
                      <span className="riskNavSub">{c.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <main className="riskMain">
              <div className="riskChapterHead">
                <div className="riskChapterKicker">Chapter {chapter + 1}</div>
                <h4 className="fw-bold m-0">{chapters[chapter].title}</h4>
              </div>

              {chapter === 0 && (
                <div className="riskContent">
                  <p className="text-muted" style={{ lineHeight: 1.75 }}>
                    Risk management is the first skill professionals build. Historical drawdowns show
                    why protecting capital is essential before chasing return.
                  </p>

                  <div className="row g-3">
                    <Info title="Dot-com crash (2000-2002)" body="Many high-growth stocks fell sharply; concentration risk hit undiversified portfolios." />
                    <Info title="Global Financial Crisis (2008)" body="Leverage and weak risk controls amplified losses across markets." />
                    <Info title="COVID shock (2020)" body="Volatility spiked rapidly; traders with predefined risk limits adapted faster." />
                  </div>

                  <div className="riskTableWrap mt-3">
                    <div className="fw-semibold mb-2">Drawdown recovery reality</div>
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>Loss</th>
                          <th>Gain needed to recover</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>-10%</td><td>+11.1%</td></tr>
                        <tr><td>-20%</td><td>+25.0%</td></tr>
                        <tr><td>-30%</td><td>+42.9%</td></tr>
                        <tr><td>-50%</td><td>+100.0%</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {chapter === 1 && (
                <div className="riskContent">
                  <p className="text-muted mb-3">
                    Fixed-fractional sizing: define risk per trade first, then calculate shares.
                  </p>
                  <div className="row g-3">
                    <Field label="Account Size (£)" value={account} setValue={setAccount} />
                    <Field label="Risk Per Trade (%)" value={riskPerTrade} setValue={setRiskPerTrade} />
                    <Field label="Entry (£)" value={entry} setValue={setEntry} />
                    <Field label="Stop (£)" value={stop} setValue={setStop} />
                    <Field label="Target (£)" value={target} setValue={setTarget} />
                  </div>

                  <div className="row g-3 mt-1">
                    <Metric label="Risk Budget" value={fmt(sizing.riskBudget)} />
                    <Metric label="Risk / Share" value={fmt(sizing.riskPerShare)} />
                    <Metric label="Suggested Shares" value={String(sizing.shares)} />
                    <Metric label="Position Value" value={fmt(sizing.positionValue)} />
                    <Metric label="Planned Loss" value={fmt(sizing.plannedLoss)} />
                    <Metric label="Planned Profit" value={fmt(sizing.plannedProfit)} />
                  </div>

                  <div className="riskHint mt-3">
                    Formula: shares = risk budget / risk per share. This keeps risk stable across trades.
                  </div>
                </div>
              )}

              {chapter === 2 && (
                <div className="riskContent">
                  <p className="text-muted mb-2">
                    Based on FINRA guidance, order type changes execution behavior and slippage risk.
                  </p>
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    <button
                      type="button"
                      className={`btn ${goal === "exit_fast" ? "btn-danger" : "btn-outline-danger"}`}
                      onClick={() => setGoal("exit_fast")}
                    >
                      Goal: Exit Fast
                    </button>
                    <button
                      type="button"
                      className={`btn ${goal === "price_control" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setGoal("price_control")}
                    >
                      Goal: Control Fill Price
                    </button>
                  </div>

                  {goal === "exit_fast" ? (
                    <div className="riskCard">
                      <div className="fw-semibold mb-1">Use: Stop Order</div>
                      <div className="text-muted">
                        A stop order triggers into a market order once stop price is reached.
                        Priority is execution, but final fill can differ in fast markets.
                      </div>
                    </div>
                  ) : (
                    <div className="riskCard">
                      <div className="fw-semibold mb-1">Use: Stop-Limit Order</div>
                      <div className="text-muted">
                        A stop-limit adds price control, but execution is not guaranteed if market moves past limit quickly.
                      </div>
                    </div>
                  )}

                  <div className="riskHint mt-3">
                    Decision rule: choose between execution certainty and price certainty based on market volatility.
                  </div>
                </div>
              )}

              {chapter === 3 && (
                <div className="riskContent">
                  <p className="text-muted mb-3">
                    SEC Investor resources emphasize diversification and asset allocation as core risk controls.
                  </p>
                  <div className="row g-3">
                    <Field label="Technology Weight" value={tech} setValue={setTech} suffix="%" />
                    <Field label="Financials Weight" value={finance} setValue={setFinance} suffix="%" />
                    <Field label="Healthcare Weight" value={health} setValue={setHealth} suffix="%" />
                    <Field label="Energy Weight" value={energy} setValue={setEnergy} suffix="%" />
                  </div>

                  <div className="riskTableWrap mt-3">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>Sector</th>
                          <th className="text-end">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diversification.normalized.map((x) => (
                          <tr key={x.name}>
                            <td>{x.name}</td>
                            <td className="text-end">{pct(x.pct)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={`riskHint mt-3 text-${diversification.tone}`}>
                    Largest sector weight: <b>{pct(diversification.maxWeight)}</b>. Higher concentration means higher single-theme risk.
                  </div>
                </div>
              )}

              {chapter === 4 && (
                <div className="riskContent">
                  <p className="text-muted mb-3">
                    Leverage increases exposure and can magnify losses. This simulation shows equity impact during a decline.
                  </p>
                  <div className="row g-3">
                    <Field label="Starting Capital (£)" value={capital} setValue={setCapital} />
                    <Field label="Leverage (x)" value={leverage} setValue={setLeverage} />
                    <Field label="Market Drop (%)" value={drop} setValue={setDrop} />
                  </div>
                  <div className="row g-3 mt-1">
                    <Metric label="Position Size" value={fmt(leverageView.position)} />
                    <Metric label="Borrowed (Loan)" value={fmt(leverageView.loan)} />
                    <Metric label="Equity After Drop" value={fmt(leverageView.equityAfter)} />
                  </div>
                  <div className={`riskHint mt-3 ${leverageView.pnl < 0 ? "text-danger" : "text-success"}`}>
                    Equity P/L: <b>{fmt(leverageView.pnl)}</b> ({pct(leverageView.pnlPct)})
                  </div>
                </div>
              )}

              {chapter === 5 && (
                <div className="riskContent">
                  <p className="text-muted mb-3">
                    Expectancy links win rate and payoff ratio. A system can survive with moderate wins if average win is larger than average loss.
                  </p>
                  <div className="row g-3">
                    <Field label="Win Rate (%)" value={winRate} setValue={setWinRate} />
                    <Field label="Average Win (£)" value={avgWin} setValue={setAvgWin} />
                    <Field label="Average Loss (£)" value={avgLoss} setValue={setAvgLoss} />
                  </div>
                  <div className="riskCard mt-3">
                    <div className="fw-semibold mb-1">Expectancy per trade</div>
                    <div className={`fs-4 fw-bold ${expectancy.exp >= 0 ? "text-success" : "text-danger"}`}>
                      {fmt(expectancy.exp)}
                    </div>
                    <div className="small text-muted mt-1">
                      Formula: (win rate × average win) - ((1 - win rate) × average loss)
                    </div>
                  </div>
                </div>
              )}

              {chapter === 6 && (
                <div className="riskContent">
                  <p className="text-muted mb-3">
                    Build your personal risk rulebook. Tick each rule you will follow for every trade.
                  </p>
                  <div className="riskChecklist">
                    <Check label="Risk per trade is capped (e.g., 1%)." checked={rules.r1} onChange={() => setRules((r) => ({ ...r, r1: !r.r1 }))} />
                    <Check label="Stop-loss is defined before entry." checked={rules.r2} onChange={() => setRules((r) => ({ ...r, r2: !r.r2 }))} />
                    <Check label="Position size is calculated from risk, not feelings." checked={rules.r3} onChange={() => setRules((r) => ({ ...r, r3: !r.r3 }))} />
                    <Check label="Trade has acceptable reward-to-risk ratio." checked={rules.r4} onChange={() => setRules((r) => ({ ...r, r4: !r.r4 }))} />
                    <Check label="Portfolio concentration is reviewed." checked={rules.r5} onChange={() => setRules((r) => ({ ...r, r5: !r.r5 }))} />
                    <Check label="No revenge trades after losses." checked={rules.r6} onChange={() => setRules((r) => ({ ...r, r6: !r.r6 }))} />
                  </div>

                  <div className="riskHint mt-3">
                    Playbook completion: <b>{ruleCount} / 6</b>
                  </div>

                  <div className="riskTableWrap mt-3">
                    <div className="fw-semibold mb-2">Research references used</div>
                    <ul className="mb-0">
                      <li><a href="https://www.finra.org/investors/insights/stop-orders-factors-keep-mind" target="_blank" rel="noreferrer">FINRA - Stop Orders: Factors to Keep in Mind</a></li>
                      <li><a href="https://www.finra.org/investors/investing/investment-products/stocks/order-types" target="_blank" rel="noreferrer">FINRA - Order Types</a></li>
                      <li><a href="https://www.investor.gov/introduction-investing/investing-basics/glossary/diversification" target="_blank" rel="noreferrer">Investor.gov - Diversification</a></li>
                      <li><a href="https://www.investor.gov/introduction-investing/investing-basics/glossary/asset-allocation" target="_blank" rel="noreferrer">Investor.gov - Asset Allocation</a></li>
                    </ul>
                  </div>
                </div>
              )}

              {chapter === 7 && (
                <div className="riskContent">
                  <p className="text-muted mb-3">
                    Run a full pre-trade simulation: size the position, stress-test stop slippage,
                    and decide if setup quality is acceptable before taking demo trades.
                  </p>

                  <div className="row g-3">
                    <Field label="Account Size (£)" value={labAccount} setValue={setLabAccount} />
                    <Field label="Risk Per Trade (%)" value={labRiskPct} setValue={setLabRiskPct} />
                    <Field label="Entry (£)" value={labEntry} setValue={setLabEntry} />
                    <Field label="Stop (£)" value={labStop} setValue={setLabStop} />
                    <Field label="Target (£)" value={labTarget} setValue={setLabTarget} />
                    <Field label="Leverage (x)" value={labLeverage} setValue={setLabLeverage} />
                  </div>

                  {labWarnings.length > 0 && (
                    <div className="riskWarnList mt-3">
                      {labWarnings.map((msg, i) => (
                        <div key={i} className="riskWarnItem">
                          {msg}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="riskStressCard mt-3">
                    <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                      <div>
                        <div className="fw-semibold">Gap / Slippage Stress Test</div>
                        <div className="small text-muted">Assume stop executes worse in fast market conditions.</div>
                      </div>
                      <span className="badge rounded-pill text-bg-dark">{lab.gapPctValue.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      className="riskRange mt-2"
                      value={labGapPct}
                      onChange={(e) => setLabGapPct(e.target.value)}
                    />
                    <div className="small text-muted mt-1">
                      Stressed exit estimate: <b>{fmt(lab.stressedExit)}</b>
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <Metric label="Risk Budget" value={fmt(lab.budget)} />
                    <Metric label="Suggested Shares" value={String(lab.shares)} />
                    <Metric label="Position Value" value={fmt(lab.positionValue)} />
                    <Metric label="Required Capital" value={fmt(lab.requiredCapital)} />
                    <Metric label="Max Loss (Planned)" value={fmt(lab.maxLoss)} />
                    <Metric label="Max Loss (Stressed)" value={fmt(lab.stressedLoss)} />
                    <Metric label="Risk/Reward" value={lab.rr > 0 ? `1 : ${lab.rr.toFixed(2)}` : "-"} />
                  </div>

                  <div className="riskChecklist mt-3">
                    <ResultRow label="Risk cap <= 2%" ok={lab.checks.riskCap} />
                    <ResultRow label="Stop is below entry (for long setup)" ok={lab.checks.stopValid} />
                    <ResultRow label="Reward-to-risk >= 2.0" ok={lab.checks.rrGood} />
                    <ResultRow label="Position size is valid (>0 shares)" ok={lab.checks.sharesValid} />
                    <ResultRow label="Stress loss remains within +25% of risk budget" ok={lab.checks.stressContained} />
                    <ResultRow label="Required capital fits account with selected leverage" ok={lab.checks.capitalFit} />
                  </div>

                  <div className={`riskHint mt-3 ${lab.pass ? "text-success" : "text-danger"}`}>
                    Trade quality score: <b>{lab.score} / 6</b>
                    {" - "}
                    {lab.pass ? "Acceptable setup for demo practice." : "Needs adjustment before taking trade."}
                    <span className="d-block small mt-1">
                      Capital used: <b>{pct(lab.capitalUsagePct)}</b> | Stress vs budget: <b>{pct(lab.budgetOverrunPct)}</b>
                    </span>
                  </div>
                </div>
              )}

              <div className="riskFooterNav">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  disabled={chapter === 0}
                  onClick={() => setChapter((p) => Math.max(0, p - 1))}
                >
                  Previous Page
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  disabled={isLast}
                  onClick={() => setChapter((p) => Math.min(chapters.length - 1, p + 1))}
                >
                  Next Page
                </button>
              </div>

              {isLast && (
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  <Link to={demoApplyLink} className={`btn px-4 ${lab.pass ? "btn-dark" : "btn-outline-dark"}`}>
                    Apply This Setup in Demo
                  </Link>
                  <Link to="/dashboard" className="btn btn-outline-secondary px-4">
                    Return to Dashboard
                  </Link>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <style>{`
        .riskBookPage{
          background:
            radial-gradient(circle at 12% 8%, rgba(220,53,69,0.10), transparent 42%),
            radial-gradient(circle at 88% 92%, rgba(37,99,235,0.08), transparent 42%),
            linear-gradient(180deg, #f8fafc 0%, #eef3fb 52%, #ffffff 100%);
          min-height: 78vh;
        }

        .riskBadge{
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .45px;
          color: #b42318;
          border: 1px solid rgba(220,53,69,0.22);
          background: rgba(220,53,69,0.10);
        }

        .riskShell{
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 14px;
        }

        .riskNav{
          background:
            linear-gradient(180deg, rgba(239,246,255,0.80), rgba(255,255,255,0.95));
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0 16px 36px rgba(15,23,42,0.08);
          height: fit-content;
          position: sticky;
          top: 92px;
        }

        .riskNavHead{
          padding: 8px 8px 10px;
          border-bottom: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(37,99,235,0.10), rgba(255,255,255,0.80));
        }
        .riskNavList{ margin-top: 10px; display: grid; gap: 8px; }

        .riskNavBtn{
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.88);
          border-radius: 14px;
          padding: 10px;
          text-align: left;
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 8px;
          transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
        }
        .riskNavBtn:hover{
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(15,23,42,0.08);
          border-color: rgba(37,99,235,0.24);
        }
        .riskNavBtn:nth-child(4n + 1){
          background: linear-gradient(135deg, rgba(37,99,235,0.10), rgba(255,255,255,0.95));
        }
        .riskNavBtn:nth-child(4n + 2){
          background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,0.95));
        }
        .riskNavBtn:nth-child(4n + 3){
          background: linear-gradient(135deg, rgba(14,165,233,0.10), rgba(255,255,255,0.95));
        }
        .riskNavBtn:nth-child(4n){
          background: linear-gradient(135deg, rgba(244,114,182,0.10), rgba(255,255,255,0.95));
        }
        .riskNavBtn.isActive{
          border-color: rgba(37,99,235,0.35);
          background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(255,255,255,0.94));
          box-shadow: 0 16px 34px rgba(37,99,235,0.12);
        }

        .riskNavNum{
          width: 30px;
          height: 30px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 900;
          color: #1d4ed8;
          background: rgba(37,99,235,0.10);
          border: 1px solid rgba(37,99,235,0.16);
        }
        .riskNavTitle{ display: block; font-weight: 900; color: #0f172a; }
        .riskNavSub{ display: block; font-size: 12px; color: rgba(15,23,42,0.56); margin-top: 1px; }

        .riskMain{
          background: rgba(255,255,255,0.90);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 16px 40px rgba(15,23,42,0.08);
        }
        .riskChapterHead{
          margin-bottom: 12px;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(15,23,42,0.08);
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(15,23,42,0.04), rgba(255,255,255,0.95));
        }
        .riskChapterKicker{
          font-size: 12px;
          font-weight: 900;
          color: rgba(15,23,42,0.55);
          letter-spacing: .4px;
          text-transform: uppercase;
        }

        .riskContent{
          animation: chapterIn .24s ease both;
        }
        @keyframes chapterIn{
          from{ opacity: 0; transform: translateY(8px); }
          to{ opacity: 1; transform: translateY(0); }
        }

        .riskCard{
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(15,23,42,0.02);
          padding: 12px;
        }

        .riskTableWrap{
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.88);
          padding: 12px;
        }

        .riskHint{
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(15,23,42,0.03);
          padding: 10px 12px;
          font-size: 13px;
          color: rgba(15,23,42,0.72);
        }

        .riskFooterNav{
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }

        .riskStressCard{
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,0.08);
          background: linear-gradient(135deg, rgba(15,23,42,0.03), rgba(255,255,255,0.92));
          padding: 12px;
        }

        .riskRange{
          width: 100%;
          accent-color: #0f172a;
        }

        .riskWarnList{
          display: grid;
          gap: 8px;
        }

        .riskWarnItem{
          border-radius: 12px;
          border: 1px solid rgba(220,53,69,0.26);
          background: rgba(220,53,69,0.08);
          color: #7f1d1d;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 10px;
        }

        .riskChecklist{
          display: grid;
          gap: 8px;
        }

        .riskCheck{
          border-radius: 12px;
          border: 1px solid rgba(15,23,42,0.08);
          background: linear-gradient(135deg, rgba(248,250,252,0.95), rgba(255,255,255,0.90));
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 4px solid rgba(37,99,235,0.35);
        }

        .riskCheck.isChecked{
          border-color: rgba(25,135,84,0.22);
          border-left-color: rgba(25,135,84,0.75);
          background: linear-gradient(135deg, rgba(25,135,84,0.10), rgba(255,255,255,0.95));
        }

        .introRiskCard{
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.86);
          transition: transform .16s ease, box-shadow .16s ease;
        }
        .introRiskCard:hover{
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(15,23,42,0.08);
        }
        .introRiskCard.isActive{
          border-color: rgba(37,99,235,0.30);
          background: linear-gradient(135deg, rgba(37,99,235,0.10), rgba(255,255,255,0.94));
        }
        .introRiskNum{
          width: 30px;
          height: 30px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 900;
          color: #1d4ed8;
          background: rgba(37,99,235,0.10);
          border: 1px solid rgba(37,99,235,0.18);
          flex-shrink: 0;
        }

        @media (max-width: 1100px){
          .riskShell{
            grid-template-columns: 1fr;
          }
          .riskNav{
            position: relative;
            top: 0;
          }
        }
      `}</style>

      <Footer />
    </>
  );
}

function Field({ label, value, setValue, suffix = "" }) {
  return (
    <div className="col-12 col-md-4">
      <label className="form-label small text-muted fw-semibold">{label}</label>
      <div className="input-group">
        <input
          type="number"
          className="form-control"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {suffix ? <span className="input-group-text">{suffix}</span> : null}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="col-12 col-md-4">
      <div
        className="rounded-4 p-3 h-100"
        style={{
          border: "1px solid rgba(15,23,42,0.08)",
          background: "rgba(15,23,42,0.02)",
        }}
      >
        <div className="small text-muted fw-semibold">{label}</div>
        <div className="fw-bold mt-1">{value}</div>
      </div>
    </div>
  );
}

function Info({ title, body }) {
  return (
    <div className="col-12 col-md-4">
      <div
        className="rounded-4 p-3 h-100"
        style={{
          border: "1px solid rgba(15,23,42,0.08)",
          background: "rgba(255,255,255,0.84)",
        }}
      >
        <div className="fw-semibold mb-1">{title}</div>
        <div className="small text-muted">{body}</div>
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className={`riskCheck ${checked ? "isChecked" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="small">{label}</span>
    </label>
  );
}

function ResultRow({ label, ok }) {
  return (
    <div className={`riskCheck ${ok ? "isChecked" : ""}`}>
      <span className={`badge rounded-pill ${ok ? "text-bg-success" : "text-bg-danger"}`}>
        {ok ? "Pass" : "Fix"}
      </span>
      <span className="small">{label}</span>
    </div>
  );
}
