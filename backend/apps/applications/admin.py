from django.contrib import admin
from applications.models import Application, Payment
from core.models import Destination

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'full_name', 'visa_type', 'citizen_country', 'destination', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['reference_number', 'full_name', 'passport_number']
    list_editable = ['status', 'payment_status']
    raw_id_fields = ['visa_type', 'citizen_country', 'travelling_from_country', 'destination']
    date_hierarchy = 'created_at'

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'country', 'processing_time', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ['name']}
    ordering = ['name']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['application', 'amount', 'currency', 'status', 'stripe_payment_intent_id', 'created_at']
    list_filter = ['status', 'currency']
    raw_id_fields = ['application']
