const STARTER_HOLDINGS = [
  {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    exchange: "NASDAQ",
    shares: 8,
    avgBuyPrice: 182.4,
    currentPrice: 186.1,
    currency: "GBP",
    sector: "Technology",
    notes: "Starter large-cap tech",
  },
  {
    symbol: "MSFT",
    companyName: "Microsoft Corp.",
    exchange: "NASDAQ",
    shares: 6,
    avgBuyPrice: 418.8,
    currentPrice: 422.3,
    currency: "GBP",
    sector: "Technology",
    notes: "Cloud and AI exposure",
  },
  {
    symbol: "GOOGL",
    companyName: "Alphabet Inc.",
    exchange: "NASDAQ",
    shares: 5,
    avgBuyPrice: 141.5,
    currentPrice: 143.2,
    currency: "GBP",
    sector: "Communication Services",
    notes: "Ads + search leader",
  },
  {
    symbol: "TSLA",
    companyName: "Tesla Inc.",
    exchange: "NASDAQ",
    shares: 4,
    avgBuyPrice: 193.2,
    currentPrice: 191.4,
    currency: "GBP",
    sector: "Automotive",
    notes: "Higher volatility position",
  },
  {
    symbol: "HSBA",
    companyName: "HSBC Holdings",
    exchange: "LSE",
    shares: 30,
    avgBuyPrice: 6.82,
    currentPrice: 6.9,
    currency: "GBP",
    sector: "Financials",
    notes: "UK bank allocation",
  },
  {
    symbol: "SONY",
    companyName: "Sony Group Corp.",
    exchange: "NYSE",
    shares: 7,
    avgBuyPrice: 89.3,
    currentPrice: 90.6,
    currency: "GBP",
    sector: "Consumer Electronics",
    notes: "Diversification pick",
  },
];

function buildStarterHoldings(userId) {
  return STARTER_HOLDINGS.map((holding) => ({
    user: userId,
    ...holding,
  }));
}

module.exports = {
  STARTER_HOLDINGS,
  buildStarterHoldings,
};
