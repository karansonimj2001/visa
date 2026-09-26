from django.db import models

class Country(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, db_index=True)
    is_national_id_required = models.BooleanField(default=False)
    content = models.TextField(blank=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active', 'is_national_id_required']),
        ]
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        from django.conf import settings
        return f"{settings.FRONTEND_URL}/countries/{self.slug}"


class VisaType(models.Model):
    VISIT_CATEGORY_CHOICES = [
        ('tourist', 'Tourist'),
        ('transit', 'Transit'),
        ('job_seeker', 'Job Seeker'),
        ('freelance', 'Freelance'),
    ]
    ENTRY_TYPE_CHOICES = [
        ('single', 'Single Entry'),
        ('multiple', 'Multiple Entry'),
    ]
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, db_index=True)
    duration_days = models.IntegerField()
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=VISIT_CATEGORY_CHOICES)
    processing_time = models.CharField(max_length=100)
    visa_validity = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category', 'is_active']),
        ]

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        from django.conf import settings
        return f"{settings.FRONTEND_URL}/visa-types/{self.slug}"


class Pricing(models.Model):
    visa_type = models.ForeignKey(VisaType, on_delete=models.CASCADE, related_name='pricings')
    citizen_country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='pricings')
    # Optional dimensions. NULL = base price for all values of that dimension.
    travelling_from_country = models.ForeignKey(
        Country, on_delete=models.CASCADE, related_name='pricings_as_from',
        null=True, blank=True,
        help_text='Leave empty for base price regardless of departure country.',
    )
    destination = models.ForeignKey(
        'Destination', on_delete=models.CASCADE, related_name='pricings',
        null=True, blank=True,
        help_text='Leave empty for base price regardless of destination.',
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [['visa_type', 'citizen_country', 'travelling_from_country', 'destination']]
        indexes = [
            models.Index(fields=['visa_type', 'citizen_country']),
            models.Index(fields=['visa_type', 'citizen_country', 'travelling_from_country', 'destination']),
        ]

    def clean(self):
        from django.core.exceptions import ValidationError
        # Use raw FK ids: accessing the relation objects here raises
        # RelatedObjectDoesNotExist while the admin form is still being
        # validated (which Django turns into a 500 instead of a form error).
        if not self.visa_type_id or not self.citizen_country_id:
            return
        qs = Pricing.objects.filter(
            visa_type_id=self.visa_type_id, citizen_country_id=self.citizen_country_id,
        )
        if self.travelling_from_country_id:
            qs = qs.filter(travelling_from_country_id=self.travelling_from_country_id)
        else:
            qs = qs.filter(travelling_from_country__isnull=True)
        if self.destination_id:
            qs = qs.filter(destination_id=self.destination_id)
        else:
            qs = qs.filter(destination__isnull=True)
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        if qs.exists():
            raise ValidationError('A pricing row for this exact combination already exists.')

    @classmethod
    def resolve_price(cls, visa_type, citizen_country, travelling_from=None, destination=None):
        """Most-specific active price wins.

        Order: exact (from+dest) -> from-only -> dest-only -> base (both empty).
        Raises Pricing.DoesNotExist if nothing matches.
        """
        combos = [
            {'travelling_from_country': travelling_from, 'destination': destination},
            {'travelling_from_country': travelling_from, 'destination': None},
            {'travelling_from_country': None, 'destination': destination},
            {'travelling_from_country': None, 'destination': None},
        ]
        last_exc = None
        for combo in combos:
            filters = {'visa_type': visa_type, 'citizen_country': citizen_country, 'is_active': True}
            for field, value in combo.items():
                if value is None:
                    filters[f'{field}__isnull'] = True
                else:
                    filters[field] = value
            try:
                return cls.objects.get(**filters)
            except cls.DoesNotExist as e:
                last_exc = e
        raise last_exc

    def __str__(self):
        parts = [self.visa_type.name, self.citizen_country.name]
        if self.travelling_from_country_id:
            parts.append(f'from {self.travelling_from_country.name}')
        if self.destination_id:
            parts.append(f'to {self.destination.name}')
        return f"{' - '.join(parts)}: {self.price} {self.currency}"

class SiteSetting(models.Model):
    key = models.SlugField(unique=True, db_index=True, help_text='e.g. support_phone')
    value = models.CharField(max_length=500, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key} = {self.value}"


class FAQ(models.Model):
    CATEGORY_CHOICES = [
        ('visa', 'Visa Type Page'),
        ('track', 'Track Page'),
        ('general', 'General'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general', db_index=True)
    question = models.CharField(max_length=500)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"[{self.category}] {self.question[:60]}"


class Requirement(models.Model):
    country = models.ForeignKey(
        Country, on_delete=models.CASCADE, related_name='requirements',
        null=True, blank=True,
        help_text='Empty = shown for every country.',
    )
    icon = models.CharField(max_length=50, default='description', help_text='Material Symbols icon name.')
    title = models.CharField(max_length=255)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        scope = self.country.name if self.country_id else 'all countries'
        return f"{self.title} ({scope})"


class BlogPost(models.Model):
    slug = models.SlugField(unique=True, db_index=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    cover_image = models.CharField(max_length=500, null=True, blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Destination(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, db_index=True)
    country = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    processing_time = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        # Destinations only appear inside the Home/Apply dropdowns.
        from django.conf import settings
        return settings.FRONTEND_URL + '/'
