from rest_framework.permissions import BasePermission


class IsAssignedAgent(BasePermission):
    """Object-level permission: only the agent assigned to the ticket may act on it."""

    message = "Only the assigned agent can perform this action."

    def has_object_permission(self, request, view, ticket):
        return ticket.assigned_agent_id == request.user.id
