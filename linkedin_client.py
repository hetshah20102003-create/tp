import requests

import config


def post_to_linkedin(text):
    """Publish a text post to LinkedIn using the REST API.

    Uses the /ugcPosts endpoint with the user's access token.
    Returns (success: bool, response_data: dict).
    """
    url = "https://api.linkedin.com/v2/ugcPosts"
    headers = {
        "Authorization": f"Bearer {config.LINKEDIN_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }
    payload = {
        "author": f"urn:li:person:{config.LINKEDIN_PERSON_ID}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }

    resp = requests.post(url, json=payload, headers=headers, timeout=30)

    if resp.status_code == 201:
        return True, resp.json()
    else:
        return False, {"status_code": resp.status_code, "error": resp.text}


def get_user_profile():
    """Fetch the current user's LinkedIn profile to verify token works."""
    url = "https://api.linkedin.com/v2/me"
    headers = {
        "Authorization": f"Bearer {config.LINKEDIN_ACCESS_TOKEN}",
    }
    resp = requests.get(url, headers=headers, timeout=15)
    if resp.status_code == 200:
        return resp.json()
    return None
