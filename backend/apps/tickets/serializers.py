from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import AgentSerializer

from .models import Ticket, TicketComment, TicketHistory

User = get_user_model()


class TicketListSerializer(serializers.ModelSerializer):
    assigned_agent = AgentSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "subject",
            "priority",
            "status",
            "assigned_agent",
            "requester_name",
            "created_at",
            "updated_at",
        ]


class TicketDetailSerializer(serializers.ModelSerializer):
    assigned_agent = AgentSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "public_id",
            "subject",
            "description",
            "priority",
            "status",
            "assigned_agent",
            "requester_name",
            "requester_email",
            "created_at",
            "updated_at",
        ]


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "id",
            "public_id",
            "subject",
            "description",
            "priority",
            "requester_name",
            "requester_email",
        ]


class TicketPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "public_id",
            "subject",
            "description",
            "priority",
            "status",
            "requester_name",
            "created_at",
            "updated_at",
        ]


class TicketStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Ticket.Status.choices)

    def validate_status(self, value):
        ticket = self.context["ticket"]
        allowed = Ticket.VALID_STATUS_TRANSITIONS.get(ticket.status, set())
        if value not in allowed:
            raise serializers.ValidationError(
                f"Cannot transition from '{ticket.status}' to '{value}'."
            )
        return value


class TicketAssignSerializer(serializers.Serializer):
    agent_id = serializers.PrimaryKeyRelatedField(
        source="agent", queryset=User.objects.filter(is_staff=True)
    )


class TicketCommentSerializer(serializers.ModelSerializer):
    author = AgentSerializer(read_only=True)
    author_name = serializers.CharField(read_only=True)
    tagged_agents = AgentSerializer(read_only=True, many=True)
    tagged_agent_ids = serializers.PrimaryKeyRelatedField(
        source="tagged_agents",
        queryset=User.objects.filter(is_staff=True),
        write_only=True,
        required=False,
        many=True,
    )

    class Meta:
        model = TicketComment
        fields = [
            "id",
            "ticket",
            "author",
            "author_name",
            "is_internal",
            "tagged_agents",
            "tagged_agent_ids",
            "body",
            "created_at",
        ]
        read_only_fields = ["ticket", "author", "author_name", "tagged_agents"]

    def validate(self, attrs):
        if attrs.get("tagged_agents") and not attrs.get("is_internal", True):
            raise serializers.ValidationError(
                {"tagged_agent_ids": "Agents can only be tagged in internal notes."}
            )
        return attrs


class TicketHistorySerializer(serializers.ModelSerializer):
    changed_by = AgentSerializer(read_only=True)

    class Meta:
        model = TicketHistory
        fields = ["id", "field_changed", "old_value", "new_value", "changed_by", "changed_at"]
