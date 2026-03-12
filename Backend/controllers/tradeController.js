const mongoose = require("mongoose");
const Trade = require("../model/Trade");
const Holding = require("../model/Holding");
const { buildStarterHoldings } = require("../data/starterHoldings");
const { resolveUserId } = require("../utils/requestUser");

function toSymbol(value) {
  return String(value || "").trim().toUpperCase();
}

function toSide(value) {
  return String(value || "").trim().toUpperCase();
}

function parseNumeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round(value, digits = 6) {
  return Number(value.toFixed(digits));
}

function roundMoney(value) {
  return Number(value.toFixed(2));
}

async function listTrades(req, res) {
  try {
    const auth = resolveUserId(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    const filter = { user: userId };
    if (req.query.symbol) filter.symbol = toSymbol(req.query.symbol);
    if (req.query.side) filter.side = toSide(req.query.side);

    const limit = Math.min(Math.max(parseInt(req.query.limit || "40", 10), 1), 200);

    const trades = await Trade.find(filter)
      .sort({ executedAt: -1, _id: -1 })
      .limit(limit);

    return res.json({ ok: true, count: trades.length, data: trades });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function getTradeById(req, res) {
  try {
    const auth = resolveUserId(req);
    const { id } = req.params;

    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: "Invalid trade id." });
    }

    const trade = await Trade.findOne({ _id: id, user: userId });
    if (!trade) {
      return res.status(404).json({ ok: false, message: "Trade not found." });
    }

    return res.json({ ok: true, data: trade });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function createTrade(req, res) {
  try {
    const body = req.body || {};
    const auth = resolveUserId(req);
    const symbol = toSymbol(body.symbol);
    const side = toSide(body.side);
    const shares = parseNumeric(body.shares);
    const price = parseNumeric(body.price);
    const fees = body.fees === undefined ? 0 : parseNumeric(body.fees);
    const tax = body.tax === undefined ? 0 : parseNumeric(body.tax);

    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    if (!symbol) {
      return res.status(400).json({ ok: false, message: "symbol is required." });
    }

    if (side !== "BUY" && side !== "SELL") {
      return res.status(400).json({ ok: false, message: "side must be BUY or SELL." });
    }

    if (shares === null || shares <= 0) {
      return res.status(400).json({ ok: false, message: "shares must be greater than 0." });
    }

    if (price === null || price <= 0) {
      return res.status(400).json({ ok: false, message: "price must be greater than 0." });
    }

    if (fees === null || fees < 0 || tax === null || tax < 0) {
      return res.status(400).json({ ok: false, message: "fees and tax must be 0 or more." });
    }

    const executedAt = body.executedAt ? new Date(body.executedAt) : new Date();
    if (Number.isNaN(executedAt.getTime())) {
      return res.status(400).json({ ok: false, message: "executedAt is invalid date format." });
    }

    const currency = body.currency || "GBP";
    const companyName = body.companyName || "";
    const exchange = body.exchange || "";
    const sector = body.sector || "";
    const notes = body.notes || "";
    const strategyTag = body.strategyTag || "";

    let holding = await Holding.findOne({ user: userId, symbol });
    let realizedPnL = 0;

    if (side === "BUY") {
      const totalBuyCost = shares * price + fees + tax;
      const buyUnitCost = totalBuyCost / shares;

      if (!holding) {
        holding = await Holding.create({
          user: userId,
          symbol,
          companyName,
          exchange,
          shares: round(shares),
          avgBuyPrice: round(buyUnitCost),
          currentPrice: round(price),
          currency,
          sector,
          notes,
        });
      } else {
        const prevCost = holding.shares * holding.avgBuyPrice;
        const newCost = prevCost + totalBuyCost;
        const newShares = holding.shares + shares;

        holding.shares = round(newShares);
        holding.avgBuyPrice = round(newCost / newShares);
        holding.currentPrice = round(price);

        if (companyName) holding.companyName = companyName;
        if (exchange) holding.exchange = exchange;
        if (sector) holding.sector = sector;
        if (notes) holding.notes = notes;
        if (body.currency) holding.currency = currency;

        await holding.save();
      }
    }

    if (side === "SELL") {
      if (!holding) {
        return res
          .status(400)
          .json({ ok: false, message: `No holding found for ${symbol}. Cannot sell.` });
      }

      if (holding.shares < shares) {
        return res.status(400).json({
          ok: false,
          message: `Not enough shares to sell. Available: ${holding.shares}`,
        });
      }

      const proceedsAfterCosts = shares * price - fees - tax;
      const costBasis = shares * holding.avgBuyPrice;
      realizedPnL = roundMoney(proceedsAfterCosts - costBasis);

      const remainingShares = round(holding.shares - shares);
      if (remainingShares <= 0) {
        await Holding.deleteOne({ _id: holding._id });
      } else {
        holding.shares = remainingShares;
        holding.currentPrice = round(price);
        if (body.currency) holding.currency = currency;
        if (notes) holding.notes = notes;
        await holding.save();
      }
    }

    const trade = await Trade.create({
      user: userId,
      symbol,
      companyName: companyName || (holding ? holding.companyName : ""),
      side,
      shares,
      price,
      fees,
      tax,
      currency: currency || (holding ? holding.currency : "GBP"),
      realizedPnL,
      strategyTag,
      notes,
      executedAt,
    });

    const updatedHolding = await Holding.findOne({ user: userId, symbol });

    return res.status(201).json({
      ok: true,
      data: trade,
      holding: updatedHolding,
      message:
        side === "BUY"
          ? `BUY trade executed for ${symbol}.`
          : `SELL trade executed for ${symbol}.`,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function tradeSummary(req, res) {
  try {
    const auth = resolveUserId(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    const trades = await Trade.find({ user: userId }).sort({ executedAt: -1 });

    const totals = trades.reduce(
      (acc, t) => {
        const gross = t.shares * t.price;
        const costs = t.fees + t.tax;

        if (t.side === "BUY") {
          acc.buyTrades += 1;
          acc.buyShares += t.shares;
          acc.buyValue += gross + costs;
        } else {
          acc.sellTrades += 1;
          acc.sellShares += t.shares;
          acc.sellValue += gross - costs;
          acc.realizedPnL += t.realizedPnL || 0;
          if ((t.realizedPnL || 0) > 0) acc.wins += 1;
          if ((t.realizedPnL || 0) < 0) acc.losses += 1;
        }

        return acc;
      },
      {
        tradeCount: 0,
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

    totals.tradeCount = trades.length;

    const closedTrades = totals.wins + totals.losses;
    const winRate = closedTrades === 0 ? 0 : (totals.wins / closedTrades) * 100;

    return res.json({
      ok: true,
      summary: {
        ...totals,
        buyShares: round(totals.buyShares),
        sellShares: round(totals.sellShares),
        buyValue: roundMoney(totals.buyValue),
        sellValue: roundMoney(totals.sellValue),
        realizedPnL: roundMoney(totals.realizedPnL),
        winRate: roundMoney(winRate),
      },
      recent: trades.slice(0, 20),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function resetPracticeAccount(req, res) {
  try {
    const body = req.body || {};
    const auth = resolveUserId(req);
    const reseed = body.reseed !== false;

    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    await Promise.all([
      Trade.deleteMany({ user: userId }),
      Holding.deleteMany({ user: userId }),
    ]);

    let seeded = [];
    if (reseed) {
      seeded = await Holding.insertMany(buildStarterHoldings(userId));
    }

    return res.json({
      ok: true,
      message: reseed
        ? "Practice account reset and starter holdings restored."
        : "Practice account reset.",
      holdingsCount: seeded.length,
      data: seeded,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  listTrades,
  getTradeById,
  createTrade,
  tradeSummary,
  resetPracticeAccount,
};
