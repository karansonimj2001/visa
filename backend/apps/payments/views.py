from rest_framework.response import Response
import stripe
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle
from django.db import transaction
from django.conf import settings
import logging
from core.models import Pricing
from applications.models import Application, Payment

stripe.api_key = settings.STRIPE_SECRET_KEY
logger = logging.getLogger(__name__)

class PaymentViewSet(viewsets.ViewSet):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'create-payment'

    @action(detail=False, methods=['post'], url_path='create-intent')
    def create_intent(self, request):
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
            amount = int(pricing.price * 100)

            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='usd',
                metadata={
                    'application_id': str(app.id),
                    'reference_number': app.reference_number,
                },
            )

            with transaction.atomic():
                Payment.objects.update_or_create(
                    application=app,
                    defaults={
                        'stripe_payment_intent_id': intent.id,
                        'amount': pricing.price,
                        'currency': 'usd',
                        'status': 'unpaid',
                    }
                )
                app.stripe_payment_intent_id = intent.id
                app.save(update_fields=['stripe_payment_intent_id'])

            return Response({
                'client_secret': intent.client_secret,
                'amount': amount,
                'currency': 'usd',
                'reference_number': app.reference_number,
                'application_id': app.id,
                'visa_name': app.visa_type.name,
                'full_name': app.full_name,
                'destination_name': app.destination.name if app.destination_id else None,
            })

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}", exc_info=True)
            return Response({'error': 'Payment processing failed. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Create intent error: {e}", exc_info=True)
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
