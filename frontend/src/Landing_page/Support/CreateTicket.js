import React, { useEffect, useMemo, useState } from "react";
import {
  createSupportTicket,
  fetchMySupportTickets,
  updateSupportTicket,
} from "../../api/client";
import { auth } from "../auth";

export default function CreateTicket() {
  const user = auth.getUser();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    topic: "Lesson Access",
    message: "",
  });
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myTickets, setMyTickets] = useState([]);
  const [myTicketsLoading, setMyTicketsLoading] = useState(false);
  const [myTicketsError, setMyTicketsError] = useState("");
  const [ticketActionId, setTicketActionId] = useState("");

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canLoadMine = useMemo(() => auth.isLoggedIn(), []);

  async function loadMyTickets() {
    if (!canLoadMine) return;

    try {
      setMyTicketsLoading(true);
      setMyTicketsError("");
      const res = await fetchMySupportTickets();
      setMyTickets(res?.data || []);
    } catch (err) {
      setMyTicketsError(err.message || "Unable to load your tickets.");
    } finally {
      setMyTicketsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadMine() {
      if (!canLoadMine) return;

      try {
        setMyTicketsLoading(true);
        setMyTicketsError("");
        const res = await fetchMySupportTickets();
        if (!active) return;
        setMyTickets(res?.data || []);
      } catch (err) {
        if (!active) return;
        setMyTicketsError(err.message || "Unable to load your tickets.");
      } finally {
        if (active) setMyTicketsLoading(false);
      }
    }

    loadMine();
    return () => {
      active = false;
    };
  }, [canLoadMine]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await createSupportTicket(form);
      setSubmittedTicket(res?.data || null);
      setForm((prev) => ({
        ...prev,
        message: "",
      }));

      if (canLoadMine) {
        await loadMyTickets();
      }
    } catch (err) {
      setError(err.message || "Unable to create support ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketStatus = async (ticketId, status) => {
    try {
      setTicketActionId(ticketId);
      setMyTicketsError("");
      await updateSupportTicket(ticketId, { status });
      await loadMyTickets();
    } catch (err) {
      setMyTicketsError(err.message || "Unable to update your ticket.");
    } finally {
      setTicketActionId("");
    }
  };

  return (
    <div
      id="create-ticket"
      className="bg-white rounded-4 shadow-sm p-4"
      style={{ border: "1px solid rgba(15,23,42,0.08)" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold mb-0">Create Support Ticket</h5>
        <span className="badge rounded-pill text-bg-light border">Usually replies within 24h</span>
      </div>

      {submittedTicket && (
        <div className="alert alert-success" role="alert">
          Ticket created successfully ({submittedTicket.id.slice(-6)}). We will reach you on email.
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">Topic</label>
            <select
              className="form-select"
              value={form.topic}
              onChange={(e) => onChange("topic", e.target.value)}
            >
              <option>Lesson Access</option>
              <option>Dashboard Issue</option>
              <option>Account Login</option>
              <option>Simulation / Demo</option>
              <option>Other</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Message</label>
            <textarea
              className="form-control"
              rows="4"
              value={form.message}
              onChange={(e) => onChange("message", e.target.value)}
              placeholder="Describe your issue clearly..."
              required
            />
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="btn btn-dark px-4" disabled={loading}>
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>

      {canLoadMine && (
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">My Tickets</h6>
            {myTicketsLoading && <span className="small text-muted">Loading...</span>}
          </div>
          {myTicketsError && <div className="small text-danger mb-2">{myTicketsError}</div>}
          {!myTicketsLoading && !myTickets.length && (
            <div className="small text-muted">No tickets yet.</div>
          )}
          <div className="d-grid gap-2">
            {myTickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-3 p-2"
                style={{ border: "1px solid rgba(15,23,42,0.08)", background: "rgba(15,23,42,0.02)" }}
              >
                <div className="d-flex justify-content-between align-items-center gap-2">
                  <div className="fw-semibold small">{ticket.topic}</div>
                  <span className="badge text-bg-light border">{ticket.status}</span>
                </div>
                <div className="small text-muted mt-1">
                  {ticket.message.slice(0, 90)}
                  {ticket.message.length > 90 ? "..." : ""}
                </div>
                <div className="small text-muted mt-1">
                  Created: {new Date(ticket.createdAt).toLocaleString()}
                </div>
                {ticket.responseMessage && (
                  <div
                    className="small mt-2 p-2 rounded-3"
                    style={{ background: "rgba(37,99,235,0.06)", color: "#0f172a" }}
                  >
                    <strong>Support reply:</strong> {ticket.responseMessage}
                  </div>
                )}
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {ticket.status !== "closed" ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => handleTicketStatus(ticket.id, "closed")}
                      disabled={ticketActionId === ticket.id}
                    >
                      {ticketActionId === ticket.id ? "Updating..." : "Close ticket"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleTicketStatus(ticket.id, "open")}
                      disabled={ticketActionId === ticket.id}
                    >
                      {ticketActionId === ticket.id ? "Updating..." : "Reopen"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
