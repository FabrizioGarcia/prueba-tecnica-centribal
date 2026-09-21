import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { listAllTickets, listMentions, listMyTickets, listOpenTickets } from "../api/tickets";
import TicketSection from "../components/TicketSection";

export default function AgentDashboard() {
  const { t } = useTranslation();
  const { agent, logout } = useAuth();
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [showAllTickets, setShowAllTickets] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t("agentDashboard.title")}</h1>
        <div>
          <span className="agent-name">{agent.username}</span>
          <button type="button" onClick={logout} className="link-button">
            {t("agentDashboard.logOut")}
          </button>
        </div>
      </div>

      <div className="dashboard-toolbar">
        <button
          type="button"
          onClick={() => setRefreshSignal((n) => n + 1)}
          className="refresh-button"
        >
          {t("agentDashboard.refreshAll")}
        </button>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showAllTickets}
            onChange={(e) => setShowAllTickets(e.target.checked)}
          />
          {t("agentDashboard.showAllTickets")}
        </label>
      </div>

      {!showAllTickets && (
        <>
          <TicketSection
            title={t("agentDashboard.openTickets")}
            fetchTickets={listOpenTickets}
            emptyMessage={t("agentDashboard.noOpenTickets")}
            refreshSignal={refreshSignal}
          />

          <TicketSection
            title={t("agentDashboard.yourTickets")}
            fetchTickets={listMyTickets}
            emptyMessage={t("agentDashboard.noAssignedTickets")}
            refreshSignal={refreshSignal}
            statusFilterToggle={{
              label: t("agentDashboard.showResolvedClosed"),
              hiddenStatuses: ["resolved", "closed"],
            }}
          />

          <TicketSection
            title={t("agentDashboard.taggedIn")}
            fetchTickets={listMentions}
            emptyMessage={t("agentDashboard.noMentions")}
            refreshSignal={refreshSignal}
          />
        </>
      )}

      {showAllTickets && (
        <TicketSection
          title={t("agentDashboard.allTickets")}
          fetchTickets={listAllTickets}
          emptyMessage={t("common.noTicketsFound")}
          refreshSignal={refreshSignal}
        />
      )}
    </div>
  );
}
