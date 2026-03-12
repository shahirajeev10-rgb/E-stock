const mongoose = require("mongoose");
const Holding = require("../model/Holding");
const { buildStarterHoldings } = require("../data/starterHoldings");
const { resolveUserId } = require("../utils/requestUser");

function toSymbol(value) {
  return String(value || "").trim().toUpperCase();
}

function parseNumeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function numericSummary(holdings) {
  const investedValue = holdings.reduce(
    (acc, h) => acc + h.shares * h.avgBuyPrice,
    0
  );
  const marketValue = holdings.reduce((acc, h) => acc + h.marketValue, 0);
  const unrealizedPnL = marketValue - investedValue;
  const winners = holdings.filter((h) => h.unrealizedPnL > 0).length;
  const losers = holdings.filter((h) => h.unrealizedPnL < 0).length;

  return {
    count: holdings.length,
    investedValue: round(investedValue),
    marketValue: round(marketValue),
    unrealizedPnL: round(unrealizedPnL),
    winners,
    losers,
  };
}

async function listHoldings(req, res) {
  try {
    const auth = resolveUserId(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    const filter = { user: userId };
    if (req.query.symbol) {
      filter.symbol = toSymbol(req.query.symbol);
    }

    const holdings = await Holding.find(filter).sort({ symbol: 1 });

    return res.json({
      ok: true,
      data: holdings,
      summary: numericSummary(holdings),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function getHoldingById(req, res) {
  try {
    const auth = resolveUserId(req);
    const { id } = req.params;

    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: "Invalid holding id." });
    }

    const holding = await Holding.findOne({ _id: id, user: userId });
    if (!holding) {
      return res.status(404).json({ ok: false, message: "Holding not found." });
    }

    return res.json({ ok: true, data: holding });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function createOrAddHolding(req, res) {
  try {
    const body = req.body || {};
    const auth = resolveUserId(req);
    const symbol = toSymbol(body.symbol);
    const shares = parseNumeric(body.shares);
    const avgBuyPrice = parseNumeric(body.avgBuyPrice);
    const currentPrice =
      body.currentPrice === undefined ? undefined : parseNumeric(body.currentPrice);

    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    if (!symbol) {
      return res.status(400).json({ ok: false, message: "symbol is required." });
    }

    if (shares === null || shares <= 0) {
      return res.status(400).json({ ok: false, message: "shares must be greater than 0." });
    }

    if (avgBuyPrice === null || avgBuyPrice < 0) {
      return res.status(400).json({ ok: false, message: "avgBuyPrice must be 0 or more." });
    }

    if (currentPrice !== undefined && (currentPrice === null || currentPrice < 0)) {
      return res.status(400).json({ ok: false, message: "currentPrice must be 0 or more." });
    }

    const existing = await Holding.findOne({ user: userId, symbol });
    if (existing) {
      const totalShares = existing.shares + shares;
      const weightedAvg =
        totalShares === 0
          ? 0
          : (existing.shares * existing.avgBuyPrice + shares * avgBuyPrice) / totalShares;

      existing.shares = round(totalShares, 6);
      existing.avgBuyPrice = round(weightedAvg, 6);

      if (currentPrice !== undefined) existing.currentPrice = currentPrice;
      if (body.companyName !== undefined) existing.companyName = body.companyName;
      if (body.exchange !== undefined) existing.exchange = body.exchange;
      if (body.currency !== undefined) existing.currency = body.currency;
      if (body.sector !== undefined) existing.sector = body.sector;
      if (body.notes !== undefined) existing.notes = body.notes;

      await existing.save();
      return res.status(200).json({
        ok: true,
        message: "Existing holding updated by adding shares.",
        data: existing,
      });
    }

    const payload = {
      user: userId,
      symbol,
      shares,
      avgBuyPrice,
      companyName: body.companyName,
      exchange: body.exchange,
      currentPrice,
      currency: body.currency,
      sector: body.sector,
      notes: body.notes,
    };

    const holding = await Holding.create(payload);
    return res.status(201).json({ ok: true, data: holding });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ ok: false, message: "Holding for this symbol already exists." });
    }
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function updateHolding(req, res) {
  try {
    const body = req.body || {};
    const auth = resolveUserId(req);
    const { id } = req.params;

    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: "Invalid holding id." });
    }

    const holding = await Holding.findOne({ _id: id, user: userId });
    if (!holding) {
      return res.status(404).json({ ok: false, message: "Holding not found." });
    }

    const allowed = [
      "symbol",
      "companyName",
      "exchange",
      "shares",
      "avgBuyPrice",
      "currentPrice",
      "currency",
      "sector",
      "notes",
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "symbol") holding[key] = toSymbol(body[key]);
        else holding[key] = body[key];
      }
    }

    if (holding.shares < 0 || holding.avgBuyPrice < 0 || holding.currentPrice < 0) {
      return res.status(400).json({
        ok: false,
        message: "shares, avgBuyPrice and currentPrice must be 0 or more.",
      });
    }

    await holding.save();
    return res.json({ ok: true, data: holding });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ ok: false, message: "Holding for this symbol already exists." });
    }
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function deleteHolding(req, res) {
  try {
    const auth = resolveUserId(req);
    const { id } = req.params;

    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: "Invalid holding id." });
    }

    const deleted = await Holding.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Holding not found." });
    }

    return res.json({ ok: true, message: "Holding deleted.", data: deleted });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function seedHoldings(req, res) {
  try {
    const body = req.body || {};
    const auth = resolveUserId(req);
    const replace =
      body.replace === true ||
      req.query.replace === "true" ||
      req.query.replace === "1";

    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }
    const { userId } = auth;

    const existingCount = await Holding.countDocuments({ user: userId });
    if (existingCount > 0 && !replace) {
      return res.status(409).json({
        ok: false,
        message: "Holdings already exist. Pass replace=true to reset and seed again.",
      });
    }

    if (replace) {
      await Holding.deleteMany({ user: userId });
    }

    const payload = buildStarterHoldings(userId);
    const inserted = await Holding.insertMany(payload);

    return res.status(201).json({
      ok: true,
      message: "Starter holdings created.",
      count: inserted.length,
      data: inserted,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  listHoldings,
  getHoldingById,
  createOrAddHolding,
  updateHolding,
  deleteHolding,
  seedHoldings,
};
