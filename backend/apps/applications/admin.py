from django.conf import settings
from django.contrib import admin
from applications.models import Application, Payment
from core.models import Destination
from core.admin_preview import preview_field, preview_iframe

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'full_name', 'visa_type', 'citizen_country', 'destination', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['reference_number', 'full_name', 'passport_number']
    list_editable = ['status', 'payment_status']
    date_hierarchy = 'created_at'
    readonly_fields = ['frontend_preview']

    def frontend_preview(self, obj):
        return preview_field(obj)
    frontend_preview.short_description = 'Live preview — ye application Track page pe aise dikhegi'

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'country', 'processing_time', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ['name']}
    ordering = ['name']
    readonly_fields = ['frontend_preview']

    def frontend_preview(self, obj):
        if not obj.pk:
            return 'Save karke phir ye preview dikhega.'
        return preview_iframe(settings.FRONTEND_URL + '/')
    frontend_preview.short_description = 'Live preview — destination Home/Apply dropdowns me dikhta hai'

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['application', 'amount', 'currency', 'status', 'razorpay_order_id', 'created_at']
    list_filter = ['status', 'currency']
    raw_id_fields = ['application']
