from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.throttling import ScopedRateThrottle
from django.db import transaction
import logging
from .models import Application
from .serializers import ApplicationCreateSerializer

logger = logging.getLogger(__name__)

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationCreateSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'applications'

    def get_permissions(self):
        if self.action in ('create', 'track'):
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def get_throttles(self):
        # Track stays anonymous ref-only (competitor parity) but gets a
        # generous scoped throttle so the 6-digit space can't be scraped freely.
        if self.action == 'track':
            self.throttle_scope = 'track'
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Application validation failed: {serializer.errors}")
            return Response(
                {'error': 'Please check the highlighted fields.', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            with transaction.atomic():
                reference_number = Application.generate_reference_number()
                serializer.save(reference_number=reference_number)
                return Response({
                    'reference_number': reference_number,
                    'application_id': serializer.instance.id,
                    'message': 'Application created successfully'
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Application creation error: {e}", exc_info=True)
            return Response(
                {'error': 'An error occurred while creating your application', 'code': type(e).__name__},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def track(self, request):
        ref = request.query_params.get('ref')
        if not ref:
            return Response({'error': 'Reference number required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            app = Application.objects.get(reference_number=ref)
            return Response({
                'reference_number': app.reference_number,
                'status': app.status,
                'payment_status': app.payment_status,
                'visa_type': app.visa_type.name,
                'full_name': app.full_name,
                'created_at': app.created_at.isoformat(),
            })
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
