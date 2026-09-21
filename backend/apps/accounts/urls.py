from django.urls import path

from .views import AgentListView, AgentLoginView, AgentLogoutView, AgentMeView

urlpatterns = [
    path("auth/login/", AgentLoginView.as_view(), name="agent-login"),
    path("auth/logout/", AgentLogoutView.as_view(), name="agent-logout"),
    path("auth/me/", AgentMeView.as_view(), name="agent-me"),
    path("agents/", AgentListView.as_view(), name="agent-list"),
]
