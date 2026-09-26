from rest_framework import serializers
from .models import Country, VisaType, Pricing, Destination, SiteSetting, FAQ, Requirement

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'slug', 'is_national_id_required', 'content', 'meta_title', 'meta_description', 'is_active']

class VisaTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisaType
        fields = '__all__'

class PricingSerializer(serializers.ModelSerializer):
    visa_type_name = serializers.CharField(source='visa_type.name', read_only=True)
    citizen_country_name = serializers.CharField(source='citizen_country.name', read_only=True)

    class Meta:
        model = Pricing
        fields = '__all__'

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = ['id', 'name', 'slug', 'country', 'description', 'processing_time', 'is_active']


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = ['key', 'value']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'category', 'question', 'answer', 'order']


class RequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirement
        fields = ['id', 'icon', 'title', 'description', 'order']
