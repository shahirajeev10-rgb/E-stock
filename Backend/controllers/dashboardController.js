const User = require("../model/User");
const Holding = require("../model/Holding");
const Trade = require("../model/Trade");
const { resolveUserId } = require("../utils/requestUser");
const { sanitizeUser } = require("../utils/userView");
const { buildUserProgressSnapshot } = require("./progressController");

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function buildHoldingsSummary(holdings) {
  const investedValue = holdings.reduce(
    (sum, h) => sum + Number(h.shares || 0) * Number(h.avgBuyPrice || 0),
    0
  );
  const marketValue = holdings.reduce(
    (sum, h) => sum + Number(h.marketValue || 0),
    0
  );
  const unrealizedPnL = marketValue - investedValue;
  const winners = holdings.filter((h) => Number(h.unrealizedPnL || 0) > 0).length;
  const losers = holdings.filter((h) => Number(h.unrealizedPnL || 0) < 0).length;

  return {
    count: holdings.length,
    investedValue: roundMoney(investedValue),
    marketValue: roundMoney(marketValue),
    unrealizedPnL: roundMoney(unrealizedPnL),
    winners,
    losers,
  };
}

function buildTradeSummary(trades) {
  const totals = trades.reduce(
    (acc, trade) => {
      const shares = Number(trade.shares || 0);
      const price = Number(trade.price || 0);
      const fees = Number(trade.fees || 0);
      const tax = Number(trade.tax || 0);
      const gross = shares * price;
      const costs = fees + tax;

      if (trade.side === "BUY") {
        acc.buyTrades += 1;
        acc.buyShares += shares;
        acc.buyValue += gross + costs;
      } else {
        const realizedPnL = Number(trade.realizedPnL || 0);
        acc.sellTrades += 1;
        acc.sellShares += shares;
        acc.sellValue += gross - costs;
        acc.realizedPnL += realizedPnL;
        if (realizedPnL > 0) acc.wins += 1;
        if (realizedPnL < 0) acc.losses += 1;
      }

      return acc;
    },
    {
      tradeCount: trades.length,
      buyTrades: 0,
      sellTrades: 0,
      buyShares: 0,
      sellShares: 0,
      buyValue: 0,
      sellValue: 0,
      realizedPnL: 0,
      wins: 0,
      losses: 0,
    }
  );

  const closedTrades = totals.wins + totals.losses;
  const winRate = closedTrades > 0 ? (totals.wins / closedTrades) * 100 : 0;

  return {
    ...totals,
    buyShares: Number(totals.buyShares.toFixed(6)),
    sellShares: Number(totals.sellShares.toFixed(6)),
    buyValue: roundMoney(totals.buyValue),
    sellValue: roundMoney(totals.sellValue),
    realizedPnL: roundMoney(totals.realizedPnL),
    winRate: roundMoney(winRate),
  };
}

async function getDashboard(req, res) {
  try {
    const auth = resolveUserId(req);
    if (!auth.ok) {
      return res.status(auth.status).json({
        ok: false,
        message: auth.message,
      });
    }

    const { userId } = auth;
    const [user, holdings, trades, progressSnapshot] = await Promise.all([
      User.findById(userId),
      Holding.find({ user: userId }).sort({ symbol: 1 }),
      Trade.find({ user: userId }).sort({ executedAt: -1, _id: -1 }).limit(40),
      buildUserProgressSnapshot(userId),
    ]);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found.",
      });
    }

    const holdingsSummary = buildHoldingsSummary(holdings);
    const tradeSummary = buildTradeSummary(trades);

    return res.json({
      ok: true,
      data: {
        user: sanitizeUser(user),
        holdings: {
          data: holdings,
          summary: holdingsSummary,
        },
        trades: {
          data: trades,
          summary: tradeSummary,
        },
        progress: {
          data: progressSnapshot.merged,
          summary: progressSnapshot.summary,
        },
        meta: {
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

module.exports = {
  getDashboard,
};
