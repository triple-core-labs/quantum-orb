from leaderboard.models import BlastAddress

def getTop() -> dict:
    # get the top 20 addresses by points
    return {
        "top": [
            {
                "address": address.address,
                "points": address.points,
                "rank": i + 1
            } for i, address in enumerate(BlastAddress.objects.order_by('-points')[:20])
        ]
    }


def getRank(user_id: str) -> int:
    try:
        rank = BlastAddress.objects.filter(points__gt=BlastAddress.objects.get(address=user_id).points).count() + 1
        if rank > 5000:
            return -1
        return rank
    except BlastAddress.DoesNotExist:
        return -1
