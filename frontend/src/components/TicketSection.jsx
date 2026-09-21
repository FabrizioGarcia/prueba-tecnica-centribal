import { useEffect, useState } from "react";
import TicketTable from "./TicketTable";

export default function TicketSection({
  title,
  fetchTickets,
  emptyMessage,
  refreshSignal,
  statusFilterToggle,
}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTickets()
      .then(setTickets)
      .catch(() => setError("Could not load tickets."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  const visibleTickets =
    statusFilterToggle && !showHidden
      ? tickets.filter((ticket) => !statusFilterToggle.hiddenStatuses.includes(ticket.status))
      : tickets;

  return (
    <section className="ticket-section">
      <h2>
        {title} {!loading && <span className="section-count">({visibleTickets.length})</span>}
      </h2>
      {statusFilterToggle && (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
          />
          {statusFilterToggle.label}
        </label>
      )}
      {loading && <p className="page-status">Loading...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && <TicketTable tickets={visibleTickets} emptyMessage={emptyMessage} />}
    </section>
  );
}
