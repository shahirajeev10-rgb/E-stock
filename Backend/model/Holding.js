const mongoose = require("mongoose");
const holdingSchema = require("../schemas/HoldingSchema");

const Holding = mongoose.models.Holding || mongoose.model("Holding", holdingSchema);

module.exports = Holding;
