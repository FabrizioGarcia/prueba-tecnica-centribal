from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import services
from .models import Ticket
from .serializers import TicketCommentSerializer, TicketPublicSerializer


class PublicTicketViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketPublicSerializer
    permission_classes = [AllowAny]
    lookup_field = "public_id"
    lookup_url_kwarg = "public_id"

    @action(detail=True, methods=["get"])
    def messages(self, request, public_id=None):
        ticket = self.get_object()
        messages = (
            ticket.comments.filter(is_internal=False)
            .select_related("author")
            .prefetch_related("tagged_agents")
        )
        return Response(TicketCommentSerializer(messages, many=True).data)

    @messages.mapping.post
    def add_message(self, request, public_id=None):
        ticket = self.get_object()
        serializer = TicketCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(ticket=ticket, author=None, is_internal=False, tagged_agents=[])
        services.reopen_after_customer_reply(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
