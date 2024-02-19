import requests
import json
from django.conf import settings
from leaderboard.methods import getTop, getRank

# Lowercase the user ID before passing it to the query
def lowercaseUserId(func):
    def wrapper(user_id: str, *args, **kwargs):
        return func(user_id.lower(), *args, **kwargs)
    return wrapper


def queryTop():
    try:
        print(settings.SUBGRAPH_API_URL)
        data = []
        for i in range(5):
            query = """
            {
                users(orderBy: points, orderDirection: desc, first: 1000, skip: %s) {
                    id
                    points
                }
            }
            """ % (i * 1000)

            response = requests.post(settings.SUBGRAPH_API_URL, json={'query': query})
            data.extend(response.json()['data']['users'])
        return data
    except (KeyError, IndexError, requests.exceptions.RequestException, TypeError, ValueError, AttributeError, json.JSONDecodeError) as e:
        return {
            "status": "error",
            "message": "An error occurred while fetching the top users. Please try again.",
            "error": str(e)
        }


@lowercaseUserId
def getUserPoints(user_id: str) -> int | dict:
    user_id = user_id.lower()
    try:
        query = """
            {
                users(where: { id: "%s" }) {
                    points
                }
            }
        """ % user_id
        return requests.post(settings.SUBGRAPH_API_URL, json={
            'query': query
        }).json()['data']['users'][0]['points']
    except (KeyError, IndexError, requests.exceptions.RequestException, TypeError, ValueError, AttributeError, json.JSONDecodeError) as e:
        return {
            "status": "error",
            "message": "An error occurred while fetching the user's points. Please check the user ID and try again.",
            "error": str(e)
        }


@lowercaseUserId
def getCurrent(user_id: str) -> list[dict]:
    try:
        points = getUserPoints(user_id)
        if isinstance(points, dict):
            return points
        others = requests.post(settings.SUBGRAPH_API_URL, json={
            'query': """
                {
                    usersWithMorePoints: users(where: { points_gt: %s }, orderBy: points, orderDirection: asc, first: 5) {
                        id
                        points
                    }
                    usersWithLessPoints: users(where: { points_lt: %s }, orderBy: points, orderDirection: desc, first: 5) {
                        id
                        points
                    }
                }
            """ % (points, points)
        }).json()['data']
        return [
            *[{
                "address": user["id"],
                "points": user["points"],
                "rank": getRank(user["id"])
            } for user in others["usersWithMorePoints"]],
            {
                "address": user_id,
                "points": points,
                "rank": getRank(user_id)
            },
            *[{
                "address": user["id"],
                "points": user["points"],
                "rank": getRank(user["id"])
            } for user in others["usersWithLessPoints"]]
        ]
    except (KeyError, IndexError, requests.exceptions.RequestException, TypeError, ValueError, AttributeError, json.JSONDecodeError) as e:
        return {
            "status": "error",
            "message": "An error occurred while fetching the bottom users. Please try again.",
            "error": str(e)
        }

@lowercaseUserId
def getLeaderboard(user_id: str) -> dict:
    try:
        current = getCurrent(user_id)
        print(current)
        top = getTop(current[0]["address"])
        return {
            "top": top,
            "current": current,
        }
    except (KeyError, IndexError, requests.exceptions.RequestException, TypeError, ValueError, AttributeError, json.JSONDecodeError) as e:
        return {
            "status": "error",
            "message": "An error occurred while fetching the leaderboard. Please try again.",
            "error": str(e)
        }


if __name__ == "__main__":
    address = "0x8BB280551540171E4ee400E2B35cC6d8079Ef114"
    print(getLeaderboard(address))
