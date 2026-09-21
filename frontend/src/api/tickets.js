import { apiRequest } from "./client";

export function createTicket(payload) {
  return apiRequest("/tickets/", { method: "POST", body: payload });
}

export function listAllTickets() {
  return apiRequest("/tickets/", { auth: true }).then((data) => data.results);
}

export function listOpenTickets() {
  return apiRequest("/tickets/open/", { auth: true });
}

export function listMyTickets() {
  return apiRequest("/tickets/mine/", { auth: true });
}

export function listMentions() {
  return apiRequest("/tickets/mentions/", { auth: true });
}

export function getTicket(id) {
  return apiRequest(`/tickets/${id}/`, { auth: true });
}

export function updateTicketStatus(id, newStatus) {
  return apiRequest(`/tickets/${id}/status/`, {
    method: "PATCH",
    body: { status: newStatus },
    auth: true,
  });
}

export function assignTicket(id, agentId) {
  return apiRequest(`/tickets/${id}/assign/`, {
    method: "PATCH",
    body: { agent_id: agentId },
    auth: true,
  });
}

export function listComments(id) {
  return apiRequest(`/tickets/${id}/comments/`, { auth: true });
}

export function addComment(id, body, isInternal = true, taggedAgentIds = []) {
  return apiRequest(`/tickets/${id}/comments/`, {
    method: "POST",
    body: {
      body,
      is_internal: isInternal,
      ...(taggedAgentIds.length ? { tagged_agent_ids: taggedAgentIds } : {}),
    },
    auth: true,
  });
}

export function getHistory(id) {
  return apiRequest(`/tickets/${id}/history/`, { auth: true });
}
