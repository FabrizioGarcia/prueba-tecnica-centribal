import { Link } from "react-router-dom";

export default function TicketTable({ tickets, emptyMessage = "No tickets found." }) {
  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Subject</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Assigned to</th>
          <th>Requester</th>
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
              <span className={`badge priority-${ticket.priority}`}>{ticket.priority}</span>
            </td>
            <td>
              <span className={`badge status-${ticket.status}`}>{ticket.status}</span>
            </td>
            <td>{ticket.assigned_agent?.username || "-"}</td>
            <td>{ticket.requester_name}</td>
          </tr>
        ))}
        {tickets.length === 0 && (
          <tr>
            <td colSpan={6} className="page-status">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
