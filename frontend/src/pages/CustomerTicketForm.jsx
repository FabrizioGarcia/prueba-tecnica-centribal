import { useState } from "react";
import { Link } from "react-router-dom";
import { createTicket } from "../api/tickets";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const INITIAL_FORM = {
  subject: "",
  description: "",
  priority: "medium",
  requester_name: "",
  requester_email: "",
};

export default function CustomerTicketForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [errors, setErrors] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrors(null);

    try {
      const ticket = await createTicket(form);
      setCreatedTicket(ticket);
      setForm(INITIAL_FORM);
    } catch (err) {
      setErrors(err.data || { detail: "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  }

  if (createdTicket) {
    const trackingLink = `${window.location.origin}/t/${createdTicket.public_id}`;
    return (
      <div className="page page-narrow">
        <h1>Thanks for reaching out</h1>
        <p>Your support request has been created.</p>
        <p>
          <Link to={`/t/${createdTicket.public_id}`} className="cta-button">
            Click here to view your ticket
          </Link>
        </p>
        <p className="meta">Save this link to follow up or reply: {trackingLink}</p>
        <button type="button" onClick={() => setCreatedTicket(null)}>
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>New Support Request</h1>
        <Link to="/agent/login" className="link-muted">
          Agent access
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Your name
          <input
            name="requester_name"
            value={form.requester_name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Your email
          <input
            type="email"
            name="requester_email"
            value={form.requester_email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Subject
          <input name="subject" value={form.subject} onChange={handleChange} required />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            required
          />
        </label>

        <label>
          Priority
          <select name="priority" value={form.priority} onChange={handleChange}>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {errors && (
          <p className="form-error">
            {Object.entries(errors).map(([field, messages]) => (
              <span key={field}>
                {field}: {Array.isArray(messages) ? messages.join(", ") : String(messages)}
              </span>
            ))}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit request"}
        </button>
      </form>
    </div>
  );
}
