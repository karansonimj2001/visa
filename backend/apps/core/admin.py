from django.contrib import admin
from .models import Country, VisaType, Pricing, BlogPost, SiteSetting, FAQ, Requirement

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_national_id_required', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_national_id_required']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ['name']}

@admin.register(VisaType)
class VisaTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'category', 'entry_type', 'processing_time', 'is_active']
    list_filter = ['category', 'entry_type', 'is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ['name']}

@admin.register(Pricing)
class PricingAdmin(admin.ModelAdmin):
    list_display = ['visa_type', 'citizen_country', 'travelling_from_country', 'destination', 'price', 'currency', 'is_active']
    list_filter = ['is_active', 'currency']
    list_editable = ['price', 'is_active']
    raw_id_fields = ['visa_type', 'citizen_country', 'travelling_from_country', 'destination']

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


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'order', 'is_active']
    list_filter = ['category', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['question', 'answer']


@admin.register(Requirement)
class RequirementAdmin(admin.ModelAdmin):
    list_display = ['title', 'country', 'order', 'is_active']
    list_filter = ['is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['title', 'description']
    raw_id_fields = ['country']
