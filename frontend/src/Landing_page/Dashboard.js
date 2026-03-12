import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbaar from "./Navbar";
import { auth } from "./auth";
import { fetchDashboardData, updateProfile } from "../api/client";

function getCurrency(userCurrency) {
  const allowed = ["GBP", "USD", "EUR", "INR"];
  return allowed.includes(String(userCurrency || "").toUpperCase())
    ? String(userCurrency).toUpperCase()
    : "GBP";
}

function formatMoney(value, currency = "GBP") {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return `${currency} ${Number(value || 0).toFixed(2)}`;
  }
}

function formatPct(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDate(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function greet() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function compact(value) {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = auth.getUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [toast, setToast] = useState("");
  const [dashboard, setDashboard] = useState({
    user: storedUser,
    holdings: { data: [], summary: {} },
    trades: { data: [], summary: {} },
    progress: { data: [], summary: {} },
    meta: { generatedAt: "" },
  });
  const [profileForm, setProfileForm] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    country: storedUser?.country || "UK",
    preferredCurrency: getCurrency(storedUser?.preferredCurrency),
    onboardingCompleted: Boolean(storedUser?.onboardingCompleted),
  });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const res = await fetchDashboardData();
        if (!active) return;

        const nextData = res?.data || {};
        setDashboard({
          user: nextData.user || storedUser,
          holdings: nextData.holdings || { data: [], summary: {} },
          trades: nextData.trades || { data: [], summary: {} },
          progress: nextData.progress || { data: [], summary: {} },
          meta: nextData.meta || { generatedAt: "" },
        });

        if (nextData.user) {
          auth.login(nextData.user);
          setProfileForm({
            name: nextData.user.name || "",
            email: nextData.user.email || "",
            country: nextData.user.country || "UK",
            preferredCurrency: getCurrency(nextData.user.preferredCurrency),
            onboardingCompleted: Boolean(nextData.user.onboardingCompleted),
          });
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || "Unable to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [storedUser]);

  useEffect(() => {
    const accessError = location.state?.accessError;
    if (!accessError) return;
    setError(accessError);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const user = dashboard.user || storedUser;
  const currency = getCurrency(user?.preferredCurrency || profileForm.preferredCurrency);
  const holdingsSummary = useMemo(
    () => dashboard.holdings?.summary || {},
    [dashboard.holdings]
  );
  const tradeSummary = useMemo(
    () => dashboard.trades?.summary || {},
    [dashboard.trades]
  );
  const progressSummary = useMemo(
    () => dashboard.progress?.summary || {},
    [dashboard.progress]
  );

  const orderedLessons = useMemo(
    () =>
      [...(dashboard.progress?.data || [])].sort(
        (a, b) => Number(a.lessonOrder || 0) - Number(b.lessonOrder || 0)
      ),
    [dashboard.progress]
  );

  const topHoldings = useMemo(
    () =>
      [...(dashboard.holdings?.data || [])]
        .sort((a, b) => Number(b.marketValue || 0) - Number(a.marketValue || 0))
        .slice(0, 6),
    [dashboard.holdings]
  );

  const latestTrades = useMemo(
    () => (dashboard.trades?.data || []).slice(0, 6),
    [dashboard.trades]
  );

  const lessonBars = useMemo(
    () =>
      orderedLessons.map((lesson, index) => ({
        key: lesson.lessonKey,
        shortLabel:
          lesson.lessonKey === "trading-simulator"
            ? "LAB"
            : `L${index + 1}`,
        label:
          lesson.lessonKey === "trading-simulator"
            ? "Practice"
            : lesson.title.split(": ")[1]?.split(" ").slice(0, 2).join(" ") || lesson.title,
        value: Math.max(10, Number(lesson.progressPct || 0)),
        actual: Number(lesson.progressPct || 0),
        tone: index % 5,
      })),
    [orderedLessons]
  );

  const allocation = useMemo(() => {
    const total = Number(holdingsSummary.marketValue || 0);
    if (!total) return [];

    return topHoldings.map((holding) => ({
      symbol: holding.symbol,
      pct: Number((((holding.marketValue || 0) / total) * 100).toFixed(1)),
      value: holding.marketValue || 0,
    }));
  }, [holdingsSummary.marketValue, topHoldings]);

  const terminalStats = useMemo(
    () => [
      {
        label: "Portfolio value",
        value: formatMoney(holdingsSummary.marketValue, currency),
        sub: `${holdingsSummary.count || 0} live positions`,
        tone: "blue",
      },
      {
        label: "Open P/L",
        value: formatMoney(holdingsSummary.unrealizedPnL, currency),
        sub: `${holdingsSummary.winners || 0} winners / ${holdingsSummary.losers || 0} losers`,
        tone: Number(holdingsSummary.unrealizedPnL || 0) >= 0 ? "green" : "red",
      },
      {
        label: "Lessons completed",
        value: `${progressSummary.completed || 0}/${progressSummary.totalLessons || 0}`,
        sub: `${formatPct(progressSummary.averageProgress || 0)} average progress`,
        tone: "navy",
      },
      {
        label: "Trade win rate",
        value: formatPct(tradeSummary.winRate || 0),
        sub: `${tradeSummary.tradeCount || 0} recorded trades`,
        tone: "violet",
      },
    ],
    [currency, holdingsSummary, progressSummary, tradeSummary]
  );

  const nextLesson = progressSummary.nextLesson || orderedLessons.find(Boolean) || null;

  async function handleLogout() {
    await auth.logout();
    navigate("/home", { replace: true });
  }

  async function handleProfileSave() {
    const payload = {
      name: String(profileForm.name || "").trim(),
      email: String(profileForm.email || "").trim().toLowerCase(),
      country: String(profileForm.country || "").trim(),
      preferredCurrency: getCurrency(profileForm.preferredCurrency),
      onboardingCompleted: Boolean(profileForm.onboardingCompleted),
    };

    if (payload.name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (!payload.email.includes("@")) {
      setError("Valid email is required.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      const res = await updateProfile(payload);
      const nextUser = res?.user || res?.data || null;

      if (nextUser) {
        auth.login(nextUser);
        setDashboard((prev) => ({ ...prev, user: nextUser }));
        setProfileForm({
          name: nextUser.name || "",
          email: nextUser.email || "",
          country: nextUser.country || "UK",
          preferredCurrency: getCurrency(nextUser.preferredCurrency),
          onboardingCompleted: Boolean(nextUser.onboardingCompleted),
        });
      }

      setToast("Profile updated.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  if (!user) {
    return (
      <>
        <Navbaar />
        <section className="dashPage">
          <div className="container py-5">
            <div className="dashCard dashEmptyState text-center">
              <h2 className="dashTitle mb-2">You are not signed in</h2>
              <p className="dashMuted mb-4">
                Create an account to access the trading dashboard, lessons, and simulator.
              </p>
              <Link to="/signup" className="btn btn-primary px-4">
                Open account
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbaar />

      <section className="dashPage">
        <div className="container-xxl py-4 py-lg-5">
          {toast && <div className="dashToast">{toast}</div>}

          <div className="dashHeaderCard">
            <div className="dashHeaderCopy">
              <div className="dashEyebrow">{greet()}</div>
              <h1 className="dashHeroTitle">
                {user.name}, your market desk is live.
              </h1>
              <p className="dashMuted dashHeroText">
                Compact portfolio view, lesson launcher, and recent trading flow in one screen.
                Everything opens from here without the old lock friction.
              </p>
              <div className="dashHeroMetaRow">
                <div className="dashHeroMetaCard">
                  <span>Account country</span>
                  <strong>{profileForm.country || "UK"}</strong>
                </div>
                <div className="dashHeroMetaCard">
                  <span>Preferred currency</span>
                  <strong>{currency}</strong>
                </div>
                <div className="dashHeroMetaCard">
                  <span>Last sync</span>
                  <strong>{formatDate(dashboard.meta?.generatedAt)}</strong>
                </div>
              </div>
            </div>

            <div className="dashHeroTerminal">
              <div className="dashTerminalTop">
                <div>
                  <div className="dashTerminalLabel">Portfolio terminal</div>
                  <div className="dashTerminalValue">
                    {formatMoney(holdingsSummary.marketValue, currency)}
                  </div>
                </div>
                <div className={`dashTerminalBadge ${Number(holdingsSummary.unrealizedPnL || 0) >= 0 ? "isPos" : "isNeg"}`}>
                  {formatMoney(holdingsSummary.unrealizedPnL, currency)}
                </div>
              </div>

              <div className="dashHeroActionRow">
                <Link to={nextLesson?.path || "/lessons/fundamentals"} className="btn btn-primary px-4">
                  Open lessons
                </Link>
                <Link to="/practice/simulator" className="btn btn-dark px-4">
                  Launch simulator
                </Link>
                <button type="button" className="btn btn-outline-secondary px-4" onClick={handleLogout}>
                  Logout
                </button>
              </div>

              <div className="dashMiniStatGrid">
                <div className="dashMiniStat">
                  <span>Invested</span>
                  <strong>{formatMoney(holdingsSummary.investedValue, currency)}</strong>
                </div>
                <div className="dashMiniStat">
                  <span>Realized P/L</span>
                  <strong>{formatMoney(tradeSummary.realizedPnL, currency)}</strong>
                </div>
                <div className="dashMiniStat">
                  <span>Trades</span>
                  <strong>{tradeSummary.tradeCount || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              {error}
            </div>
          )}

          <div className="dashStatGrid mt-4">
            {terminalStats.map((item) => (
              <div key={item.label} className={`dashStatCard tone-${item.tone}`}>
                <div className="dashStatLabel">{item.label}</div>
                <div className="dashStatValue">{item.value}</div>
                <div className="dashStatSub">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="dashGrid mt-4">
            <section className="dashCard dashCardWide dashStudioCard">
              <div className="dashCardHead">
                <div>
                  <div className="dashCardTitle">Portfolio studio</div>
                  <div className="dashCardSub">High-density trading-style overview</div>
                </div>
                <div className="dashDeskPill">{holdingsSummary.count || 0} positions</div>
              </div>

              <div className="dashStudioGrid">
                <div className="dashStudioPanel">
                  <div className="dashPanelLabel">Performance ladder</div>
                  {topHoldings.length === 0 ? (
                    <div className="dashEmptyInline">No holdings yet. Seed the simulator to build a portfolio.</div>
                  ) : (
                    <div className="dashPerformanceList">
                      {topHoldings.map((holding) => (
                        <div key={holding._id || holding.symbol} className="dashPerformanceRow">
                          <div className="dashPerformanceHead">
                            <strong>{holding.symbol}</strong>
                            <span>{formatMoney(holding.marketValue, currency)}</span>
                          </div>
                          <div className="dashPerformanceTrack">
                            <div
                              className={`dashPerformanceFill ${Number(holding.unrealizedPnL || 0) >= 0 ? "isUp" : "isDown"}`}
                              style={{ width: `${Math.min(100, Math.max(10, Math.abs(Number(holding.unrealizedPnL || 0)) * 3))}%` }}
                            />
                          </div>
                          <div className={`dashPerformanceFoot ${Number(holding.unrealizedPnL || 0) >= 0 ? "isPos" : "isNeg"}`}>
                            {formatMoney(holding.unrealizedPnL, currency)} unrealized
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dashStudioPanel dashStudioPanelLesson">
                  <div className="dashPanelLabel">Lesson momentum</div>
                  <div className="dashPanelHint">Completion chart across all modules</div>
                  <div className="dashLessonBars">
                    {lessonBars.map((bar) => (
                      <div key={bar.key} className="dashLessonBarCol">
                        <div className="dashLessonBarTrack">
                          <div
                            className={`dashLessonBarFill tone-${bar.tone}`}
                            style={{ height: `${bar.value}%` }}
                          />
                        </div>
                        <div className="dashLessonBarPct">{bar.actual}%</div>
                        <div className="dashLessonBarKey">{bar.shortLabel}</div>
                        <div className="dashLessonBarLabel">{bar.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashStudioPanel dashStudioPanelAlloc">
                  <div className="dashPanelLabel">Allocation mix</div>
                  {allocation.length === 0 ? (
                    <div className="dashEmptyInline">Your portfolio mix appears here after you add holdings.</div>
                  ) : (
                    <div className="dashAllocationList">
                      {allocation.map((item, index) => (
                        <div key={item.symbol} className="dashAllocationRow">
                          <div className="dashAllocationHead">
                            <strong>{item.symbol}</strong>
                            <span>{item.pct}%</span>
                          </div>
                          <div className="dashAllocationTrack">
                            <div
                              className={`dashAllocationFill tone-${index % 4}`}
                              style={{ width: `${Math.max(item.pct, 8)}%` }}
                            />
                          </div>
                          <div className="dashAllocationValue">{formatMoney(item.value, currency)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="dashCard dashLessonDeck">
              <div className="dashCardHead">
                <div>
                  <div className="dashCardTitle">Lesson deck</div>
                  <div className="dashCardSub">All lessons are open once you sign in</div>
                </div>
                <div className="dashDeskPill">{progressSummary.completed || 0} completed</div>
              </div>

              <div className="dashLessonList">
                {orderedLessons.map((lesson) => (
                  <div className="dashLessonRow" key={lesson.lessonKey}>
                    <div className="dashLessonInfo">
                      <div className="dashLessonTitle">{lesson.title}</div>
                      <div className="dashLessonMetaLine">
                        <span>{lesson.status.replace("_", " ")}</span>
                        <span>{lesson.progressPct || 0}% complete</span>
                      </div>
                      <div className="dashProgressTrack">
                        <div className="dashProgressFill" style={{ width: `${lesson.progressPct || 0}%` }} />
                      </div>
                    </div>
                    <Link to={lesson.path} className="btn btn-sm btn-outline-primary px-3">
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashCard dashHoldingsCard">
              <div className="dashCardHead">
                <div>
                  <div className="dashCardTitle">Holdings board</div>
                  <div className="dashCardSub">Largest portfolio rows by market value</div>
                </div>
                <Link to="/practice/simulator" className="dashInlineLink">
                  Open simulator
                </Link>
              </div>

              {topHoldings.length === 0 ? (
                <div className="dashEmptyInline">
                  No holdings yet. Seed or create positions inside the simulator first.
                </div>
              ) : (
                <div className="dashTableWrap">
                  <div className="dashTableHeadRow">
                    <span>Symbol</span>
                    <span>Shares</span>
                    <span>Value</span>
                    <span>P/L</span>
                  </div>
                  {topHoldings.map((holding) => (
                    <div className="dashTableRow" key={holding._id || holding.symbol}>
                      <div>
                        <div className="dashTableTitle">{holding.symbol}</div>
                        <div className="dashTableSub">{holding.companyName || "Practice holding"}</div>
                      </div>
                      <div>{compact(holding.shares)}</div>
                      <div>{formatMoney(holding.marketValue, currency)}</div>
                      <div className={Number(holding.unrealizedPnL || 0) >= 0 ? "isPos" : "isNeg"}>
                        {formatMoney(holding.unrealizedPnL, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashCard dashTradesCard">
              <div className="dashCardHead">
                <div>
                  <div className="dashCardTitle">Trade tape</div>
                  <div className="dashCardSub">Recent execution events and summary</div>
                </div>
                <div className="dashDeskPill">{tradeSummary.tradeCount || 0} total</div>
              </div>

              <div className="dashTradeSummaryGrid">
                <div className="dashTradeSummaryBox">
                  <span>Buy value</span>
                  <strong>{formatMoney(tradeSummary.buyValue, currency)}</strong>
                </div>
                <div className="dashTradeSummaryBox">
                  <span>Sell value</span>
                  <strong>{formatMoney(tradeSummary.sellValue, currency)}</strong>
                </div>
                <div className="dashTradeSummaryBox">
                  <span>Wins</span>
                  <strong>{tradeSummary.wins || 0}</strong>
                </div>
                <div className="dashTradeSummaryBox">
                  <span>Losses</span>
                  <strong>{tradeSummary.losses || 0}</strong>
                </div>
              </div>

              {latestTrades.length === 0 ? (
                <div className="dashEmptyInline">No trades yet. Place a practice trade to populate the tape.</div>
              ) : (
                <div className="dashTradeFeed">
                  {latestTrades.map((trade) => (
                    <div className="dashTradeItem" key={trade._id || `${trade.symbol}-${trade.executedAt}`}>
                      <div className="dashTradeTop">
                        <strong>{trade.symbol}</strong>
                        <span className={`dashTradeSide ${trade.side === "BUY" ? "isBuy" : "isSell"}`}>
                          {trade.side}
                        </span>
                      </div>
                      <div className="dashTradeMeta">
                        {trade.shares} @ {formatMoney(trade.price, trade.currency || currency)}
                      </div>
                      <div className="dashTradeMeta">{formatDate(trade.executedAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashCard dashActionCardWide">
              <div className="dashCardHead">
                <div>
                  <div className="dashCardTitle">Quick launch</div>
                  <div className="dashCardSub">Fast navigation across lessons, simulator, and support</div>
                </div>
              </div>

              <div className="dashActionGrid">
                <Link to={nextLesson?.path || "/lessons/fundamentals"} className="dashActionTile">
                  <div className="dashActionLabel">Next lesson</div>
                  <div className="dashActionValue">{nextLesson?.title || "Start learning"}</div>
                </Link>
                <Link to="/practice/simulator" className="dashActionTile">
                  <div className="dashActionLabel">Practice</div>
                  <div className="dashActionValue">Trading simulator</div>
                </Link>
                <Link to="/support" className="dashActionTile">
                  <div className="dashActionLabel">Support</div>
                  <div className="dashActionValue">Create or track ticket</div>
                </Link>
                <Link to="/home" className="dashActionTile">
                  <div className="dashActionLabel">Website</div>
                  <div className="dashActionValue">Return to homepage</div>
                </Link>
              </div>
            </section>

            <section className="dashCard dashProfileCard">
              <div className="dashCardHead">
                <div>
                  <div className="dashCardTitle">Profile control</div>
                  <div className="dashCardSub">Keep your learner profile current</div>
                </div>
              </div>

              <div className="dashFormGrid">
                <label className="dashField">
                  <span>Name</span>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </label>
                <label className="dashField">
                  <span>Email</span>
                  <input
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </label>
                <label className="dashField">
                  <span>Country</span>
                  <input
                    value={profileForm.country}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, country: e.target.value }))}
                  />
                </label>
                <label className="dashField">
                  <span>Currency</span>
                  <select
                    value={profileForm.preferredCurrency}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        preferredCurrency: e.target.value,
                      }))
                    }
                  >
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </label>
              </div>

              <label className="dashCheck mt-3">
                <input
                  type="checkbox"
                  checked={profileForm.onboardingCompleted}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      onboardingCompleted: e.target.checked,
                    }))
                  }
                />
                <span>Mark onboarding as completed</span>
              </label>

              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={handleProfileSave}
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
            </section>
          </div>

          {loading && <div className="dashLoading mt-3">Refreshing dashboard...</div>}
        </div>
      </section>

      <style>{`
        .dashPage{
          min-height: calc(100vh - 78px);
          background:
            radial-gradient(circle at 0% 0%, rgba(37,99,235,0.22), transparent 28%),
            radial-gradient(circle at 100% 12%, rgba(22,163,74,0.16), transparent 24%),
            radial-gradient(circle at 82% 82%, rgba(168,85,247,0.12), transparent 22%),
            linear-gradient(180deg, #eef4ff 0%, #e9f3ff 42%, #edfdf6 100%);
        }

        .dashCard,
        .dashHeaderCard,
        .dashStatCard{
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,255,0.92));
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 20px 55px rgba(15,23,42,0.09);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .dashHeaderCard{
          border-radius: 28px;
          padding: 24px;
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
          gap: 18px;
          align-items: stretch;
        }

        .dashHeaderCopy,
        .dashHeroTerminal{
          min-width: 0;
        }

        .dashEyebrow{
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 900;
          color: rgba(15,23,42,0.48);
        }

        .dashHeroTitle{
          margin: 8px 0 12px;
          font-size: clamp(2rem, 3vw, 3.1rem);
          line-height: 0.98;
          letter-spacing: -0.04em;
          color: #0f172a;
          font-weight: 950;
          max-width: 12ch;
        }

        .dashHeroText{
          max-width: 62ch;
        }

        .dashMuted{
          margin: 0;
          color: rgba(15,23,42,0.62);
          line-height: 1.7;
        }

        .dashHeroMetaRow{
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .dashHeroMetaCard,
        .dashMiniStat,
        .dashTradeSummaryBox{
          padding: 12px 14px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(248,250,252,0.95), rgba(255,255,255,0.85));
          border: 1px solid rgba(15,23,42,0.06);
        }

        .dashHeroMetaCard:nth-child(1){
          background: linear-gradient(180deg, rgba(239,246,255,0.96), rgba(255,255,255,0.88));
        }

        .dashHeroMetaCard:nth-child(2){
          background: linear-gradient(180deg, rgba(240,253,244,0.96), rgba(255,255,255,0.88));
        }

        .dashHeroMetaCard:nth-child(3){
          background: linear-gradient(180deg, rgba(250,245,255,0.96), rgba(255,255,255,0.88));
        }

        .dashMiniStat:nth-child(1){
          background: linear-gradient(180deg, rgba(239,246,255,0.94), rgba(255,255,255,0.84));
        }

        .dashMiniStat:nth-child(2){
          background: linear-gradient(180deg, rgba(240,253,244,0.94), rgba(255,255,255,0.84));
        }

        .dashMiniStat:nth-child(3){
          background: linear-gradient(180deg, rgba(250,245,255,0.94), rgba(255,255,255,0.84));
        }

        .dashHeroMetaCard span,
        .dashMiniStat span,
        .dashTradeSummaryBox span,
        .dashStatLabel,
        .dashPanelLabel,
        .dashActionLabel,
        .dashLessonMetaLine,
        .dashTableSub,
        .dashTradeMeta,
        .dashCardSub,
        .dashField span{
          display: block;
          font-size: 12px;
          color: rgba(15,23,42,0.56);
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .dashHeroMetaCard strong,
        .dashMiniStat strong,
        .dashTradeSummaryBox strong{
          display: block;
          margin-top: 3px;
          color: #0f172a;
          font-weight: 900;
        }

        .dashHeroTerminal{
          padding: 18px;
          border-radius: 24px;
          background:
            linear-gradient(145deg, rgba(10,22,55,0.96), rgba(15,23,42,0.92) 45%, rgba(7,18,37,0.96));
          color: #f8fbff;
          border: 1px solid rgba(148,163,184,0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 100%;
        }

        .dashTerminalTop{
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
        }

        .dashTerminalLabel{
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(226,232,240,0.62);
        }

        .dashTerminalValue{
          margin-top: 8px;
          font-size: clamp(1.8rem, 2vw, 2.5rem);
          line-height: 1;
          font-weight: 950;
          letter-spacing: -0.04em;
        }

        .dashTerminalBadge,
        .dashDeskPill{
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .dashTerminalBadge{
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .dashHeroActionRow{
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dashMiniStatGrid,
        .dashTradeSummaryGrid,
        .dashStatGrid,
        .dashActionGrid,
        .dashFormGrid{
          display: grid;
          gap: 12px;
        }

        .dashMiniStatGrid{
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .dashStatGrid{
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .dashStatCard{
          border-radius: 22px;
          padding: 18px;
          overflow: hidden;
          position: relative;
        }

        .dashStatCard::after{
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 4px;
          opacity: 0.95;
        }

        .tone-blue::after{ background: linear-gradient(90deg, #2563eb, #38bdf8); }
        .tone-green::after{ background: linear-gradient(90deg, #16a34a, #4ade80); }
        .tone-red::after{ background: linear-gradient(90deg, #dc2626, #fb7185); }
        .tone-violet::after{ background: linear-gradient(90deg, #7c3aed, #c084fc); }
        .tone-navy::after{ background: linear-gradient(90deg, #0f172a, #475569); }

        .dashStatValue{
          margin-top: 8px;
          font-size: clamp(1.35rem, 1.8vw, 2rem);
          line-height: 1.05;
          color: #0f172a;
          font-weight: 950;
          letter-spacing: -0.03em;
        }

        .dashStatSub{
          margin-top: 5px;
          font-size: 12px;
          color: rgba(15,23,42,0.58);
          font-weight: 800;
        }

        .dashGrid{
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 18px;
        }

        .dashCard{
          border-radius: 26px;
          padding: 20px;
          min-width: 0;
          position: relative;
          overflow: hidden;
        }

        .dashCard::before{
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.85;
        }

        .dashStudioCard::before{
          background:
            radial-gradient(circle at 8% 12%, rgba(37,99,235,0.08), transparent 24%),
            radial-gradient(circle at 92% 14%, rgba(34,197,94,0.08), transparent 20%);
        }

        .dashLessonDeck::before{
          background:
            radial-gradient(circle at 86% 8%, rgba(59,130,246,0.09), transparent 20%),
            linear-gradient(180deg, rgba(239,246,255,0.55), transparent 44%);
        }

        .dashHoldingsCard::before{
          background:
            radial-gradient(circle at 10% 10%, rgba(14,165,233,0.08), transparent 24%),
            linear-gradient(180deg, rgba(240,249,255,0.62), transparent 48%);
        }

        .dashTradesCard::before{
          background:
            radial-gradient(circle at 92% 10%, rgba(168,85,247,0.08), transparent 22%),
            linear-gradient(180deg, rgba(250,245,255,0.52), transparent 48%);
        }

        .dashActionCardWide::before{
          background:
            radial-gradient(circle at 12% 8%, rgba(22,163,74,0.07), transparent 22%),
            linear-gradient(180deg, rgba(240,253,244,0.56), transparent 50%);
        }

        .dashProfileCard::before{
          background:
            radial-gradient(circle at 88% 10%, rgba(245,158,11,0.08), transparent 22%),
            linear-gradient(180deg, rgba(255,251,235,0.52), transparent 48%);
        }

        .dashCardWide,
        .dashActionCardWide{
          grid-column: span 8;
        }

        .dashLessonDeck,
        .dashTradesCard,
        .dashProfileCard{
          grid-column: span 4;
        }

        .dashHoldingsCard{
          grid-column: span 7;
        }

        .dashTradesCard{
          grid-column: span 5;
        }

        .dashActionCardWide{
          grid-column: span 8;
        }

        .dashProfileCard{
          grid-column: span 4;
        }

        .dashCardHead{
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .dashCardTitle,
        .dashLessonTitle,
        .dashTableTitle,
        .dashActionValue,
        .dashTitle{
          color: #0f172a;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .dashCardTitle{
          font-size: 1.15rem;
        }

        .dashDeskPill{
          background: rgba(37,99,235,0.08);
          color: #1d4ed8;
          border: 1px solid rgba(37,99,235,0.12);
        }

        .dashStudioGrid{
          display: grid;
          grid-template-columns: 1.15fr 0.9fr 1fr;
          gap: 14px;
        }

        .dashStudioPanel,
        .dashActionTile{
          padding: 16px;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.92));
          border: 1px solid rgba(15,23,42,0.06);
          min-width: 0;
          position: relative;
        }

        .dashStudioPanel:first-child{
          background:
            radial-gradient(circle at 14% 10%, rgba(59,130,246,0.08), transparent 28%),
            linear-gradient(180deg, rgba(239,246,255,0.96), rgba(255,255,255,0.92));
        }

        .dashStudioPanelLesson{
          background:
            radial-gradient(circle at 18% 18%, rgba(37,99,235,0.08), transparent 34%),
            linear-gradient(180deg, rgba(241,245,255,0.96), rgba(255,255,255,0.94));
        }

        .dashStudioPanelAlloc{
          background:
            radial-gradient(circle at 88% 10%, rgba(34,197,94,0.1), transparent 30%),
            linear-gradient(180deg, rgba(244,255,249,0.96), rgba(255,255,255,0.92));
        }

        .dashPerformanceList,
        .dashAllocationList,
        .dashTradeFeed,
        .dashLessonList{
          display: grid;
          gap: 12px;
        }

        .dashPerformanceRow,
        .dashLessonRow,
        .dashTradeItem{
          display: grid;
          gap: 8px;
        }

        .dashPerformanceHead,
        .dashAllocationHead,
        .dashTradeTop,
        .dashTableHeadRow,
        .dashTableRow{
          display: grid;
          gap: 12px;
          align-items: center;
        }

        .dashPerformanceHead,
        .dashAllocationHead,
        .dashTradeTop{
          grid-template-columns: 1fr auto;
          color: #0f172a;
          font-size: 13px;
        }

        .dashPerformanceTrack,
        .dashAllocationTrack,
        .dashProgressTrack,
        .dashLessonBarTrack{
          width: 100%;
          overflow: hidden;
          background: rgba(148,163,184,0.18);
        }

        .dashPerformanceTrack,
        .dashAllocationTrack,
        .dashProgressTrack{
          height: 8px;
          border-radius: 999px;
        }

        .dashPerformanceFill,
        .dashAllocationFill,
        .dashProgressFill{
          height: 100%;
          border-radius: inherit;
        }

        .dashPerformanceFill.isUp,
        .dashProgressFill{
          background: linear-gradient(90deg, #2563eb, #22c55e);
        }

        .dashPerformanceFill.isDown{
          background: linear-gradient(90deg, #dc2626, #fb7185);
        }

        .dashAllocationFill.tone-0{ background: linear-gradient(90deg, #2563eb, #38bdf8); }
        .dashAllocationFill.tone-1{ background: linear-gradient(90deg, #22c55e, #86efac); }
        .dashAllocationFill.tone-2{ background: linear-gradient(90deg, #7c3aed, #c084fc); }
        .dashAllocationFill.tone-3{ background: linear-gradient(90deg, #f59e0b, #fbbf24); }

        .dashPerformanceFoot,
        .dashAllocationValue{
          font-size: 12px;
          font-weight: 800;
        }

        .dashLessonBars{
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          align-items: end;
          min-height: 220px;
          margin-top: 12px;
        }

        .dashPanelHint{
          margin-top: 4px;
          font-size: 12px;
          color: rgba(15,23,42,0.54);
          font-weight: 800;
        }

        .dashLessonBarCol{
          display: grid;
          gap: 6px;
          justify-items: center;
          min-width: 0;
        }

        .dashLessonBarTrack{
          height: 150px;
          border-radius: 18px;
          display: flex;
          align-items: end;
          padding: 6px;
          background: linear-gradient(180deg, rgba(226,232,240,0.46), rgba(226,232,240,0.14));
        }

        .dashLessonBarPct{
          font-size: 12px;
          font-weight: 900;
          color: #0f172a;
        }

        .dashLessonBarKey{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 38px;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          color: #1e3a8a;
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.12);
        }

        .dashLessonBarLabel{
          text-align: center;
          font-size: 11px;
          color: rgba(15,23,42,0.58);
          font-weight: 800;
          line-height: 1.4;
        }

        .dashLessonBarFill{
          width: 100%;
          min-height: 14px;
          box-shadow: 0 12px 22px rgba(37,99,235,0.16);
        }

        .dashLessonBarFill.tone-0{ background: linear-gradient(180deg, #2563eb, #38bdf8); }
        .dashLessonBarFill.tone-1{ background: linear-gradient(180deg, #22c55e, #86efac); }
        .dashLessonBarFill.tone-2{ background: linear-gradient(180deg, #7c3aed, #c084fc); }
        .dashLessonBarFill.tone-3{ background: linear-gradient(180deg, #f59e0b, #fbbf24); }
        .dashLessonBarFill.tone-4{ background: linear-gradient(180deg, #0f172a, #475569); }

        .dashLessonRow{
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }

        .dashLessonRow:last-child{
          border-bottom: none;
          padding-bottom: 0;
        }

        .dashLessonInfo{
          min-width: 0;
        }

        .dashLessonTitle{
          font-size: 14px;
        }

        .dashLessonMetaLine{
          margin: 6px 0 8px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .dashInlineLink{
          text-decoration: none;
          color: #2563eb;
          font-size: 13px;
          font-weight: 900;
        }

        .dashTableWrap{
          display: grid;
          gap: 10px;
        }

        .dashTableHeadRow,
        .dashTableRow{
          grid-template-columns: minmax(0, 1.4fr) 0.7fr 0.8fr 0.8fr;
        }

        .dashTableHeadRow{
          padding: 0 0 6px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(15,23,42,0.42);
        }

        .dashTableRow{
          padding: 12px 14px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(248,250,252,0.96), rgba(255,255,255,0.88));
          border: 1px solid rgba(15,23,42,0.06);
          color: #0f172a;
          font-size: 14px;
          font-weight: 700;
        }

        .dashTableRow:nth-child(odd){
          background: linear-gradient(180deg, rgba(239,246,255,0.92), rgba(255,255,255,0.9));
        }

        .dashTableRow:nth-child(even){
          background: linear-gradient(180deg, rgba(240,253,244,0.88), rgba(255,255,255,0.9));
        }

        .dashTradeSummaryGrid{
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-bottom: 12px;
        }

        .dashTradeFeed{
          max-height: 360px;
          overflow: auto;
          padding-right: 4px;
        }

        .dashTradeItem{
          padding: 13px 14px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(248,250,252,0.96), rgba(255,255,255,0.9));
          border: 1px solid rgba(15,23,42,0.06);
        }

        .dashTradeItem:nth-child(odd){
          background: linear-gradient(180deg, rgba(250,245,255,0.92), rgba(255,255,255,0.9));
        }

        .dashTradeItem:nth-child(even){
          background: linear-gradient(180deg, rgba(239,246,255,0.92), rgba(255,255,255,0.9));
        }

        .dashTradeSide{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 54px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .dashTradeSide.isBuy{
          background: rgba(34,197,94,0.1);
          color: #15803d;
          border: 1px solid rgba(34,197,94,0.18);
        }

        .dashTradeSide.isSell{
          background: rgba(239,68,68,0.08);
          color: #b91c1c;
          border: 1px solid rgba(239,68,68,0.14);
        }

        .dashActionGrid{
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dashActionTile{
          text-decoration: none;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .dashActionTile:nth-child(1){
          background: linear-gradient(180deg, rgba(239,246,255,0.96), rgba(255,255,255,0.9));
        }

        .dashActionTile:nth-child(2){
          background: linear-gradient(180deg, rgba(240,253,244,0.96), rgba(255,255,255,0.9));
        }

        .dashActionTile:nth-child(3){
          background: linear-gradient(180deg, rgba(250,245,255,0.96), rgba(255,255,255,0.9));
        }

        .dashActionTile:nth-child(4){
          background: linear-gradient(180deg, rgba(255,251,235,0.96), rgba(255,255,255,0.9));
        }

        .dashActionTile:hover{
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(15,23,42,0.08);
        }

        .dashActionValue{
          margin-top: 6px;
          font-size: 1rem;
        }

        .dashFormGrid{
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dashField{
          display: grid;
          gap: 6px;
        }

        .dashField input,
        .dashField select{
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,0.12);
          background: rgba(255,255,255,0.96);
          padding: 11px 12px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
        }

        .dashField input:focus,
        .dashField select:focus{
          border-color: rgba(37,99,235,0.48);
          box-shadow: 0 0 0 4px rgba(37,99,235,0.08);
        }

        .dashCheck{
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(15,23,42,0.72);
          font-weight: 700;
        }

        .dashToast{
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 1000;
          padding: 11px 14px;
          border-radius: 14px;
          background: rgba(15,23,42,0.92);
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 16px 45px rgba(15,23,42,0.2);
        }

        .dashLoading,
        .dashEmptyInline,
        .dashEmptyState{
          color: rgba(15,23,42,0.58);
          font-weight: 700;
        }

        .dashEmptyState{
          padding: 28px;
        }

        .isPos{ color: #15803d !important; }
        .isNeg{ color: #b91c1c !important; }

        @media (max-width: 1200px){
          .dashHeaderCard,
          .dashStudioGrid,
          .dashGrid{
            grid-template-columns: 1fr;
          }

          .dashCardWide,
          .dashActionCardWide,
          .dashLessonDeck,
          .dashHoldingsCard,
          .dashTradesCard,
          .dashProfileCard{
            grid-column: span 1;
          }
        }

        @media (max-width: 992px){
          .dashStatGrid,
          .dashHeroMetaRow,
          .dashMiniStatGrid,
          .dashTradeSummaryGrid,
          .dashActionGrid,
          .dashFormGrid{
            grid-template-columns: 1fr 1fr;
          }

          .dashHeaderCard{
            padding: 20px;
          }

          .dashHeroActionRow{
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (max-width: 768px){
          .dashStatGrid,
          .dashHeroMetaRow,
          .dashMiniStatGrid,
          .dashTradeSummaryGrid,
          .dashActionGrid,
          .dashFormGrid,
          .dashLessonBars{
            grid-template-columns: 1fr;
          }

          .dashTableHeadRow{
            display: none;
          }

          .dashTableRow{
            grid-template-columns: 1fr;
          }

          .dashLessonRow{
            grid-template-columns: 1fr;
          }

          .dashLessonRow .btn{
            margin-top: 10px;
            width: 100%;
          }

          .dashHeroTitle{
            max-width: none;
          }
        }
      `}</style>
    </>
  );
}
