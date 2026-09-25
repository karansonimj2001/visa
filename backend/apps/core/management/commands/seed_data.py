from django.core.management.base import BaseCommand
from core.models import Country, VisaType, Pricing, Destination

class Command(BaseCommand):
    help = 'Seed initial countries, visa types, pricing, and destinations'

    def handle(self, *args, **options):
        countries_data = [
            {'name': 'India', 'slug': 'india-citizens', 'is_national_id_required': False},
            {'name': 'Pakistan', 'slug': 'pakistan-citizens', 'is_national_id_required': True},
            {'name': 'Iran', 'slug': 'iran-citizens', 'is_national_id_required': True},
            {'name': 'UK', 'slug': 'uk-citizens', 'is_national_id_required': False},
            {'name': 'USA', 'slug': 'usa-citizens', 'is_national_id_required': False},
            {'name': 'UAE', 'slug': 'uae-citizens', 'is_national_id_required': False},
            {'name': 'Canada', 'slug': 'canada-citizens', 'is_national_id_required': False},
            {'name': 'Australia', 'slug': 'australia-citizens', 'is_national_id_required': False},
        ]
        for c in countries_data:
            Country.objects.get_or_create(slug=c['slug'], defaults=c)

        visa_types = [
            {'name': '14 Days Dubai Visa - Single Entry', 'slug': '14-days-single', 'duration_days': 14, 'entry_type': 'single', 'category': 'tourist', 'processing_time': '2-3 Days', 'visa_validity': '60 days from date of issue'},
            {'name': '30 Days Dubai Visa - Multiple Entry', 'slug': '30-days-multiple', 'duration_days': 30, 'entry_type': 'multiple', 'category': 'tourist', 'processing_time': '3-5 Days', 'visa_validity': '90 days from date of issue'},
            {'name': '96 Hours Transit Visa', 'slug': '96-hours-transit', 'duration_days': 4, 'entry_type': 'single', 'category': 'transit', 'processing_time': '1-2 Days', 'visa_validity': '8 days from date of issue'},
        ]
        for v in visa_types:
            VisaType.objects.get_or_create(slug=v['slug'], defaults=v)

        india = Country.objects.get(slug='india-citizens')
        uae = Country.objects.get(slug='uae-citizens')
        single = VisaType.objects.get(slug='14-days-single')
        multi = VisaType.objects.get(slug='30-days-multiple')
        transit = VisaType.objects.get(slug='96-hours-transit')

        pricing_data = [
            (single, india, 85), (single, uae, 120),
            (multi, india, 150), (multi, uae, 200),
            (transit, india, 45), (transit, uae, 60),
        ]
        for vt, country, price in pricing_data:
            Pricing.objects.get_or_create(visa_type=vt, citizen_country=country, defaults={'price': price, 'currency': 'USD'})

        destinations_data = [
            {'name': 'Dubai', 'slug': 'dubai', 'country': 'UAE', 'processing_time': '2-3 Days'},
            {'name': 'Qatar', 'slug': 'qatar', 'country': 'Qatar', 'processing_time': '3-5 Days'},
            {'name': 'UAE', 'slug': 'uae', 'country': 'UAE', 'processing_time': '2-4 Days'},
            {'name': 'Egypt', 'slug': 'egypt', 'country': 'Egypt', 'processing_time': '5-7 Days'},
        ]
        for d in destinations_data:
            Destination.objects.get_or_create(slug=d['slug'], defaults=d)

        self.stdout.write(self.style.SUCCESS('Seed data created successfully (including destinations)'))
