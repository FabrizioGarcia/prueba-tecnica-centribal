import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addPublicMessage, getPublicTicket, listPublicMessages } from "../api/public";

export default function PublicTicketView() {
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
      .catch(() => setError("We couldn't find that ticket. Check the link and try again."))
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
      .catch(() => setError("Could not refresh messages."))
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
      setError("Could not send your message, please try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="page-status">Loading...</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!ticket) return null;

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>{ticket.subject}</h1>
        <span className={`badge status-${ticket.status}`}>{ticket.status}</span>
      </div>

      <p>{ticket.description}</p>
      <p className="meta">
        Priority: <span className={`badge priority-${ticket.priority}`}>{ticket.priority}</span>
      </p>

      <section>
        <div className="section-header">
          <h2>Conversation</h2>
          <button
            type="button"
            onClick={refreshMessages}
            disabled={refreshingMessages}
            className="refresh-button"
          >
            {refreshingMessages ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <ul className="comment-list">
          {messages.map((message) => {
            const sender = message.author
              ? { type: "agent-reply", label: "Support agent" }
              : { type: "customer", label: "You" };

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
            <li className="page-status">No messages yet. An agent will reply here.</li>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="form form-inline">
          <label>
            Send a message
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
          </label>
          <button type="submit" disabled={sending || !body.trim()}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
