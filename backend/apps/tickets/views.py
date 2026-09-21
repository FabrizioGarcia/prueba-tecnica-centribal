from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from . import services
from .models import Ticket
from .pagination import TicketPagination
from .permissions import IsAssignedAgent
from .serializers import (
    TicketAssignSerializer,
    TicketCommentSerializer,
    TicketCreateSerializer,
    TicketDetailSerializer,
    TicketHistorySerializer,
    TicketListSerializer,
    TicketStatusUpdateSerializer,
)


class TicketViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Ticket.objects.select_related("assigned_agent")
    pagination_class = TicketPagination
    # Restrict the detail lookup to digits so a non-numeric id (e.g. /tickets/open/
    # matched by a stray trailing segment) 404s instead of raising a ValueError
    # when the ORM tries to cast it for the pk lookup.
    lookup_value_regex = r"\d+"

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        if self.action == "update_status":
            return [IsAuthenticated(), IsAssignedAgent()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return TicketCreateSerializer
        if self.action == "retrieve":
            return TicketDetailSerializer
        return TicketListSerializer

    @action(detail=False)
    def open(self, request):
        tickets = self.get_queryset().filter(status=Ticket.Status.OPEN)
        return Response(TicketListSerializer(tickets, many=True).data)

    @action(detail=False)
    def mine(self, request):
        tickets = self.get_queryset().filter(assigned_agent=request.user)
        return Response(TicketListSerializer(tickets, many=True).data)

    @action(detail=False)
    def mentions(self, request):
        tickets = self.get_queryset().filter(comments__tagged_agents=request.user).distinct()
        return Response(TicketListSerializer(tickets, many=True).data)

    @action(detail=True, methods=["patch"], url_path="status", url_name="status")
    def update_status(self, request, pk=None):
        ticket = get_object_or_404(self.get_queryset(), pk=pk)
        if ticket.assigned_agent_id is None:
            return Response(
                {"detail": "Assign this ticket to an agent before changing its status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        self.check_object_permissions(request, ticket)

        serializer = TicketStatusUpdateSerializer(data=request.data, context={"ticket": ticket})
        serializer.is_valid(raise_exception=True)

        ticket = services.transition_status(
            ticket, serializer.validated_data["status"], changed_by=request.user
        )
        return Response(TicketDetailSerializer(ticket).data)

    @action(detail=True, methods=["patch"])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ticket = services.assign_agent(
            ticket, serializer.validated_data["agent"], changed_by=request.user
        )
        return Response(TicketDetailSerializer(ticket).data)

    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        ticket = self.get_object()
        comments = ticket.comments.select_related("author").prefetch_related("tagged_agents").all()
        return Response(TicketCommentSerializer(comments, many=True).data)

    @comments.mapping.post
    def add_comment(self, request, pk=None):
        ticket = self.get_object()
        if ticket.assigned_agent_id is None:
            return Response(
                {"detail": "Assign this ticket to an agent before adding comments."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = TicketCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(ticket=ticket, author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True)
    def history(self, request, pk=None):
        ticket = self.get_object()
        history = ticket.history.select_related("changed_by").all()
        return Response(TicketHistorySerializer(history, many=True).data)
