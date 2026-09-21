import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createTicket } from "../api/tickets";

const PRIORITY_VALUES = ["low", "medium", "high", "urgent"];

const INITIAL_FORM = {
  subject: "",
  description: "",
  priority: "medium",
  requester_name: "",
  requester_email: "",
};

export default function CustomerTicketForm() {
  const { t } = useTranslation();
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
      setErrors(err.data || { detail: t("customerForm.genericError") });
    } finally {
      setSubmitting(false);
    }
  }

  if (createdTicket) {
    const trackingLink = `${window.location.origin}/t/${createdTicket.public_id}`;
    return (
      <div className="page page-narrow">
        <h1>{t("customerForm.thanksTitle")}</h1>
        <p>{t("customerForm.createdMessage")}</p>
        <p>
          <Link to={`/t/${createdTicket.public_id}`} className="cta-button">
            {t("customerForm.viewTicketLink")}
          </Link>
        </p>
        <p className="meta">{t("customerForm.saveLink", { link: trackingLink })}</p>
        <button type="button" onClick={() => setCreatedTicket(null)}>
          {t("customerForm.submitAnother")}
        </button>
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>{t("customerForm.title")}</h1>
        <Link to="/agent/login" className="link-muted">
          {t("customerForm.agentAccess")}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label>
          {t("customerForm.yourName")}
          <input
            name="requester_name"
            value={form.requester_name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          {t("customerForm.yourEmail")}
          <input
            type="email"
            name="requester_email"
            value={form.requester_email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          {t("customerForm.subject")}
          <input name="subject" value={form.subject} onChange={handleChange} required />
        </label>

        <label>
          {t("customerForm.description")}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            required
          />
        </label>

        <label>
          {t("customerForm.priority")}
          <select name="priority" value={form.priority} onChange={handleChange}>
            {PRIORITY_VALUES.map((value) => (
              <option key={value} value={value}>
                {t(`priority.${value}`)}
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
          {submitting ? t("customerForm.submitting") : t("customerForm.submit")}
        </button>
      </form>
    </div>
  );
}
