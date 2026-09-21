import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TicketTable({ tickets, emptyMessage }) {
  const { t } = useTranslation();
  const resolvedEmptyMessage = emptyMessage ?? t("common.noTicketsFound");

  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>{t("ticketTable.id")}</th>
          <th>{t("ticketTable.subject")}</th>
          <th>{t("ticketTable.priority")}</th>
          <th>{t("ticketTable.status")}</th>
          <th>{t("ticketTable.assignedTo")}</th>
          <th>{t("ticketTable.requester")}</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id}>
            <td>#{ticket.id}</td>
            <td>
              <Link to={`/agent/tickets/${ticket.id}`}>{ticket.subject}</Link>
            </td>
            <td>
              <span className={`badge priority-${ticket.priority}`}>
                {t(`priority.${ticket.priority}`)}
              </span>
            </td>
            <td>
              <span className={`badge status-${ticket.status}`}>
                {t(`status.${ticket.status}`)}
              </span>
            </td>
            <td>{ticket.assigned_agent?.username || "-"}</td>
            <td>{ticket.requester_name}</td>
          </tr>
        ))}
        {tickets.length === 0 && (
          <tr>
            <td colSpan={6} className="page-status">
              {resolvedEmptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
