import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addPublicMessage, getPublicTicket, listPublicMessages } from "../api/public";

export default function PublicTicketView() {
  const { t } = useTranslation();
  const { publicId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);

  function loadAll() {
    setLoading(true);
    return Promise.all([getPublicTicket(publicId), listPublicMessages(publicId)])
      .then(([ticketData, messagesData]) => {
        setTicket(ticketData);
        setMessages(messagesData);
        setError(null);
      })
      .catch(() => setError(t("publicTicket.notFoundError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicId]);

  function refreshMessages() {
    setRefreshingMessages(true);
    return listPublicMessages(publicId)
      .then(setMessages)
      .catch(() => setError(t("publicTicket.refreshError")))
      .finally(() => setRefreshingMessages(false));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const message = await addPublicMessage(publicId, body);
      setMessages((prev) => [...prev, message]);
      setBody("");
    } catch {
      setError(t("publicTicket.sendError"));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="page-status">{t("common.loading")}</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!ticket) return null;

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>{ticket.subject}</h1>
        <span className={`badge status-${ticket.status}`}>{t(`status.${ticket.status}`)}</span>
      </div>

      <p>{ticket.description}</p>
      <p className="meta">
        {t("publicTicket.priorityLabel")}{" "}
        <span className={`badge priority-${ticket.priority}`}>
          {t(`priority.${ticket.priority}`)}
        </span>
      </p>

      <section>
        <div className="section-header">
          <h2>{t("publicTicket.conversation")}</h2>
          <button
            type="button"
            onClick={refreshMessages}
            disabled={refreshingMessages}
            className="refresh-button"
          >
            {refreshingMessages ? t("common.refreshing") : t("common.refresh")}
          </button>
        </div>
        <ul className="comment-list">
          {messages.map((message) => {
            const sender = message.author
              ? { type: "agent-reply", label: t("publicTicket.supportAgent") }
              : { type: "customer", label: t("publicTicket.you") };

            return (
              <li key={message.id} className={`comment-${sender.type}`}>
                <strong>{message.author_name}</strong>{" "}
                <span className={`badge badge-${sender.type}`}>{sender.label}</span>{" "}
                <span className="meta">{new Date(message.created_at).toLocaleString()}</span>
                <p>{message.body}</p>
              </li>
            );
          })}
          {messages.length === 0 && (
            <li className="page-status">{t("publicTicket.noMessages")}</li>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="form form-inline">
          <label>
            {t("publicTicket.sendMessage")}
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
          </label>
          <button type="submit" disabled={sending || !body.trim()}>
            {sending ? t("publicTicket.sending") : t("publicTicket.send")}
          </button>
        </form>
      </section>
    </div>
  );
}
