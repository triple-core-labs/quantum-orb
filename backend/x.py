from requests_oauthlib import OAuth1
from config import settings
import requests


oauth = OAuth1(
    settings.X_CONSUMER_KEY,
    client_secret=settings.X_CONSUMER_SECRET,
    resource_owner_key=settings.X_ACCESS_TOKEN,
    resource_owner_secret=settings.X_ACCESS_TOKEN_SECRET
)


def get_user(username):
    try:
        response = requests.get("https://api.twitter.com/1.1/users/lookup.json", params={'screen_name': username}, auth=oauth)
        return response.json()
    except Exception as e:
        return str(e)


def is_following(username, target_account):
    try:
        response = requests.get(f"https://api.twitter.com/1.1/friendships/show.json", params={'source_screen_name': username, 'target_screen_name': target_account}, auth=oauth)
        return response.json()
    except Exception as e:
        return str(e)
