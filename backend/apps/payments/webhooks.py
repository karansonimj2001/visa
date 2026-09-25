import hashlib
import hmac
import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import logging
from applications.models import Payment

logger = logging.getLogger(__name__)


def _verify_signature(payload: bytes, signature: str) -> bool:
    """Verify a Razorpay webhook signature (HMAC-SHA256 of raw body)."""
    secret = (settings.RAZORPAY_WEBHOOK_SECRET or '').strip()
    if not secret or not signature:
        return False
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@csrf_exempt
def razorpay_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_X_RAZORPAY_SIGNATURE', '')

    if not _verify_signature(payload, sig_header):
        logger.error("Invalid Razorpay webhook signature")
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    try:
        event = json.loads(payload.decode('utf-8'))
    except Exception as e:
        logger.error(f"Webhook parsing error: {e}")
        return JsonResponse({'error': 'Webhook processing failed'}, status=400)

    try:
        event_type = event.get('event', '')
        entity = ((event.get('payload') or {}).get('payment') or {}).get('entity') or {}
        order_id = entity.get('order_id', '')
        payment_id = entity.get('id', '')

        if event_type == 'payment.captured':
            try:
                payment = Payment.objects.get(razorpay_order_id=order_id)
                if payment.status == 'paid' and payment.application.payment_status == 'paid':
                    return JsonResponse({'status': 'success', 'detail': 'already processed'})
                payment.status = 'paid'
                payment.razorpay_payment_id = payment_id or payment.razorpay_payment_id
                payment.save()
                payment.application.payment_status = 'paid'
                payment.application.save()
            except Payment.DoesNotExist:
                logger.warning(f"Payment not found for order {order_id}")

        elif event_type == 'payment.failed':
            try:
                payment = Payment.objects.get(razorpay_order_id=order_id)
                if payment.status == 'paid':
                    return JsonResponse({'status': 'success', 'detail': 'already paid, ignoring failure event'})
                payment.status = 'failed'
                payment.razorpay_payment_id = payment_id or payment.razorpay_payment_id
                payment.save()
                payment.application.payment_status = 'failed'
                payment.application.save()
            except Payment.DoesNotExist:
                logger.warning(f"Payment not found for failed order {order_id}")

    except Exception as e:
        logger.error(f"Webhook handling error: {e}", exc_info=True)
        return JsonResponse({'error': 'Webhook handling failed'}, status=500)

    return JsonResponse({'status': 'success'})
