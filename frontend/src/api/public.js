import { apiRequest } from "./client";

export function getPublicTicket(publicId) {
  return apiRequest(`/public/tickets/${publicId}/`);
}

export function listPublicMessages(publicId) {
  return apiRequest(`/public/tickets/${publicId}/messages/`);
}

export function addPublicMessage(publicId, body) {
  return apiRequest(`/public/tickets/${publicId}/messages/`, {
    method: "POST",
    body: { body },
  });
}
