const SupportTicket = require("../model/SupportTicket");
const User = require("../model/User");
const { getSessionUserId } = require("../utils/sessionAuth");
const { validateUserId } = require("../utils/requestUser");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function sanitizeTicket(ticket) {
  return {
    id: String(ticket._id),
    user: ticket.user ? String(ticket.user) : null,
    name: ticket.name,
    email: ticket.email,
    topic: ticket.topic,
    message: ticket.message,
    status: ticket.status,
    responseMessage: ticket.responseMessage || "",
    responseBy: ticket.responseBy ? String(ticket.responseBy) : null,
    responseAt: ticket.responseAt || null,
    resolvedAt: ticket.resolvedAt || null,
    closedAt: ticket.closedAt || null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

function buildSummary(tickets = []) {
  return {
    count: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
    resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    closed: tickets.filter((ticket) => ticket.status === "closed").length,
  };
}

async function getAuthenticatedUser(req) {
  const sessionUserId = getSessionUserId(req);

  if (!sessionUserId || !validateUserId(sessionUserId)) {
    return {
      ok: false,
      status: 401,
      message: "Not authenticated.",
      user: null,
    };
  }

  const user = await User.findById(sessionUserId).select(
    "_id name email role"
  );

  if (!user) {
    return {
      ok: false,
      status: 401,
      message: "Session expired. Please log in again.",
      user: null,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "",
    user,
  };
}

async function createTicket(req, res) {
  try {
    const body = req.body || {};
    const auth = await getAuthenticatedUser(req);
    const user = auth.ok ? auth.user : null;

    const name = String(body.name || user?.name || "").trim();
    const email = normalizeEmail(body.email || user?.email || "");
    const topic = String(body.topic || "Other").trim();
    const message = String(body.message || "").trim();

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        ok: false,
        message: "Name must be between 2 and 80 characters.",
      });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        ok: false,
        message: "Valid email is required.",
      });
    }

    if (message.length < 10 || message.length > 2000) {
      return res.status(400).json({
        ok: false,
        message: "Message must be between 10 and 2000 characters.",
      });
    }

    const allowedTopics = [
      "Lesson Access",
      "Dashboard Issue",
      "Account Login",
      "Simulation / Demo",
      "Other",
    ];

    if (!allowedTopics.includes(topic)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid support topic.",
      });
    }

    const ticket = await SupportTicket.create({
      user: user?._id || null,
      name,
      email,
      topic,
      message,
      status: "open",
    });

    return res.status(201).json({
      ok: true,
      message: "Support ticket created.",
      data: sanitizeTicket(ticket),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

async function listMyTickets(req, res) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.ok) {
      return res.status(401).json({
        ok: false,
        message: auth.message,
      });
    }

    const tickets = await SupportTicket.find({ user: auth.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      ok: true,
      data: tickets.map(sanitizeTicket),
      summary: buildSummary(tickets),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

async function listTickets(req, res) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.ok) {
      return res.status(auth.status).json({
        ok: false,
        message: auth.message,
      });
    }

    if (auth.user.role !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Admin access required.",
      });
    }

    const filter = {};
    if (req.query.status) {
      filter.status = String(req.query.status).trim().toLowerCase();
    }

    const tickets = await SupportTicket.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    return res.json({
      ok: true,
      data: tickets.map(sanitizeTicket),
      summary: buildSummary(tickets),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

async function getTicket(req, res) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.ok) {
      return res.status(auth.status).json({
        ok: false,
        message: auth.message,
      });
    }

    const ticket = await SupportTicket.findById(req.params.id).lean();
    if (!ticket) {
      return res.status(404).json({
        ok: false,
        message: "Support ticket not found.",
      });
    }

    const isOwner =
      ticket.user && String(ticket.user) === String(auth.user._id);
    const isAdmin = auth.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        ok: false,
        message: "You do not have access to this ticket.",
      });
    }

    return res.json({
      ok: true,
      data: sanitizeTicket(ticket),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

async function updateTicket(req, res) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.ok) {
      return res.status(auth.status).json({
        ok: false,
        message: auth.message,
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        ok: false,
        message: "Support ticket not found.",
      });
    }

    const isOwner =
      ticket.user && String(ticket.user) === String(auth.user._id);
    const isAdmin = auth.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        ok: false,
        message: "You do not have access to update this ticket.",
      });
    }

    const nextStatus = String(req.body?.status || "").trim().toLowerCase();
    const responseMessage =
      req.body?.responseMessage === undefined
        ? ticket.responseMessage || ""
        : String(req.body.responseMessage || "").trim();

    const ownerAllowedStatuses = ["open", "closed"];
    const adminAllowedStatuses = ["open", "in_progress", "resolved", "closed"];

    if (nextStatus) {
      const allowedStatuses = isAdmin
        ? adminAllowedStatuses
        : ownerAllowedStatuses;

      if (!allowedStatuses.includes(nextStatus)) {
        return res.status(400).json({
          ok: false,
          message: `Status must be one of: ${allowedStatuses.join(", ")}.`,
        });
      }

      ticket.status = nextStatus;

      if (nextStatus === "resolved") {
        ticket.resolvedAt = ticket.resolvedAt || new Date();
      }

      if (nextStatus === "closed") {
        ticket.closedAt = new Date();
      }

      if (nextStatus === "open") {
        ticket.closedAt = null;
        if (!isAdmin) {
          ticket.resolvedAt = null;
        }
      }
    }

    if (isAdmin && responseMessage !== ticket.responseMessage) {
      ticket.responseMessage = responseMessage;
      ticket.responseBy = auth.user._id;
      ticket.responseAt = responseMessage ? new Date() : null;
    }

    await ticket.save();

    return res.json({
      ok: true,
      message: "Support ticket updated.",
      data: sanitizeTicket(ticket),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

module.exports = {
  createTicket,
  listTickets,
  listMyTickets,
  getTicket,
  updateTicket,
};
