const { Schema } = require("mongoose");

const tradeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    side: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    shares: {
      type: Number,
      required: true,
      min: 0.0001,
    },
    price: {
      type: Number,
      required: true,
      min: 0.0001,
    },
    fees: {
      type: Number,
      min: 0,
      default: 0,
    },
    tax: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      enum: ["GBP", "USD", "EUR", "INR"],
      default: "GBP",
    },
    realizedPnL: {
      type: Number,
      default: 0,
    },
    strategyTag: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    executedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

tradeSchema.virtual("grossValue").get(function grossValue() {
  return Number((this.shares * this.price).toFixed(2));
});

tradeSchema.virtual("netValue").get(function netValue() {
  return Number((this.grossValue + this.fees + this.tax).toFixed(2));
});

module.exports = tradeSchema;
