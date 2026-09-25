from rest_framework import serializers
from applications.models import Application
from core.models import Country, Destination
import magic

FILE_ALLOWED_TYPES = {'image/jpeg', 'image/png', 'application/pdf'}
FILE_MAX_SIZE = 5 * 1024 * 1024

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'visa_type', 'citizen_country', 'travelling_from_country', 'destination',
            'full_name', 'email', 'phone', 'passport_number', 'date_of_birth',
            'national_id_number', 'passport_file', 'photo_file', 'national_id_file',
        ]
        read_only_fields = ['reference_number', 'status', 'payment_status']
        extra_kwargs = {
            'passport_file': {'required': True},
            'photo_file': {'required': True},
        }

    def validate_email(self, value):
        from django.core.validators import validate_email
        try:
            validate_email(value)
        except:
            raise serializers.ValidationError("Invalid email format")
        return value

    def validate_phone(self, value):
        if len(value) < 7:
            raise serializers.ValidationError("Phone number too short")
        return value

    def validate_passport_number(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Invalid passport number")
        return value

    def validate(self, data):
        citizen_country = data.get('citizen_country')
        if citizen_country and citizen_country.is_national_id_required:
            if not data.get('national_id_number'):
                raise serializers.ValidationError("National ID is required for this country")
            if not data.get('national_id_file'):
                raise serializers.ValidationError("National ID file is required for this country")
        return data

    def validate_file(self, value):
        if value is None or value == '':
            return value
        if not hasattr(value, 'size') or not hasattr(value, 'read'):
            raise serializers.ValidationError("Invalid file upload.")
        if value.size > FILE_MAX_SIZE:
            raise serializers.ValidationError("File too large (max 5MB)")
        try:
            content = value.read(2048)
            mime = magic.from_buffer(content, mime=True)
        finally:
            try:
                value.seek(0)
            except Exception:
                pass
        if mime not in FILE_ALLOWED_TYPES:
            raise serializers.ValidationError(f"Invalid file type: {mime}")
        return value

    def validate_passport_file(self, value):
        return self.validate_file(value)

    def validate_photo_file(self, value):
        return self.validate_file(value)

    def validate_national_id_file(self, value):
        return self.validate_file(value)
