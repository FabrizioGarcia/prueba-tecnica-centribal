from django.db import transaction

from .models import Ticket, TicketHistory


def transition_status(ticket: Ticket, new_status: str, changed_by) -> Ticket:
    with transaction.atomic():
        TicketHistory.objects.create(
            ticket=ticket,
            changed_by=changed_by,
            field_changed="status",
            old_value=ticket.status,
            new_value=new_status,
        )
        ticket.status = new_status
        ticket.save(update_fields=["status", "updated_at"])
    return ticket


def reopen_after_customer_reply(ticket: Ticket) -> Ticket:
    # A customer replying to a resolved/closed ticket means the issue isn't
    # actually done; nobody "changed" this on purpose, so changed_by is None.
    if ticket.status not in {Ticket.Status.RESOLVED, Ticket.Status.CLOSED}:
        return ticket
    return transition_status(ticket, Ticket.Status.IN_PROGRESS, changed_by=None)


def assign_agent(ticket: Ticket, agent, changed_by) -> Ticket:
    if ticket.assigned_agent_id == agent.id:
        return ticket

    with transaction.atomic():
        TicketHistory.objects.create(
            ticket=ticket,
            changed_by=changed_by,
            field_changed="assigned_agent",
            old_value=str(ticket.assigned_agent) if ticket.assigned_agent else "",
            new_value=str(agent),
        )
        ticket.assigned_agent = agent
        update_fields = ["assigned_agent", "updated_at"]

        # Assigning an open ticket is what kicks off work on it: the status
        # transition is a side effect of assignment, not a separate manual step.
        if ticket.status == Ticket.Status.OPEN:
            TicketHistory.objects.create(
                ticket=ticket,
                changed_by=changed_by,
                field_changed="status",
                old_value=ticket.status,
                new_value=Ticket.Status.IN_PROGRESS,
            )
            ticket.status = Ticket.Status.IN_PROGRESS
            update_fields.append("status")

        ticket.save(update_fields=update_fields)

    return ticket
