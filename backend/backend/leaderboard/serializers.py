import re

from rest_framework import serializers

ADDRESS_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")


class AddressQuerySerializer(serializers.Serializer):
    address = serializers.CharField(required=False, allow_blank=True)

    def validate_address(self, value: str) -> str:
        if not value:
            return ""
        if not ADDRESS_RE.match(value):
            raise serializers.ValidationError(
                "Address must be a 0x-prefixed 40-character hex string"
            )
        return value.lower()
