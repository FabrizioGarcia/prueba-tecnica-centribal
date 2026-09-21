import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import AgentAutocomplete from "../components/AgentAutocomplete";
import {
  addComment,
  assignTicket,
  getHistory,
  getTicket,
  listComments,
  updateTicketStatus,
} from "../api/tickets";

export default function AgentTicketDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { agent } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [assignTarget, setAssignTarget] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [taggedAgents, setTaggedAgents] = useState([]);
  const [actionError, setActionError] = useState(null);
  const [refreshingComments, setRefreshingComments] = useState(false);

  function loadAll() {
    setLoading(true);
    return Promise.all([getTicket(id), listComments(id), getHistory(id)])
      .then(([ticketData, commentsData, historyData]) => {
        setTicket(ticketData);
        setComments(commentsData);
        setHistory(historyData);
      })
      .catch(() => setError(t("agentTicketDetail.loadError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function refreshComments() {
    setRefreshingComments(true);
    return listComments(id)
      .then(setComments)
      .catch(() => setActionError(t("agentTicketDetail.refreshCommentsError")))
      .finally(() => setRefreshingComments(false));
  }

  async function handleStatusChange(newStatus) {
    setActionError(null);
    setUpdatingStatus(true);
    try {
      const updated = await updateTicketStatus(id, newStatus);
      setTicket(updated);
      const historyData = await getHistory(id);
      setHistory(historyData);
    } catch (err) {
      setActionError(
        err.data?.status?.[0] || err.data?.detail || t("agentTicketDetail.updateStatusError")
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAssignSubmit(event) {
    event.preventDefault();
    if (!assignTarget) return;
    setActionError(null);
    try {
      const updated = await assignTicket(id, assignTarget.id);
      setTicket(updated);
      setAssignTarget(null);
      const historyData = await getHistory(id);
      setHistory(historyData);
    } catch (err) {
      setActionError(
        err.data?.agent_id?.[0] || err.data?.detail || t("agentTicketDetail.assignError")
      );
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!commentBody.trim()) return;
    setActionError(null);
    try {
      const taggedIds = isInternal ? taggedAgents.map((a) => a.id) : [];
      const comment = await addComment(id, commentBody, isInternal, taggedIds);
      setComments((prev) => [...prev, comment]);
      setCommentBody("");
      setTaggedAgents([]);
    } catch (err) {
      setActionError(err.data?.detail || t("agentTicketDetail.addCommentError"));
    }
  }

  if (loading) return <p className="page-status">{t("agentTicketDetail.loadingTicket")}</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!ticket) return null;

  return (
    <div className="page">
      <Link to="/agent" className="link-muted">
        ← {t("agentTicketDetail.backToList")}
      </Link>

      <div className="page-header">
        <h1>
          #{ticket.id} {ticket.subject}
        </h1>
        <div>
          <span className={`badge priority-${ticket.priority}`}>
            {t(`priority.${ticket.priority}`)}
          </span>
          <span className={`badge status-${ticket.status}`}>{t(`status.${ticket.status}`)}</span>
          <button type="button" onClick={loadAll} className="refresh-button">
            {t("common.refresh")}
          </button>
        </div>
      </div>

      <p>{ticket.description}</p>
      <p className="meta">
        {t("agentTicketDetail.requestedBy", {
          name: ticket.requester_name,
          email: ticket.requester_email,
        })}
      </p>
      <p className="meta">
        {t("agentTicketDetail.assignedTo", {
          agent: ticket.assigned_agent?.username || t("agentTicketDetail.unassigned"),
        })}
      </p>
      {!ticket.assigned_agent && (
        <p className="meta">{t("agentTicketDetail.unlockHint")}</p>
      )}

      {actionError && <p className="form-error">{actionError}</p>}

      <section>
        <div className="section-header">
          <h2>{t("agentTicketDetail.assignment")}</h2>
        </div>
        <div className="assign-card">
          <form onSubmit={handleAssignSubmit} className="form form-inline assign-form">
            <AgentAutocomplete
              selected={assignTarget}
              onSelect={setAssignTarget}
              onRemove={() => setAssignTarget(null)}
              placeholder={t("agentTicketDetail.searchByUsername")}
            />
            <button type="submit" disabled={!assignTarget}>
              {t("agentTicketDetail.assign")}
            </button>
          </form>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>{t("agentTicketDetail.commentsAndConversation")}</h2>
          <button
            type="button"
            onClick={refreshComments}
            disabled={refreshingComments}
            className="refresh-button"
          >
            {refreshingComments ? t("common.refreshing") : t("common.refresh")}
          </button>
        </div>
        <ul className="comment-list">
          {comments.map((comment) => {
            const sender = !comment.author
              ? { type: "customer", label: t("agentTicketDetail.customer") }
              : comment.is_internal
              ? { type: "internal", label: t("agentTicketDetail.internal") }
              : { type: "agent-reply", label: t("agentTicketDetail.agentReply") };

            return (
              <li key={comment.id} className={`comment-${sender.type}`}>
                <strong>{comment.author_name}</strong>{" "}
                <span className={`badge badge-${sender.type}`}>{sender.label}</span>{" "}
                {comment.tagged_agents?.map((tagged) => (
                  <span key={tagged.id} className="badge badge-tag">
                    @{tagged.username}
                  </span>
                ))}{" "}
                <span className="meta">{new Date(comment.created_at).toLocaleString()}</span>
                <p>{comment.body}</p>
              </li>
            );
          })}
          {comments.length === 0 && (
            <li className="page-status">{t("agentTicketDetail.noCommentsYet")}</li>
          )}
        </ul>

        {ticket.assigned_agent ? (
          <form onSubmit={handleCommentSubmit} className="form form-inline">
            <label>
              {t("agentTicketDetail.addComment")}
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              {t("agentTicketDetail.internalNoteCheckbox")}
            </label>
            {isInternal && (
              <label>
                {t("agentTicketDetail.tagAgents")}
                <AgentAutocomplete
                  multiple
                  selected={taggedAgents}
                  onSelect={(a) => setTaggedAgents((prev) => [...prev, a])}
                  onRemove={(a) => setTaggedAgents((prev) => prev.filter((x) => x.id !== a.id))}
                  placeholder={t("agentTicketDetail.searchByUsername")}
                  excludeIds={[agent.id]}
                />
              </label>
            )}
            <button type="submit" disabled={!commentBody.trim()}>
              {isInternal
                ? t("agentTicketDetail.addInternalNote")
                : t("agentTicketDetail.replyToCustomer")}
            </button>
          </form>
        ) : (
          <p className="page-status">{t("agentTicketDetail.assignToComment")}</p>
        )}
      </section>

      {ticket.assigned_agent && (
        <div className="resolution-actions">
          <button
            type="button"
            className="pill-button pill-secondary"
            onClick={() => handleStatusChange("closed")}
            disabled={updatingStatus || ticket.status !== "resolved"}
          >
            {t("agentTicketDetail.close")}
          </button>
          <button
            type="button"
            className="pill-button"
            onClick={() => handleStatusChange("resolved")}
            disabled={updatingStatus || ticket.status !== "in_progress"}
          >
            {t("agentTicketDetail.markResolved")}
          </button>
        </div>
      )}

      <section>
        <h2>{t("agentTicketDetail.changeHistory")}</h2>
        <ul className="history-list">
          {history.map((entry) => (
            <li key={entry.id}>
              <span className="meta">{new Date(entry.changed_at).toLocaleString()}</span>{" "}
              <strong>{entry.changed_by?.username || t("agentTicketDetail.system")}</strong>{" "}
              {t("agentTicketDetail.changed")} <strong>{entry.field_changed}</strong>{" "}
              {t("agentTicketDetail.from")} "{entry.old_value || "-"}" {t("agentTicketDetail.to")}{" "}
              "{entry.new_value}"
            </li>
          ))}
          {history.length === 0 && (
            <li className="page-status">{t("agentTicketDetail.noHistoryYet")}</li>
          )}
        </ul>
      </section>
    </div>
  );
}
