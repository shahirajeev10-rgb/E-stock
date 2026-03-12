const { Schema } = require("mongoose");

const holdingSchema = new Schema(
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
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    exchange: {
      type: String,
      trim: true,
      default: "",
    },
    shares: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currentPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      enum: ["GBP", "USD", "EUR", "INR"],
      default: "GBP",
    },
    sector: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

holdingSchema.index({ user: 1, symbol: 1 }, { unique: true });

holdingSchema.virtual("marketValue").get(function marketValue() {
  return Number((this.shares * this.currentPrice).toFixed(2));
});

holdingSchema.virtual("investedValue").get(function investedValue() {
  return Number((this.shares * this.avgBuyPrice).toFixed(2));
});

holdingSchema.virtual("unrealizedPnL").get(function unrealizedPnL() {
  return Number((this.marketValue - this.investedValue).toFixed(2));
});

module.exports = holdingSchema;
