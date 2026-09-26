from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from django.db import transaction
import logging
from .models import Country, VisaType, Pricing, Destination, SiteSetting, FAQ, Requirement
from .serializers import (
    CountrySerializer, VisaTypeSerializer, PricingSerializer, DestinationSerializer,
    SiteSettingSerializer, FAQSerializer, RequirementSerializer,
)

logger = logging.getLogger(__name__)

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.filter(is_active=True).order_by('name')
    serializer_class = CountrySerializer
    lookup_field = 'slug'

class VisaTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VisaType.objects.filter(is_active=True).order_by('name')
    serializer_class = VisaTypeSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        qs = super().get_queryset()
        citizen_id = self.request.query_params.get('citizen_country')
        if citizen_id:
            qs = qs.filter(pricings__citizen_country_id=citizen_id).order_by('name').distinct()
        return qs

class PricingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pricing.objects.filter(is_active=True)
    serializer_class = PricingSerializer

    def list(self, request):
        from django.db.models import Case, When, Value, IntegerField
        qs = self.queryset
        citizen_id = request.query_params.get('citizen')
        visa_id = request.query_params.get('visa_type')
        from_id = request.query_params.get('travelling_from')
        dest_id = request.query_params.get('destination')
        if citizen_id:
            qs = qs.filter(citizen_country_id=citizen_id)
        if visa_id:
            qs = qs.filter(visa_type_id=visa_id)
        spec = Value(0, output_field=IntegerField())
        if from_id:
            qs = qs.filter(Q(travelling_from_country__isnull=True) | Q(travelling_from_country_id=from_id))
            spec = spec + Case(When(travelling_from_country_id=from_id, then=Value(2)), default=Value(0), output_field=IntegerField())
        if dest_id:
            qs = qs.filter(Q(destination__isnull=True) | Q(destination_id=dest_id))
            spec = spec + Case(When(destination_id=dest_id, then=Value(1)), default=Value(0), output_field=IntegerField())
        qs = qs.annotate(_specificity=spec).order_by('-_specificity', 'price')
        return Response(PricingSerializer(qs, many=True).data)

class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Destination.objects.filter(is_active=True)
    serializer_class = DestinationSerializer
    lookup_field = 'slug'


class SiteSettingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer

    def list(self, request):
        settings = {s.key: s.value for s in self.get_queryset() if s.value}
        return Response(settings)


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs


class RequirementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Requirement.objects.filter(is_active=True)
    serializer_class = RequirementSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        country_id = self.request.query_params.get('country')
        if country_id:
            qs = qs.filter(Q(country__isnull=True) | Q(country_id=country_id))
        return qs
