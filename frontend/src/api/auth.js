import { apiRequest } from "./client";

export function login(email, password) {
  return apiRequest("/auth/login/", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiRequest("/auth/logout/", { method: "POST", auth: true });
}

export function fetchCurrentAgent() {
  return apiRequest("/auth/me/", { auth: true });
}
