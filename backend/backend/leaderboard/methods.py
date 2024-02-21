from backend.leaderboard.models import BlastAddress


def getTop(user_id: str) -> dict:
    # get the top 20 addresses by points
    res = []
    for i, address in enumerate(BlastAddress.objects.order_by("-points")[:20]):
        if address.address == user_id:
            break
        res.append(
            {"address": address.address, "points": address.points, "rank": i + 1}
        )
    return res


def getRank(user_id: str) -> int:
    try:
        rank = (
            BlastAddress.objects.filter(
                points__gt=BlastAddress.objects.get(address=user_id).points
            ).count()
            + 1
        )
        if rank > 5000:
            return -1
        return rank
    except BlastAddress.DoesNotExist:
        return -1
