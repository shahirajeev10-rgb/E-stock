export const LESSON_CATALOG = [
  {
    lessonKey: "fundamentals",
    title: "Lesson 1: Fundamentals",
    desc: "Candles, trend, support/resistance — the basics you’ll use every day.",
    tag: "Beginner",
    time: "12 min",
    to: "/lessons/fundamentals",
    order: 1,
  },
  {
    lessonKey: "price-movement",
    title: "Lesson 2: Price Movement",
    desc: "Supply & demand, momentum, and why price moves.",
    tag: "Core",
    time: "15 min",
    to: "/lessons/price-movement",
    order: 2,
  },
  {
    lessonKey: "profit-loss-portfolio",
    title: "Lesson 3: Profit, Loss & Portfolio",
    desc: "Read day P/L, unrealized P/L, allocation and position sizing.",
    tag: "Core",
    time: "18 min",
    to: "/lessons/profit-loss-portfolio",
    order: 3,
  },
  {
    lessonKey: "risk-management",
    title: "Lesson 4: Risk Management",
    desc: "Position sizing, stop-loss discipline, and reward-to-risk framework.",
    tag: "Safety",
    time: "16 min",
    to: "/lessons/risk-management",
    order: 4,
  },
  {
    lessonKey: "trading-simulator",
    title: "Trading Simulation Practice",
    desc: "Practice with a demo account, watchlist, and live trade log.",
    tag: "Practice",
    time: "Open lab",
    to: "/practice/simulator",
    order: 5,
  },
];

export function buildLessonProgressLookup(progressItems = []) {
  return Object.fromEntries(progressItems.map((item) => [item.lessonKey, item]));
}
