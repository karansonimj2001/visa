from django.conf import settings
from django.contrib import admin
from .models import Country, VisaType, Pricing, BlogPost, SiteSetting, FAQ, Requirement
from .admin_preview import preview_field, preview_iframe

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_national_id_required', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_national_id_required']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ['name']}
    readonly_fields = ['frontend_preview']

    def frontend_preview(self, obj):
        return preview_field(obj)
    frontend_preview.short_description = 'Live preview — ye country page pe aise dikhega'

@admin.register(VisaType)
class VisaTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'category', 'entry_type', 'processing_time', 'is_active']
    list_filter = ['category', 'entry_type', 'is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ['name']}
    readonly_fields = ['frontend_preview']

    def frontend_preview(self, obj):
        return preview_field(obj)
    frontend_preview.short_description = 'Live preview — ye visa page pe aise dikhega'

@admin.register(Pricing)
class PricingAdmin(admin.ModelAdmin):
    list_display = ['visa_type', 'citizen_country', 'travelling_from_country', 'destination', 'price', 'currency', 'is_active']
    list_filter = ['is_active', 'currency']
    list_editable = ['price', 'is_active']
    # NOTE: no raw_id_fields here on purpose — countries/visas/destinations
    # are tiny tables, so plain dropdowns (select by NAME) are used.
    # raw_id_fields would force typing numeric IDs and cause
    # "Select a valid choice" errors for normal users.

    def save_model(self, request, obj, form, change):
        from django.db import IntegrityError, transaction
        from django.core.exceptions import ValidationError
        try:
            with transaction.atomic():
                super().save_model(request, obj, form, change)
        except IntegrityError as e:
            import logging
            logging.getLogger('core').error(f"Pricing admin save failed: {e}", exc_info=True)
            raise ValidationError(
                'Could not save: a pricing row for this exact combination may already exist, '
                'or the database rejected the values. Check for duplicates and try again.'
            )

    readonly_fields = ['frontend_preview']

    def frontend_preview(self, obj):
        if not obj.pk or not obj.visa_type_id:
            return 'Save karke phir ye preview dikhega.'
        url = f"{settings.FRONTEND_URL}/visa-types/{obj.visa_type.slug}"
        return preview_iframe(url)
    frontend_preview.short_description = 'Live preview — ye price visa page pe aise dikhega'

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_published', 'published_at', 'created_at']
    list_filter = ['is_published', 'created_at']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ['title']}


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'updated_at']
    search_fields = ['key']
    readonly_fields = ['frontend_preview']

    def frontend_preview(self, obj):
        if not obj.pk:
            return 'Save karke phir ye preview dikhega.'
        return preview_iframe(settings.FRONTEND_URL + '/')
    frontend_preview.short_description = 'Live preview — support phone Home/Apply/Payment/Track footers me dikhta hai'


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'order', 'is_active']
    list_filter = ['category', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['question', 'answer']
    readonly_fields = ['frontend_preview']

    def frontend_preview(self, obj):
        if not obj.pk:
            return 'Save karke phir ye preview dikhega.'
        if obj.category == 'track':
            return preview_iframe(settings.FRONTEND_URL + '/track')
        if obj.category == 'visa':
            first = VisaType.objects.filter(is_active=True).order_by('id').first()
            if first:
                return preview_iframe(f"{settings.FRONTEND_URL}/visa-types/{first.slug}")
        return preview_iframe(settings.FRONTEND_URL + '/')
    frontend_preview.short_description = 'Live preview — ye FAQ site pe aise dikhega'


@admin.register(Requirement)
class RequirementAdmin(admin.ModelAdmin):
    list_display = ['title', 'country', 'order', 'is_active']
    list_filter = ['is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['title', 'description']
    readonly_fields = ['frontend_preview']

    def frontend_preview(self, obj):
        if not obj.pk:
            return 'Save karke phir ye preview dikhega.'
        if obj.country_id:
            return preview_iframe(f"{settings.FRONTEND_URL}/countries/{obj.country.slug}")
        first = Country.objects.filter(is_active=True).order_by('id').first()
        if first:
            return preview_iframe(f"{settings.FRONTEND_URL}/countries/{first.slug}")
        return preview_iframe(settings.FRONTEND_URL + '/')
    frontend_preview.short_description = 'Live preview — ye document list country page pe aise dikhegi'
