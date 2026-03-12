import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbaar from "../Navbar";
import Footer from "../Footer";
import { auth } from "../auth";
import useLessonProgress from "./useLessonProgress";
import {
  createTrade,
  fetchHoldings,
  fetchTradeSummary,
  fetchTrades,
  resetPracticeAccount,
  seedHoldings,
} from "../../api/client";

const STARTING_CASH = 10000;
const MODEL_CAPITAL = 5000;
const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#ef4444",
  "#7c3aed",
  "#f59e0b",
  "#06b6d4",
  "#0f766e",
  "#4f46e5",
];

const baseSymbols = [
  { sym: "AAPL", name: "Apple", price: 182.4, drift: 0.02, vol: 0.48, sector: "Technology", exchange: "NASDAQ", region: "US", hq: "Cupertino, US" },
  { sym: "TSLA", name: "Tesla", price: 193.2, drift: 0.03, vol: 0.85, sector: "Automotive", exchange: "NASDAQ", region: "US", hq: "Austin, US" },
  { sym: "MSFT", name: "Microsoft", price: 418.8, drift: 0.018, vol: 0.44, sector: "Technology", exchange: "NASDAQ", region: "US", hq: "Redmond, US" },
  { sym: "NVDA", name: "NVIDIA", price: 846.5, drift: 0.03, vol: 0.9, sector: "Semiconductors", exchange: "NASDAQ", region: "US", hq: "Santa Clara, US" },
  { sym: "AMZN", name: "Amazon", price: 172.2, drift: 0.02, vol: 0.55, sector: "E-commerce", exchange: "NASDAQ", region: "US", hq: "Seattle, US" },
  { sym: "GOOGL", name: "Alphabet", price: 164.4, drift: 0.018, vol: 0.5, sector: "Technology", exchange: "NASDAQ", region: "US", hq: "Mountain View, US" },
  { sym: "META", name: "Meta", price: 501.2, drift: 0.024, vol: 0.62, sector: "Communication", exchange: "NASDAQ", region: "US", hq: "Menlo Park, US" },
  { sym: "NFLX", name: "Netflix", price: 611.7, drift: 0.022, vol: 0.72, sector: "Communication", exchange: "NASDAQ", region: "US", hq: "Los Gatos, US" },
  { sym: "SONY", name: "Sony", price: 89.3, drift: 0.015, vol: 0.42, sector: "Consumer Electronics", exchange: "NYSE", region: "Japan", hq: "Tokyo, Japan" },
  { sym: "HSBA", name: "HSBC", price: 6.8, drift: 0.01, vol: 0.25, sector: "Financials", exchange: "LSE", region: "UK", hq: "London, UK" },
  { sym: "BP", name: "BP", price: 4.65, drift: 0.012, vol: 0.28, sector: "Energy", exchange: "LSE", region: "UK", hq: "London, UK" },
  { sym: "VOD", name: "Vodafone", price: 0.71, drift: 0.008, vol: 0.2, sector: "Telecom", exchange: "LSE", region: "UK", hq: "Newbury, UK" },
];

const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

function fmtGBP(value) {
  return money.format(Number(value || 0));
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function timeFromDate(value) {
  if (!value) return nowTime();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return nowTime();
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function seedQuotes() {
  return baseSymbols.map((s) => {
    const history = Array.from({ length: 52 }, (_, i) => {
      const driftSeed = (i - 51) * 0.0007;
      return Number((s.price * (1 + driftSeed)).toFixed(2));
    });
    return {
      ...s,
      base: s.price,
      high: s.price,
      low: s.price,
      chgPct: 0,
      history,
    };
  });
}

export default function TradingPractice() {
  const [quotes, setQuotes] = useState(() => seedQuotes());
  const [lastTick, setLastTick] = useState(nowTime());
  const [watchlistSymbols, setWatchlistSymbols] = useState([
    "AAPL",
    "TSLA",
    "MSFT",
    "NVDA",
    "AMZN",
    "GOOGL",
    "META",
    "HSBA",
  ]);
  const [portfolioPicks, setPortfolioPicks] = useState(["AAPL", "MSFT", "NVDA", "HSBA"]);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryRegion, setDirectoryRegion] = useState("All");

  const [selected, setSelected] = useState("AAPL");
  const [compare, setCompare] = useState("MSFT");

  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [qty, setQty] = useState("5");
  const [limitPrice, setLimitPrice] = useState("");
  const [slippage, setSlippage] = useState("0.10");

  const [cash, setCash] = useState(STARTING_CASH);
  const [realized, setRealized] = useState(0);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [toast, setToast] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => {
      setQuotes((prev) =>
        prev.map((q) => {
          const noise = (Math.random() - 0.5) * q.vol;
          const stepPct = q.drift + noise;
          const nextPrice = Math.max(1, q.price * (1 + stepPct / 100));
          const roundedPrice = Number(nextPrice.toFixed(2));
          const chgPct = ((roundedPrice - q.base) / q.base) * 100;

          return {
            ...q,
            price: roundedPrice,
            high: Math.max(q.high, roundedPrice),
            low: Math.min(q.low, roundedPrice),
            chgPct,
            history: [...q.history, roundedPrice].slice(-72),
          };
        })
      );
      setLastTick(nowTime());
    }, 1300);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!watchlistSymbols.includes(selected)) {
      setSelected(watchlistSymbols[0] || baseSymbols[0].sym);
    }
  }, [watchlistSymbols, selected]);

  useEffect(() => {
    const validCompare = watchlistSymbols.filter((sym) => sym !== selected);
    if (validCompare.length === 0) {
      setCompare("");
      return;
    }
    if (!compare || !validCompare.includes(compare)) {
      setCompare(validCompare[0]);
    }
  }, [watchlistSymbols, selected, compare]);

  const watchlistQuotes = useMemo(
    () => quotes.filter((q) => watchlistSymbols.includes(q.sym)),
    [quotes, watchlistSymbols]
  );

  const selectedQuote = useMemo(() => {
    const inQuotes = quotes.find((q) => q.sym === selected);
    if (inQuotes) return inQuotes;
    return watchlistQuotes[0] || quotes[0] || null;
  }, [quotes, watchlistQuotes, selected]);

  const compareQuote = useMemo(() => {
    if (!compare) return null;
    return quotes.find((q) => q.sym === compare) || null;
  }, [quotes, compare]);

  const bestBid = selectedQuote ? selectedQuote.price * 0.999 : 0;
  const bestAsk = selectedQuote ? selectedQuote.price * 1.001 : 0;

  const quoteMap = useMemo(
    () => Object.fromEntries(quotes.map((q) => [q.sym, q.price])),
    [quotes]
  );

  const portfolio = useMemo(() => {
    const getMark = (sym) => quoteMap[sym] || 0;
    const marketValue = positions.reduce((sum, p) => sum + getMark(p.sym) * p.qty, 0);
    const unrealized = positions.reduce((sum, p) => sum + (getMark(p.sym) - p.avg) * p.qty, 0);
    const equity = cash + marketValue;
    return { marketValue, unrealized, equity };
  }, [positions, quoteMap, cash]);

  const modelPortfolio = useMemo(() => {
    const picks = quotes.filter((q) => portfolioPicks.includes(q.sym));
    const count = picks.length;
    const equalWeight = count > 0 ? 100 / count : 0;
    const avgMove = count > 0 ? picks.reduce((sum, q) => sum + q.chgPct, 0) / count : 0;
    const dayPnl = MODEL_CAPITAL * (avgMove / 100);
    return { picks, count, equalWeight, avgMove, dayPnl };
  }, [quotes, portfolioPicks]);

  const directoryRegions = useMemo(
    () => ["All", ...Array.from(new Set(quotes.map((q) => q.region))).sort()],
    [quotes]
  );

  const directoryRows = useMemo(() => {
    const query = directoryQuery.trim().toLowerCase();
    return quotes.filter((q) => {
      const regionMatch = directoryRegion === "All" || q.region === directoryRegion;
      if (!regionMatch) return false;
      if (!query) return true;
      const hay = `${q.sym} ${q.name} ${q.sector} ${q.exchange} ${q.region} ${q.hq}`.toLowerCase();
      return hay.includes(query);
    });
  }, [quotes, directoryQuery, directoryRegion]);

  const analytics = useMemo(() => {
    const filled = trades.filter((t) => t.status === "Filled");
    const buyTrades = filled.filter((t) => t.side === "buy");
    const sellTrades = filled.filter((t) => t.side === "sell");

    const totalBuyValue = buyTrades.reduce((sum, t) => sum + t.qty * t.price, 0);
    const totalSellValue = sellTrades.reduce((sum, t) => sum + t.qty * t.price, 0);
    const totalBoughtShares = buyTrades.reduce((sum, t) => sum + t.qty, 0);
    const totalSoldShares = sellTrades.reduce((sum, t) => sum + t.qty, 0);

    const closedTrades = sellTrades.filter((t) => typeof t.pnl === "number");
    const realizedProfit = closedTrades
      .filter((t) => t.pnl > 0)
      .reduce((sum, t) => sum + t.pnl, 0);
    const realizedLoss = Math.abs(
      closedTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)
    );
    const netRealized = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = closedTrades.filter((t) => t.pnl > 0).length;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

    const holdings = positions
      .map((p) => ({
        sym: p.sym,
        value: (quoteMap[p.sym] || 0) * p.qty,
      }))
      .filter((x) => x.value > 0);

    const holdingsTotal = holdings.reduce((sum, h) => sum + h.value, 0);
    const holdingSlices = holdings.map((h, i) => ({
      ...h,
      pct: holdingsTotal > 0 ? (h.value / holdingsTotal) * 100 : 0,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    return {
      totalBuyValue,
      totalSellValue,
      totalBoughtShares,
      totalSoldShares,
      realizedProfit,
      realizedLoss,
      netRealized,
      winRate,
      closedCount: closedTrades.length,
      holdingSlices,
      holdingsTotal,
    };
  }, [trades, positions, quoteMap]);

  const pushToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__practice_toast);
    window.__practice_toast = window.setTimeout(() => setToast(""), 2200);
  };

  const syncFromBackend = useCallback(async ({ seedIfEmpty = false, replace = false } = {}) => {
    if (!auth.isLoggedIn()) {
      setSyncError("Missing user session id. Please sign in again.");
      return;
    }

    setSyncing(true);
    setSyncError("");

    try {
      let holdingsRes = await fetchHoldings();

      if (seedIfEmpty && (holdingsRes?.data?.length || 0) === 0) {
        try {
          await seedHoldings(replace);
        } catch (err) {
          if (err.status !== 409) throw err;
        }
        holdingsRes = await fetchHoldings();
      }

      const [tradeRes, summaryRes] = await Promise.all([
        fetchTrades(40),
        fetchTradeSummary(),
      ]);

      const apiHoldings = holdingsRes?.data || [];
      const apiTrades = tradeRes?.data || [];
      const apiSummary = summaryRes?.summary || {};

      setPositions(
        apiHoldings.map((h) => ({
          sym: h.symbol,
          qty: Number(h.shares || 0),
          avg: Number(h.avgBuyPrice || 0),
        }))
      );

      setTrades(
        apiTrades.map((t) => ({
          id: t._id,
          time: timeFromDate(t.executedAt),
          sym: t.symbol,
          side: String(t.side || "").toLowerCase(),
          qty: Number(t.shares || 0),
          type: t.strategyTag || "market",
          price: Number(t.price || 0),
          status: "Filled",
          pnl:
            String(t.side || "").toUpperCase() === "SELL"
              ? Number(t.realizedPnL || 0)
              : null,
        }))
      );

      const buyValue = Number(apiSummary.buyValue || 0);
      const sellValue = Number(apiSummary.sellValue || 0);
      setCash(Number((STARTING_CASH - buyValue + sellValue).toFixed(2)));
      setRealized(Number(apiSummary.realizedPnL || 0));

      if (apiHoldings.length > 0) {
        const symbols = apiHoldings.map((h) => h.symbol).filter(Boolean);
        setWatchlistSymbols((prev) => Array.from(new Set([...prev, ...symbols])));
        setPortfolioPicks((prev) => Array.from(new Set([...prev, ...symbols])));
      }
    } catch (err) {
      setSyncError(err.message || "Failed to sync trading data.");
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncFromBackend({ seedIfEmpty: true, replace: false });
  }, [syncFromBackend]);

  const lessonProgressPct = useMemo(() => {
    if (trades.length > 0) return 100;
    if (positions.length > 0) return 70;
    return 25;
  }, [positions.length, trades.length]);

  const lessonProgress = useLessonProgress({
    lessonKey: "trading-simulator",
    title: "Trading Simulation Practice",
    path: "/practice/simulator",
    progressPct: lessonProgressPct,
    lastStep: trades.length > 0 ? 3 : positions.length > 0 ? 2 : 1,
    totalSteps: 3,
  });

  const toggleWatchlist = (sym) => {
    setWatchlistSymbols((prev) => {
      if (prev.includes(sym)) {
        if (prev.length <= 2) {
          pushToast("Keep at least 2 symbols in watchlist.");
          return prev;
        }
        return prev.filter((x) => x !== sym);
      }
      return [...prev, sym];
    });
  };

  const togglePortfolioPick = (sym) => {
    setPortfolioPicks((prev) => {
      if (prev.includes(sym)) {
        if (prev.length <= 1) {
          pushToast("Keep at least 1 symbol in model portfolio.");
          return prev;
        }
        return prev.filter((x) => x !== sym);
      }
      return [...prev, sym];
    });
  };

  const executeOrder = async () => {
    const size = Math.floor(Number(qty));
    const limit = Number(limitPrice);
    const slipPct = Math.max(0, Number(slippage) || 0) / 100;

    if (!selectedQuote) {
      pushToast("No quote selected.");
      return;
    }
    if (!(size > 0)) {
      pushToast("Quantity must be greater than 0.");
      return;
    }
    if (orderType === "limit" && !(limit > 0)) {
      pushToast("Enter a valid limit price.");
      return;
    }

    const marketPx = side === "buy" ? bestAsk : bestBid;
    const canFillLimit =
      orderType === "market" ||
      (side === "buy" ? marketPx <= limit : marketPx >= limit);

    if (!canFillLimit) {
      setTrades((prev) => [
        {
          id: Date.now(),
          time: nowTime(),
          sym: selectedQuote.sym,
          side,
          qty: size,
          type: "limit",
          price: limit,
          status: "Not Filled",
          pnl: null,
        },
        ...prev.slice(0, 39),
      ]);
      pushToast("Limit order not filled. Price not reached.");
      return;
    }

    const fillBase = orderType === "market" ? marketPx : limit;
    const fillPrice = side === "buy" ? fillBase * (1 + slipPct) : fillBase * (1 - slipPct);
    const finalFill = Number(fillPrice.toFixed(2));
    const orderCost = finalFill * size;

    if (side === "buy") {
      if (orderCost > cash) {
        pushToast("Insufficient cash for this order.");
        return;
      }
    } else {
      const existing = positions.find((p) => p.sym === selectedQuote.sym);
      if (!existing || existing.qty < size) {
        pushToast("You cannot sell more shares than you hold.");
        return;
      }
    }

    try {
      setSyncing(true);
      setSyncError("");

      await createTrade({
        symbol: selectedQuote.sym,
        companyName: selectedQuote.name,
        exchange: selectedQuote.exchange,
        sector: selectedQuote.sector,
        side: side.toUpperCase(),
        shares: size,
        price: finalFill,
        fees: 0,
        tax: 0,
        currency: "GBP",
        strategyTag: orderType,
      });

      await syncFromBackend();
      pushToast(`${side.toUpperCase()} ${size} ${selectedQuote.sym} @ ${fmtGBP(finalFill)}`);
    } catch (err) {
      setSyncError(err.message || "Order failed.");
      pushToast("Order failed.");
    } finally {
      setSyncing(false);
    }
  };

  const resetPractice = async () => {
    try {
      setSyncing(true);
      setSyncError("");
      setQuotes(seedQuotes());
      await resetPracticeAccount(true);
      await syncFromBackend();
      setLimitPrice("");
      setSide("buy");
      setOrderType("market");
      setQty("5");
      setSlippage("0.10");
      pushToast("Simulation reset.");
    } catch (err) {
      setSyncError(err.message || "Reset failed.");
      pushToast("Reset failed.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Navbaar />

      <section className="tradePage py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
            <div>
              <span className="tradeBadge">PAPER TRADING PRACTICE</span>
              <h3 className="fw-bold mt-2 mb-1">Trading Simulation Terminal</h3>
              <div className="text-muted">
                Select symbols, compare movement, and build a model portfolio before placing trades.
              </div>
            </div>
            <div className="d-flex gap-2">
              <span className="badge rounded-pill text-bg-light border align-self-center">
                Progress {Math.round(lessonProgress.progressPct)}%
              </span>
              <Link to="/lessons/risk-management" className="btn btn-outline-secondary">
                Back to Lesson 4
              </Link>
              <button className="btn btn-outline-danger" onClick={resetPractice}>
                Reset Simulation
              </button>
            </div>
          </div>

          {syncing && <div className="tradeSyncInfo mb-3">Syncing practice account...</div>}
          {syncError && <div className="tradeSyncError mb-3">{syncError}</div>}

          <div className="tradeCard mb-3">
            <div className="tradeCardHead">
              <div>
                <div className="fw-bold">Watchlist Company Information</div>
                <div className="small text-muted">
                  Company, sector, exchange, and region details before you trade.
                </div>
              </div>
              <div className="small text-muted">Live refresh: {lastTick}</div>
            </div>

            <div className="row g-2 mb-2">
              <div className="col-12 col-md-8">
                <input
                  className="form-control form-control-sm"
                  placeholder="Search symbol, company, sector, exchange..."
                  value={directoryQuery}
                  onChange={(e) => setDirectoryQuery(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <select
                  className="form-select form-select-sm"
                  value={directoryRegion}
                  onChange={(e) => setDirectoryRegion(e.target.value)}
                >
                  {directoryRegions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tradeDirectory">
              {directoryRows.map((q) => (
                <div key={q.sym} className="tradeDirectoryRow">
                  <div>
                    <div className="tradeSym">{q.sym}</div>
                    <div className="tradeSub">{q.name}</div>
                  </div>
                  <div className="small">
                    <div className="fw-semibold">{q.sector}</div>
                    <div className="text-muted">{q.exchange} • {q.region}</div>
                  </div>
                  <div className="small text-muted">{q.hq}</div>
                  <div>
                    <div className="tradePrice">{fmtGBP(q.price)}</div>
                    <div className={`tradeChange ${q.chgPct >= 0 ? "up" : "down"}`}>
                      {q.chgPct >= 0 ? "+" : ""}
                      {q.chgPct.toFixed(2)}%
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-1 justify-content-end">
                    <button
                      type="button"
                      className={`btn btn-sm ${watchlistSymbols.includes(q.sym) ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => toggleWatchlist(q.sym)}
                    >
                      {watchlistSymbols.includes(q.sym) ? "Watching" : "Watch"}
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${portfolioPicks.includes(q.sym) ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => togglePortfolioPick(q.sym)}
                    >
                      {portfolioPicks.includes(q.sym) ? "In Portfolio" : "Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="row g-3 mb-3">
            <MetricCard label="Cash" value={fmtGBP(cash)} tone="blue" />
            <MetricCard label="Market Value" value={fmtGBP(portfolio.marketValue)} tone="indigo" />
            <MetricCard label="Equity" value={fmtGBP(portfolio.equity)} tone="green" />
            <MetricCard
              label="Unrealized P/L"
              value={fmtGBP(portfolio.unrealized)}
              tone={portfolio.unrealized >= 0 ? "green" : "red"}
            />
            <MetricCard
              label="Realized P/L"
              value={fmtGBP(realized)}
              tone={realized >= 0 ? "green" : "red"}
            />
            <MetricCard
              label="Model Portfolio Day P/L"
              value={fmtGBP(modelPortfolio.dayPnl)}
              tone={modelPortfolio.dayPnl >= 0 ? "green" : "red"}
            />
          </div>

          <div className="row g-3">
            <div className="col-12 col-xl-7">
              <div className="tradeCard">
                <div className="tradeCardHead">
                  <div className="fw-bold">Live Watchlist</div>
                  <div className="small text-muted">Prices update every ~1.3s</div>
                </div>
                <div className="tradeTable">
                  {watchlistQuotes.map((q) => (
                    <button
                      key={q.sym}
                      type="button"
                      className={`tradeRowBtn ${selected === q.sym ? "isActive" : ""}`}
                      onClick={() => setSelected(q.sym)}
                    >
                      <div>
                        <div className="tradeSym">{q.sym}</div>
                        <div className="tradeSub">{q.name}</div>
                      </div>
                      <div>
                        <div className="tradePrice">{fmtGBP(q.price)}</div>
                        <div className={`tradeChange ${q.chgPct >= 0 ? "up" : "down"}`}>
                          {q.chgPct >= 0 ? "+" : ""}
                          {q.chgPct.toFixed(2)}%
                        </div>
                      </div>
                      <div className="tradeRange">
                        H: {fmtGBP(q.high)} | L: {fmtGBP(q.low)}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="small text-muted mt-3 mb-1">Choose watchlist symbols</div>
                <div className="tradeChipWrap">
                  {quotes.map((q) => (
                    <button
                      key={q.sym}
                      type="button"
                      className={`tradeChip ${watchlistSymbols.includes(q.sym) ? "isOn" : ""}`}
                      onClick={() => toggleWatchlist(q.sym)}
                    >
                      {q.sym}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tradeCard mt-3">
                <div className="tradeCardHead">
                  <div className="fw-bold">Market Graph</div>
                  <div className="small text-muted">Compare selected symbols</div>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small mb-1">Primary</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedQuote?.sym || ""}
                      onChange={(e) => setSelected(e.target.value)}
                    >
                      {watchlistQuotes.map((q) => (
                        <option key={q.sym} value={q.sym}>
                          {q.sym}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small mb-1">Compare</label>
                    <select
                      className="form-select form-select-sm"
                      value={compare || ""}
                      onChange={(e) => setCompare(e.target.value)}
                    >
                      <option value="">None</option>
                      {watchlistQuotes
                        .filter((q) => q.sym !== selectedQuote?.sym)
                        .map((q) => (
                          <option key={q.sym} value={q.sym}>
                            {q.sym}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <MarketCompareChart primary={selectedQuote} compare={compareQuote} />
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <span className="tradeMiniBadge primary">
                    {selectedQuote?.sym}: {selectedQuote?.chgPct >= 0 ? "+" : ""}
                    {selectedQuote?.chgPct?.toFixed(2)}%
                  </span>
                  {compareQuote && (
                    <span className="tradeMiniBadge compare">
                      {compareQuote.sym}: {compareQuote.chgPct >= 0 ? "+" : ""}
                      {compareQuote.chgPct.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="tradeCard mt-3">
                <div className="tradeCardHead">
                  <div className="fw-bold">Open Positions</div>
                  <div className="small text-muted">Holdings in this simulation account</div>
                </div>
                {positions.length === 0 ? (
                  <div className="text-muted small">No open positions yet.</div>
                ) : (
                  <div className="tradePosList">
                    {positions.map((p) => {
                      const mark = quoteMap[p.sym] || 0;
                      const pnl = (mark - p.avg) * p.qty;
                      return (
                        <div key={p.sym} className="tradePosRow">
                          <div className="tradeSym">{p.sym}</div>
                          <div className="small text-muted">{p.qty} shares</div>
                          <div className="small">Avg: {fmtGBP(p.avg)}</div>
                          <div className="small">Mark: {fmtGBP(mark)}</div>
                          <div className={`small fw-semibold ${pnl >= 0 ? "text-success" : "text-danger"}`}>
                            {pnl >= 0 ? "+" : ""}
                            {fmtGBP(pnl)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="tradeCard">
                <div className="tradeCardHead">
                  <div className="fw-bold">Order Ticket</div>
                  <div className="small text-muted">Selected: {selectedQuote?.sym}</div>
                </div>

                <div className="small text-muted mb-2">
                  Bid {fmtGBP(bestBid)} | Ask {fmtGBP(bestAsk)}
                </div>

                <div className="d-flex gap-2 mb-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${side === "buy" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setSide("buy")}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${side === "sell" ? "btn-danger" : "btn-outline-danger"}`}
                    onClick={() => setSide("sell")}
                  >
                    Sell
                  </button>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small mb-1">Order Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                    >
                      <option value="market">Market</option>
                      <option value="limit">Limit</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control form-control-sm"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                    />
                  </div>
                  {orderType === "limit" && (
                    <div className="col-12">
                      <label className="form-label small mb-1">Limit Price (GBP)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="col-12">
                    <label className="form-label small mb-1">Execution Slippage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      className="form-control form-control-sm"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                    />
                  </div>
                </div>

                <button className="btn btn-dark w-100 mt-3" onClick={executeOrder}>
                  Place {side === "buy" ? "Buy" : "Sell"} Order
                </button>
              </div>

              <div className="tradeCard mt-3">
                <div className="tradeCardHead">
                  <div className="fw-bold">Model Portfolio Chooser</div>
                  <div className="small text-muted">Equal weight basket</div>
                </div>

                <div className="tradeChipWrap">
                  {quotes.map((q) => (
                    <button
                      key={q.sym}
                      type="button"
                      className={`tradeChip ${portfolioPicks.includes(q.sym) ? "isOn" : ""}`}
                      onClick={() => togglePortfolioPick(q.sym)}
                    >
                      {q.sym}
                    </button>
                  ))}
                </div>

                <div className="small text-muted mt-2">
                  Symbols: {modelPortfolio.count} | Equal weight: {modelPortfolio.equalWeight.toFixed(1)}% each
                </div>
                <div className={`small fw-semibold mt-1 ${modelPortfolio.avgMove >= 0 ? "text-success" : "text-danger"}`}>
                  Avg move today: {modelPortfolio.avgMove >= 0 ? "+" : ""}
                  {modelPortfolio.avgMove.toFixed(2)}% ({fmtGBP(modelPortfolio.dayPnl)} on {fmtGBP(MODEL_CAPITAL)})
                </div>
              </div>

              <div className="tradeCard mt-3">
                <div className="tradeCardHead">
                  <div className="fw-bold">Trade Log</div>
                  <div className="small text-muted">Latest 40 events</div>
                </div>
                {trades.length === 0 ? (
                  <div className="text-muted small">No trades yet.</div>
                ) : (
                  <div className="tradeLog">
                    {trades.map((t) => (
                      <div key={t.id} className="tradeLogItem">
                        <div className="small fw-semibold">
                          {t.time} | {t.side.toUpperCase()} {t.qty} {t.sym}
                        </div>
                        <div className="small text-muted">
                          {t.type.toUpperCase()} @ {fmtGBP(t.price)} | {t.status}
                        </div>
                        {typeof t.pnl === "number" && (
                          <div className={`small fw-semibold ${t.pnl >= 0 ? "text-success" : "text-danger"}`}>
                            Realized P/L: {t.pnl >= 0 ? "+" : ""}
                            {fmtGBP(t.pnl)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="tradeCard mt-3">
                <div className="tradeCardHead">
                  <div className="fw-bold">Portfolio Breakdown & Results</div>
                  <div className="small text-muted">What you bought, sold, profited, and lost</div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <PortfolioPieChart slices={analytics.holdingSlices} total={analytics.holdingsTotal} />
                  </div>
                  <div className="col-12">
                    <div className="tradeAnalyticsGrid">
                      <AnalyticsItem label="Total Buy Value" value={fmtGBP(analytics.totalBuyValue)} tone="neutral" />
                      <AnalyticsItem label="Total Sell Value" value={fmtGBP(analytics.totalSellValue)} tone="neutral" />
                      <AnalyticsItem label="Bought Shares" value={String(analytics.totalBoughtShares)} tone="neutral" />
                      <AnalyticsItem label="Sold Shares" value={String(analytics.totalSoldShares)} tone="neutral" />
                      <AnalyticsItem label="Realized Profit" value={fmtGBP(analytics.realizedProfit)} tone="positive" />
                      <AnalyticsItem label="Realized Loss" value={fmtGBP(analytics.realizedLoss)} tone="negative" />
                      <AnalyticsItem
                        label="Net Realized Result"
                        value={fmtGBP(analytics.netRealized)}
                        tone={analytics.netRealized >= 0 ? "positive" : "negative"}
                      />
                      <AnalyticsItem
                        label="Win Rate"
                        value={`${analytics.winRate.toFixed(1)}% (${analytics.closedCount})`}
                        tone={analytics.winRate >= 50 ? "positive" : "negative"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {toast && <div className="tradeToast">{toast}</div>}

      <style>{`
        .tradePage{
          background:
            radial-gradient(circle at 10% 10%, rgba(37,99,235,0.12), transparent 42%),
            radial-gradient(circle at 90% 90%, rgba(34,197,94,0.10), transparent 45%),
            linear-gradient(180deg, #f8fbff 0%, #eef4ff 52%, #ffffff 100%);
          min-height: 78vh;
        }
        .tradeBadge{
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .4px;
          color: #1d4ed8;
          background: rgba(37,99,235,0.10);
          border: 1px solid rgba(37,99,235,0.2);
        }
        .tradeCard{
          border-radius: 18px;
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.9);
          box-shadow: 0 14px 36px rgba(15,23,42,0.07);
          padding: 14px;
        }
        .tradeCardHead{
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: baseline;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .tradeTable{
          display: grid;
          gap: 8px;
        }
        .tradeDirectory{
          display: grid;
          gap: 8px;
          max-height: 360px;
          overflow: auto;
        }
        .tradeDirectoryRow{
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          background: rgba(15,23,42,0.02);
          padding: 10px;
          display: grid;
          grid-template-columns: 1.1fr 1.2fr 1.1fr auto auto;
          align-items: center;
          gap: 10px;
        }
        .tradeRowBtn{
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          background: rgba(15,23,42,0.02);
          padding: 10px;
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          align-items: center;
          text-align: left;
        }
        .tradeRowBtn.isActive{
          border-color: rgba(37,99,235,0.28);
          background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(255,255,255,0.95));
        }
        .tradeSym{ font-weight: 900; color: #0f172a; }
        .tradeSub{ font-size: 12px; color: rgba(15,23,42,0.56); }
        .tradePrice{ font-weight: 800; color: #0f172a; text-align: right; }
        .tradeChange{ font-size: 12px; font-weight: 900; text-align: right; }
        .tradeChange.up{ color: #198754; }
        .tradeChange.down{ color: #dc3545; }
        .tradeRange{ font-size: 12px; color: rgba(15,23,42,0.56); text-align: right; }
        .tradeChipWrap{
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tradeChip{
          border: 1px solid rgba(15,23,42,0.10);
          background: rgba(15,23,42,0.03);
          color: rgba(15,23,42,0.74);
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 800;
        }
        .tradeChip.isOn{
          border-color: rgba(37,99,235,0.25);
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
        }
        .tradeMiniBadge{
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 800;
        }
        .tradeMiniBadge.primary{
          background: rgba(37,99,235,0.10);
          color: #1d4ed8;
          border-color: rgba(37,99,235,0.20);
        }
        .tradeMiniBadge.compare{
          background: rgba(220,53,69,0.10);
          color: #b42318;
          border-color: rgba(220,53,69,0.20);
        }
        .tradePosList{ display: grid; gap: 8px; }
        .tradePosRow{
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          background: rgba(15,23,42,0.02);
          padding: 10px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          align-items: center;
        }
        .tradeLog{ display: grid; gap: 8px; max-height: 260px; overflow: auto; }
        .tradeLogItem{
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          background: rgba(15,23,42,0.02);
          padding: 10px;
        }
        .tradeAnalyticsGrid{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .tradeAnalyticsItem{
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          padding: 10px;
          background: rgba(15,23,42,0.02);
        }
        .tradeAnalyticsItem.pos{
          border-color: rgba(34,197,94,0.25);
          background: rgba(34,197,94,0.08);
        }
        .tradeAnalyticsItem.neg{
          border-color: rgba(220,53,69,0.25);
          background: rgba(220,53,69,0.08);
        }
        .tradePieWrap{
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 14px;
          background: rgba(255,255,255,0.76);
          padding: 12px;
        }
        .tradePieLegend{
          margin-top: 8px;
          display: grid;
          gap: 6px;
          max-height: 180px;
          overflow: auto;
        }
        .tradePieRow{
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 10px;
          padding: 6px 8px;
          background: rgba(15,23,42,0.02);
        }
        .tradeToast{
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 2000;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,0.12);
          background: rgba(255,255,255,0.92);
          box-shadow: 0 20px 50px rgba(15,23,42,0.18);
          padding: 10px 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .tradeSvgWrap{
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(37,99,235,0.08), rgba(255,255,255,0.65));
          overflow: hidden;
        }
        .tradeLegend{
          display: flex;
          gap: 14px;
          align-items: center;
          font-size: 12px;
          color: rgba(15,23,42,0.7);
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .tradeLegendDot{
          width: 10px;
          height: 10px;
          border-radius: 999px;
          display: inline-block;
          margin-right: 6px;
        }
        .tradeSyncInfo,
        .tradeSyncError{
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 800;
        }
        .tradeSyncInfo{
          color: #1e3a8a;
          border: 1px solid rgba(37,99,235,0.22);
          background: rgba(37,99,235,0.08);
        }
        .tradeSyncError{
          color: #991b1b;
          border: 1px solid rgba(220,53,69,0.22);
          background: rgba(220,53,69,0.10);
        }
        @media (max-width: 768px){
          .tradeAnalyticsGrid{
            grid-template-columns: 1fr;
          }
          .tradeDirectoryRow{
            grid-template-columns: 1fr;
          }
          .tradePosRow{
            grid-template-columns: 1fr 1fr;
          }
          .tradeRowBtn{
            grid-template-columns: 1fr 1fr;
          }
          .tradeRange{
            grid-column: 1 / -1;
            text-align: left;
          }
        }
      `}</style>

      <Footer />
    </>
  );
}

function MarketCompareChart({ primary, compare }) {
  const W = 760;
  const H = 250;
  const padX = 28;
  const padY = 20;

  const primarySeries = primary?.history || [];
  const compareSeries = compare?.history || [];

  const toPctSeries = (arr) => {
    if (!arr || arr.length === 0) return [];
    const first = arr[0] || 1;
    return arr.map((v) => ((v - first) / first) * 100);
  };

  const p1 = toPctSeries(primarySeries);
  const p2 = toPctSeries(compareSeries);
  const all = [...p1, ...p2];
  const min = all.length ? Math.min(...all) : -1;
  const max = all.length ? Math.max(...all) : 1;
  const pad = Math.max(0.35, (max - min) * 0.12);
  const yMin = min - pad;
  const yMax = max + pad;

  const scaleX = (i, len) => {
    if (len <= 1) return padX;
    return padX + (i * (W - padX * 2)) / (len - 1);
  };

  const scaleY = (v) => {
    if (yMax === yMin) return H / 2;
    return padY + ((yMax - v) * (H - padY * 2)) / (yMax - yMin);
  };

  const buildPath = (arr) => {
    if (!arr.length) return "";
    let d = "";
    arr.forEach((v, i) => {
      const x = scaleX(i, arr.length);
      const y = scaleY(v);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  };

  return (
    <div className="tradeSvgWrap">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="250">
        {[0, 1, 2, 3, 4].map((idx) => {
          const y = padY + (idx * (H - padY * 2)) / 4;
          const label = (yMax - (idx * (yMax - yMin)) / 4).toFixed(2);
          return (
            <g key={idx}>
              <line
                x1={padX}
                y1={y}
                x2={W - padX}
                y2={y}
                stroke="rgba(15,23,42,0.08)"
                strokeWidth="1"
              />
              <text x={6} y={y + 4} fontSize="10" fill="rgba(15,23,42,0.56)">
                {label}%
              </text>
            </g>
          );
        })}

        <path
          d={buildPath(p1)}
          fill="none"
          stroke="rgba(37,99,235,0.95)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {p2.length > 0 && (
          <path
            d={buildPath(p2)}
            fill="none"
            stroke="rgba(220,53,69,0.95)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      <div className="tradeLegend px-3 pb-2">
        <span><span className="tradeLegendDot" style={{ background: "rgba(37,99,235,0.95)" }} />{primary?.sym || "-"}</span>
        {compare ? (
          <span><span className="tradeLegendDot" style={{ background: "rgba(220,53,69,0.95)" }} />{compare.sym}</span>
        ) : (
          <span className="text-muted">Select compare symbol for side-by-side view</span>
        )}
      </div>
    </div>
  );
}

function PortfolioPieChart({ slices, total }) {
  const size = 210;
  const cx = size / 2;
  const cy = size / 2;
  const r = 66;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="tradePieWrap h-100">
      <div className="fw-semibold mb-2">Current Holdings Allocation</div>
      {slices.length === 0 ? (
        <div className="small text-muted">No holdings yet. Buy shares to see allocation pie chart.</div>
      ) : (
        <>
          <div className="d-flex justify-content-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(15,23,42,0.10)"
                strokeWidth="22"
              />
              {slices.map((s) => {
                const segment = (s.pct / 100) * c;
                const node = (
                  <circle
                    key={s.sym}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="22"
                    strokeLinecap="butt"
                    strokeDasharray={`${segment} ${c - segment}`}
                    strokeDashoffset={-offset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                  />
                );
                offset += segment;
                return node;
              })}
              <circle cx={cx} cy={cy} r="44" fill="#fff" />
              <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="rgba(15,23,42,0.55)">
                Holdings
              </text>
              <text x={cx} y={cy + 14} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
                {fmtGBP(total)}
              </text>
            </svg>
          </div>

          <div className="tradePieLegend">
            {slices.map((s) => (
              <div key={s.sym} className="tradePieRow">
                <div className="d-flex align-items-center gap-2">
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      display: "inline-block",
                      background: s.color,
                    }}
                  />
                  <span className="small fw-semibold">{s.sym}</span>
                </div>
                <div className="small text-muted">{s.pct.toFixed(1)}%</div>
                <div className="small fw-semibold">{fmtGBP(s.value)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AnalyticsItem({ label, value, tone = "neutral" }) {
  const cls = tone === "positive" ? "tradeAnalyticsItem pos" : tone === "negative" ? "tradeAnalyticsItem neg" : "tradeAnalyticsItem";
  return (
    <div className={cls}>
      <div className="small text-muted">{label}</div>
      <div className="fw-semibold">{value}</div>
    </div>
  );
}

function MetricCard({ label, value, tone = "blue" }) {
  const bgMap = {
    blue: "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(255,255,255,0.95))",
    indigo: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(255,255,255,0.95))",
    green: "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,0.95))",
    red: "linear-gradient(135deg, rgba(220,53,69,0.10), rgba(255,255,255,0.95))",
  };

  return (
    <div className="col-12 col-sm-6 col-xl">
      <div
        className="rounded-4 p-3 h-100"
        style={{
          border: "1px solid rgba(15,23,42,0.08)",
          background: bgMap[tone] || bgMap.blue,
          boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
        }}
      >
        <div className="small text-muted fw-semibold">{label}</div>
        <div className="fw-bold fs-5">{value}</div>
      </div>
    </div>
  );
}
