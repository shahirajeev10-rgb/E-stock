const express = require("express");
const {
  listTrades,
  getTradeById,
  createTrade,
  tradeSummary,
  resetPracticeAccount,
} = require("../controllers/tradeController");

const router = express.Router();

router.get("/", listTrades);
router.get("/summary", tradeSummary);
router.post("/", createTrade);
router.post("/reset", resetPracticeAccount);
router.get("/:id", getTradeById);

module.exports = router;
