from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import CountryViewSet, VisaTypeViewSet, PricingViewSet, DestinationViewSet
from applications.views import ApplicationViewSet
from payments.views import PaymentViewSet
from payments.webhooks import stripe_webhook
from django.views.decorators.csrf import csrf_exempt

router = DefaultRouter()
router.register(r'countries', CountryViewSet, basename='country')
router.register(r'visa-types', VisaTypeViewSet, basename='visa-type')
router.register(r'destinations', DestinationViewSet, basename='destination')
router.register(r'pricing', PricingViewSet, basename='pricing')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/payments/webhook/', csrf_exempt(stripe_webhook), name='stripe-webhook'),
]
