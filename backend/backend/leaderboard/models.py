from django.db import models


class BlastAddress(models.Model):
    address = models.CharField(max_length=42, unique=True)
    points = models.IntegerField(default=0)
