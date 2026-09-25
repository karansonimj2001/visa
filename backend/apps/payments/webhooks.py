import stripe
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import logging
from applications.models import Application, Payment

stripe.api_key = settings.STRIPE_SECRET_KEY
logger = logging.getLogger(__name__)

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        logger.error(f"Invalid webhook signature: {e}")
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    except Exception as e:
        logger.error(f"Webhook parsing error: {e}")
        return JsonResponse({'error': 'Webhook processing failed'}, status=400)

    try:
        if event['type'] == 'payment_intent.succeeded':
            intent = event['data']['object']
            pi_id = intent['id']
            try:
                payment = Payment.objects.get(stripe_payment_intent_id=pi_id)
                if payment.status == 'paid' and payment.application.payment_status == 'paid':
                    return JsonResponse({'status': 'success', 'detail': 'already processed'})
                payment.status = 'paid'
                payment.save()
                payment.application.payment_status = 'paid'
                payment.application.save()
            except Payment.DoesNotExist:
                logger.warning(f"Payment not found for intent {pi_id}")

        elif event['type'] == 'payment_intent.payment_failed':
            intent = event['data']['object']
            pi_id = intent['id']
            try:
                payment = Payment.objects.get(stripe_payment_intent_id=pi_id)
                if payment.status == 'paid':
                    return JsonResponse({'status': 'success', 'detail': 'already paid, ignoring failure event'})
                payment.status = 'failed'
                payment.save()
                payment.application.payment_status = 'failed'
                payment.application.save()
            except Payment.DoesNotExist:
                logger.warning(f"Payment not found for failed intent {pi_id}")

    except Exception as e:
        logger.error(f"Webhook handling error: {e}", exc_info=True)
        return JsonResponse({'error': 'Webhook handling failed'}, status=500)

    return JsonResponse({'status': 'success'})
