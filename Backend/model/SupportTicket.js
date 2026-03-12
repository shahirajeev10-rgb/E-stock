const mongoose = require("mongoose");
const supportTicketSchema = require("../schemas/SupportTicketSchema");

const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model("SupportTicket", supportTicketSchema);

module.exports = SupportTicket;
