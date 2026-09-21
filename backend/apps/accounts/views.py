from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import AgentSerializer, LoginSerializer

User = get_user_model()


class AgentLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"], is_staff=True
        ).first()

        authenticated_user = (
            authenticate(username=user.username, password=serializer.validated_data["password"])
            if user is not None
            else None
        )
        if authenticated_user is None:
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=authenticated_user)
        return Response({"token": token.key, "agent": AgentSerializer(authenticated_user).data})


class AgentLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AgentMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(AgentSerializer(request.user).data)


class AgentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agents = User.objects.filter(is_staff=True).order_by("username")
        return Response(AgentSerializer(agents, many=True).data)
