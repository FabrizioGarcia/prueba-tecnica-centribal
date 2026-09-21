import { apiRequest } from "./client";

export function listAgents() {
  return apiRequest("/agents/", { auth: true });
}
