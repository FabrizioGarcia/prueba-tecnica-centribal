from django.contrib import admin

from .models import Ticket, TicketComment, TicketHistory


class TicketCommentInline(admin.TabularInline):
    model = TicketComment
    extra = 0
    readonly_fields = ["author", "is_internal", "created_at"]


class TicketHistoryInline(admin.TabularInline):
    model = TicketHistory
    extra = 0
    readonly_fields = ["field_changed", "old_value", "new_value", "changed_by", "changed_at"]


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ["id", "subject", "priority", "status", "assigned_agent", "public_id", "created_at"]
    list_filter = ["status", "priority"]
    search_fields = ["subject", "requester_email", "public_id"]
    readonly_fields = ["public_id"]
    inlines = [TicketCommentInline, TicketHistoryInline]
