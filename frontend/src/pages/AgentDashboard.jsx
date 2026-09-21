import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listAllTickets, listMentions, listMyTickets, listOpenTickets } from "../api/tickets";
import TicketSection from "../components/TicketSection";

export default function AgentDashboard() {
  const { agent, logout } = useAuth();
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [showAllTickets, setShowAllTickets] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Support Tickets</h1>
        <div>
          <span className="agent-name">{agent.username}</span>
          <button type="button" onClick={logout} className="link-button">
            Log out
          </button>
        </div>
      </div>

      <div className="dashboard-toolbar">
        <button
          type="button"
          onClick={() => setRefreshSignal((n) => n + 1)}
          className="refresh-button"
        >
          Refresh all
        </button>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showAllTickets}
            onChange={(e) => setShowAllTickets(e.target.checked)}
          />
          Show all tickets
        </label>
      </div>

      {!showAllTickets && (
        <>
          <TicketSection
            title="Open Tickets"
            fetchTickets={listOpenTickets}
            emptyMessage="No open tickets right now."
            refreshSignal={refreshSignal}
          />

          <TicketSection
            title="Your Tickets"
            fetchTickets={listMyTickets}
            emptyMessage="You have no tickets assigned."
            refreshSignal={refreshSignal}
            statusFilterToggle={{
              label: "Show resolved/closed",
              hiddenStatuses: ["resolved", "closed"],
            }}
          />

          <TicketSection
            title="Tagged In"
            fetchTickets={listMentions}
            emptyMessage="No one has tagged you in a note."
            refreshSignal={refreshSignal}
          />
        </>
      )}

      {showAllTickets && (
        <TicketSection
          title="All Tickets"
          fetchTickets={listAllTickets}
          emptyMessage="No tickets found."
          refreshSignal={refreshSignal}
        />
      )}
    </div>
  );
}
