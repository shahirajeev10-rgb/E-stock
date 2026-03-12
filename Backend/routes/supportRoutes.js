const express = require("express");
const {
  createTicket,
  listTickets,
  listMyTickets,
  getTicket,
  updateTicket,
} = require("../controllers/supportController");

const router = express.Router();

router.get("/", listTickets);
router.post("/", createTicket);
router.get("/mine", listMyTickets);
router.get("/:id", getTicket);
router.patch("/:id", updateTicket);

module.exports = router;
