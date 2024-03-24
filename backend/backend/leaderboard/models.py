from django.db import models


class OrbType(models.IntegerChoices):
    """Mirrors the Solidity enum. The integers are the wire format."""

    DAILY = 0, "Daily"
    GENESIS = 1, "Genesis"
    QUANTUM = 2, "Quantum"


class Player(models.Model):
    address = models.CharField(max_length=42, primary_key=True)
    points = models.BigIntegerField(default=0)
    referral_points = models.BigIntegerField(default=0)
    referrer = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="referrals",
    )
    is_partner = models.BooleanField(default=False)
    last_daily_open = models.BigIntegerField(default=0)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["-points"])]

    def __str__(self) -> str:
        return self.address


class OrbOpen(models.Model):
    tx_hash = models.CharField(max_length=66)
    log_index = models.IntegerField()
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="opens")
    orb_type = models.IntegerField(choices=OrbType.choices)
    rank = models.SmallIntegerField()
    points = models.BigIntegerField()
    block_number = models.BigIntegerField()
    block_timestamp = models.BigIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tx_hash", "log_index"], name="unique_log_entry"
            )
        ]
        indexes = [models.Index(fields=["-block_number"])]


class PendingOrb(models.Model):
    player = models.OneToOneField(
        Player, on_delete=models.CASCADE, related_name="pending"
    )
    orb_type = models.IntegerField(choices=OrbType.choices)
    commit_block = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)


class IndexerState(models.Model):
    """Single row tracking how far the indexer has read."""

    singleton_id = models.PositiveSmallIntegerField(primary_key=True, default=1)
    last_processed_block = models.BigIntegerField(default=0)

    @classmethod
    def load(cls) -> "IndexerState":
        state, _ = cls.objects.get_or_create(singleton_id=1)
        return state
