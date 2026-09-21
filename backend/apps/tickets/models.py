import secrets

from django.conf import settings
from django.db import models


def generate_public_id():
    return secrets.token_urlsafe(8)


class Ticket(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    public_id = models.CharField(max_length=16, unique=True, editable=False, blank=True)

    subject = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN, db_index=True)

    requester_name = models.CharField(max_length=150)
    requester_email = models.EmailField()

    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_tickets",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # OPEN -> IN_PROGRESS is not a manual transition: it happens automatically when
    # the ticket is assigned to an agent (see TicketAssignView). CLOSED is the
    # final state, reached once the customer stops responding after a resolution.
    # RESOLVED/CLOSED -> IN_PROGRESS also happens automatically, outside this table,
    # when the customer posts a new public message (see services.reopen_after_customer_reply).
    VALID_STATUS_TRANSITIONS = {
        Status.OPEN: set(),
        Status.IN_PROGRESS: {Status.RESOLVED},
        Status.RESOLVED: {Status.CLOSED},
        Status.CLOSED: set(),
    }

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.public_id:
            candidate = generate_public_id()
            while Ticket.objects.filter(public_id=candidate).exists():
                candidate = generate_public_id()
            self.public_id = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.pk} {self.subject}"


class TicketComment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="ticket_comments",
        null=True,
        blank=True,
    )
    is_internal = models.BooleanField(default=True)
    tagged_agents = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="tagged_in_comments",
        blank=True,
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    @property
    def author_name(self):
        return self.author.username if self.author else self.ticket.requester_name

    def __str__(self):
        return f"Comment on #{self.ticket_id} by {self.author_name}"


class TicketHistory(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="history")
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="ticket_changes",
        null=True,
        blank=True,
    )
    field_changed = models.CharField(max_length=50)
    old_value = models.CharField(max_length=100, blank=True)
    new_value = models.CharField(max_length=100, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at"]
        verbose_name_plural = "Ticket histories"

    def __str__(self):
        return f"#{self.ticket_id} {self.field_changed}: {self.old_value} -> {self.new_value}"
