from django.db import models
from core.models import Country, VisaType

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    reference_number = models.CharField(max_length=50, unique=True, db_index=True)
    visa_type = models.ForeignKey(VisaType, on_delete=models.CASCADE, related_name='applications')
    citizen_country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='applications_as_citizen')
    travelling_from_country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='applications_as_from', null=True, blank=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    passport_number = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    national_id_number = models.CharField(max_length=50, null=True, blank=True)
    passport_file = models.FileField(upload_to='passports/', null=True, blank=True)
    photo_file = models.FileField(upload_to='photos/', null=True, blank=True)
    national_id_file = models.FileField(upload_to='national_ids/', null=True, blank=True)
    destination = models.ForeignKey('core.Destination', on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    razorpay_order_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['reference_number']),
            models.Index(fields=['status', 'payment_status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.reference_number} - {self.full_name}"

    def get_absolute_url(self):
        from django.conf import settings
        return f"{settings.FRONTEND_URL}/track?ref={self.reference_number}"

    @classmethod
    def generate_reference_number(cls):
        import random
        from django.utils import timezone
        year = timezone.now().year
        while True:
            num = f"{random.randint(0, 999999):06d}"
            ref = f"DXB-{year}-{num}"
            if not cls.objects.filter(reference_number=ref).exists():
                return ref

class Payment(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='payment')
    razorpay_order_id = models.CharField(max_length=255)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=Application.PAYMENT_STATUS_CHOICES, default='unpaid')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.application.reference_number} - {self.status}"
