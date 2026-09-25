from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0004_destination_required'),
    ]

    operations = [
        migrations.RenameField(
            model_name='application',
            old_name='stripe_payment_intent_id',
            new_name='razorpay_order_id',
        ),
        migrations.RenameField(
            model_name='payment',
            old_name='stripe_payment_intent_id',
            new_name='razorpay_order_id',
        ),
        migrations.AddField(
            model_name='payment',
            name='razorpay_payment_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
