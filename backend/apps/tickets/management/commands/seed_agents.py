from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.tickets.models import Ticket, TicketComment, TicketHistory

User = get_user_model()

DEFAULT_PASSWORD = "demo1234"

AGENTS = [
    {"username": "fabrizio", "email": "fabrizio@gmail.com"},
    {"username": "luciano", "email": "luciano@gmail.com"},
    {"username": "kallic", "email": "kallic@gmail.com"},
]

DEFAULT_TICKET = {
    "requester_name": "dani",
    "requester_email": "dani@gmail.com",
    "subject": "Sample support ticket",
    "description": "This is a default ticket created for local testing.",
    "priority": Ticket.Priority.MEDIUM,
}


class Command(BaseCommand):
    help = "Creates the default dev agent users and a default ticket (idempotent)."

    def handle(self, *args, **options):
        for agent in AGENTS:
            user, created = User.objects.get_or_create(
                username=agent["username"], defaults={"email": agent["email"]}
            )
            user.email = agent["email"]
            user.is_staff = True
            user.set_password(DEFAULT_PASSWORD)
            user.save()
            action = "Created" if created else "Updated"
            self.stdout.write(f"{action} agent: {agent['email']} / {DEFAULT_PASSWORD}")

        if not Ticket.objects.filter(requester_email=DEFAULT_TICKET["requester_email"]).exists():
            ticket = Ticket.objects.create(**DEFAULT_TICKET)
            self.stdout.write(f"Created default ticket for {DEFAULT_TICKET['requester_email']}")
            self._seed_conversation(ticket)
        else:
            self.stdout.write(f"Default ticket for {DEFAULT_TICKET['requester_email']} already exists")

    def _seed_conversation(self, ticket):
        fabrizio = User.objects.get(username="fabrizio")
        luciano = User.objects.get(username="luciano")

        TicketHistory.objects.create(
            ticket=ticket,
            changed_by=fabrizio,
            field_changed="assigned_agent",
            old_value="",
            new_value=str(fabrizio),
        )
        TicketHistory.objects.create(
            ticket=ticket,
            changed_by=fabrizio,
            field_changed="status",
            old_value=Ticket.Status.OPEN,
            new_value=Ticket.Status.IN_PROGRESS,
        )
        ticket.assigned_agent = fabrizio
        ticket.status = Ticket.Status.IN_PROGRESS
        ticket.save(update_fields=["assigned_agent", "status", "updated_at"])

        TicketComment.objects.create(
            ticket=ticket,
            author=fabrizio,
            is_internal=True,
            body="Taking a look at this now.",
        )

        tagged_note = TicketComment.objects.create(
            ticket=ticket,
            author=fabrizio,
            is_internal=True,
            body="@luciano can you double-check this on your end?",
        )
        tagged_note.tagged_agents.add(luciano)

        TicketComment.objects.create(
            ticket=ticket,
            author=fabrizio,
            is_internal=False,
            body="Hi Dani, thanks for reaching out — we're looking into this and will update you shortly.",
        )

        TicketComment.objects.create(
            ticket=ticket,
            author=None,
            is_internal=False,
            body="Thank you, looking forward to a fix!",
        )

        self.stdout.write("Seeded sample conversation on the default ticket")
