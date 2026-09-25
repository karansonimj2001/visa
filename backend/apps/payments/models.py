from django.db import models


# NOTE: Payment tracking lives in applications.Payment (used by the
# payment-intent view, the Stripe webhook, and Django Admin).
# Do NOT add a second payment model here — a duplicate model previously
# existed (PaymentIntent) and was removed because the webhook never read it.
