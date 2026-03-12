const express = require("express");
const {
  listHoldings,
  getHoldingById,
  createOrAddHolding,
  updateHolding,
  deleteHolding,
  seedHoldings,
} = require("../controllers/holdingController");

const router = express.Router();

router.get("/", listHoldings);
router.post("/", createOrAddHolding);
router.post("/seed", seedHoldings);
router.get("/:id", getHoldingById);
router.patch("/:id", updateHolding);
router.delete("/:id", deleteHolding);

module.exports = router;
