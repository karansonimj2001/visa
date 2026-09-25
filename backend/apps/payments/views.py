from rest_framework.response import Response
import razorpay
from razorpay.errors import BadRequestError, ServerError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle
from django.db import transaction
from django.conf import settings
import logging
from core.models import Pricing
from applications.models import Application, Payment

logger = logging.getLogger(__name__)


def get_razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class PaymentViewSet(viewsets.ViewSet):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'create-payment'

    @action(detail=False, methods=['post'], url_path='create-order')
    def create_order(self, request):
        try:
            application_id = request.data.get('application_id')
            if not application_id:
                return Response({'error': 'application_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            app = Application.objects.get(id=application_id)
            if app.payment_status != 'unpaid':
                return Response({'error': 'Application already paid or not payable'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                pricing = Pricing.resolve_price(
                    app.visa_type,
                    app.citizen_country,
                    travelling_from=app.travelling_from_country,
                    destination=app.destination,
                )
            except Pricing.DoesNotExist:
                return Response({'error': 'Pricing not available for this combination'}, status=status.HTTP_404_NOT_FOUND)
            # Razorpay takes the amount in the smallest currency unit.
            amount = int(pricing.price * 100)
            currency = (pricing.currency or 'USD').upper()

            client = get_razorpay_client()
            order = client.order.create({
                'amount': amount,
                'currency': currency,
                'receipt': app.reference_number,
                'notes': {
                    'application_id': str(app.id),
                    'reference_number': app.reference_number,
                },
            })

            with transaction.atomic():
                Payment.objects.update_or_create(
                    application=app,
                    defaults={
                        'razorpay_order_id': order['id'],
                        'amount': pricing.price,
                        'currency': currency,
                        'status': 'unpaid',
                    }
                )
                app.razorpay_order_id = order['id']
                app.save(update_fields=['razorpay_order_id'])

            # NOTE: only the public key_id is ever sent to the frontend.
            # The key secret stays server-side.
            return Response({
                'order_id': order['id'],
                'amount': amount,
                'currency': currency,
                'key_id': settings.RAZORPAY_KEY_ID,
                'reference_number': app.reference_number,
                'application_id': app.id,
                'visa_name': app.visa_type.name,
                'full_name': app.full_name,
                'destination_name': app.destination.name if app.destination_id else None,
            })

        except (BadRequestError, ServerError) as e:
            logger.error(f"Razorpay error: {str(e)}", exc_info=True)
            return Response({'error': 'Payment processing failed. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Create order error: {e}", exc_info=True)
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
