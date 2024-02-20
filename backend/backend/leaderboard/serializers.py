from django.core.validators import RegexValidator
from rest_framework import serializers

from .models import BlastAddress


class BlastAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlastAddress
        fields = ["address", "points"]


class AddressSerializer(serializers.Serializer):
    address = serializers.CharField(
        max_length=42,
        validators=[
            RegexValidator(
                regex=r"^0x[0-9a-fA-F]{40}$",
                message="Address must be a valid EVM address",
            )
        ],
    )

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)
        internal_value["address"] = internal_value["address"].lower()
        return internal_value
