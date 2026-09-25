import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0003_filefields_fix'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='destination',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='applications', to='core.destination'),
        ),
    ]
