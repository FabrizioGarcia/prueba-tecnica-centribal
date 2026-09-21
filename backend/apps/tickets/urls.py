from rest_framework.routers import SimpleRouter

from .public_views import PublicTicketViewSet
from .views import TicketViewSet

router = SimpleRouter()
router.register("tickets", TicketViewSet, basename="ticket")
router.register("public/tickets", PublicTicketViewSet, basename="public-ticket")

urlpatterns = router.urls
