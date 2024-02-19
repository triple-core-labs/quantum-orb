from django.contrib import admin
from .models import BlastAddress


@admin.register(BlastAddress)
class BlastAddressAdmin(admin.ModelAdmin):
    list_display = ('address', 'points')
    search_fields = ('address',)
