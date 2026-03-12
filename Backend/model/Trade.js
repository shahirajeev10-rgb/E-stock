const mongoose = require("mongoose");
const tradeSchema = require("../schemas/TradeSchema");

const Trade = mongoose.models.Trade || mongoose.model("Trade", tradeSchema);

module.exports = Trade;
