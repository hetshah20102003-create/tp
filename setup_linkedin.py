#!/usr/bin/env python3
"""One-time setup helper for LinkedIn OAuth2 authentication.

Steps:
1. Creates an authorization URL for you to visit
2. You log in and authorize the app
3. You paste the redirect URL back here
4. The script exchanges the code for an access token
5. Saves the token and your person ID to .env
"""

import sys
import urllib.parse
import webbrowser

import requests

import config

REDIRECT_URI = "http://localhost:8080/callback"
SCOPES = "openid profile w_member_social"


def main():
    print("=" * 60)
    print("  LinkedIn Auto-Poster — OAuth Setup")
    print("=" * 60)
    print()

    # Check for client credentials
    if not config.LINKEDIN_CLIENT_ID or not config.LINKEDIN_CLIENT_SECRET:
        print("Before running this script, you need to:")
        print()
        print("1. Go to https://www.linkedin.com/developers/apps")
        print("2. Click 'Create App'")
        print("3. Fill in the app details")
        print("4. Under 'Auth' tab, add this redirect URL:")
        print(f"   {REDIRECT_URI}")
        print("5. Under 'Products' tab, request access to:")
        print("   - 'Share on LinkedIn'")
        print("   - 'Sign In with LinkedIn using OpenID Connect'")
        print("6. Copy your Client ID and Client Secret")
        print("7. Add them to your .env file:")
        print("   LINKEDIN_CLIENT_ID=your_client_id")
        print("   LINKEDIN_CLIENT_SECRET=your_client_secret")
        print()
        print("Then run this script again.")
        sys.exit(1)

    # Build authorization URL
    auth_url = (
        "https://www.linkedin.com/oauth/v2/authorization?"
        + urllib.parse.urlencode(
            {
                "response_type": "code",
                "client_id": config.LINKEDIN_CLIENT_ID,
                "redirect_uri": REDIRECT_URI,
                "scope": SCOPES,
            }
        )
    )

    print("Opening your browser to authorize the app...")
    print(f"\nIf it doesn't open, visit this URL:\n{auth_url}\n")
    webbrowser.open(auth_url)

    print("After authorizing, you'll be redirected to a URL like:")
    print(f"  {REDIRECT_URI}?code=SOME_CODE")
    print()
    redirect_url = input("Paste the full redirect URL here: ").strip()

    # Extract authorization code
    parsed = urllib.parse.urlparse(redirect_url)
    params = urllib.parse.parse_qs(parsed.query)
    code = params.get("code", [None])[0]

    if not code:
        print("Error: Could not find authorization code in the URL.")
        sys.exit(1)

    # Exchange code for access token
    print("\nExchanging code for access token...")
    token_resp = requests.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": config.LINKEDIN_CLIENT_ID,
            "client_secret": config.LINKEDIN_CLIENT_SECRET,
        },
        timeout=15,
    )

    if token_resp.status_code != 200:
        print(f"Error getting token: {token_resp.text}")
        sys.exit(1)

    token_data = token_resp.json()
    access_token = token_data["access_token"]
    print(f"Access token obtained! (expires in {token_data.get('expires_in', '?')} seconds)")

    # Get person ID
    print("Fetching your LinkedIn profile...")
    profile_resp = requests.get(
        "https://api.linkedin.com/v2/me",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=15,
    )

    if profile_resp.status_code != 200:
        print(f"Error fetching profile: {profile_resp.text}")
        sys.exit(1)

    profile = profile_resp.json()
    person_id = profile["id"]
    name = f"{profile.get('localizedFirstName', '')} {profile.get('localizedLastName', '')}".strip()
    print(f"Authenticated as: {name} (ID: {person_id})")

    # Save to .env
    env_path = config.PROJECT_DIR / ".env"
    env_content = ""
    if env_path.exists():
        env_content = env_path.read_text()

    # Update or add token and person ID
    updates = {
        "LINKEDIN_ACCESS_TOKEN": access_token,
        "LINKEDIN_PERSON_ID": person_id,
    }
    for key, value in updates.items():
        if key in env_content:
            # Replace existing line
            lines = env_content.splitlines()
            env_content = "\n".join(
                f"{key}={value}" if line.startswith(f"{key}=") else line for line in lines
            )
        else:
            env_content += f"\n{key}={value}"

    env_path.write_text(env_content.strip() + "\n")

    print(f"\nSaved to {env_path}")
    print("\nSetup complete! You can now run:")
    print("  python main.py --dry-run    # Test without posting")
    print("  python main.py              # Generate and post to LinkedIn")


if __name__ == "__main__":
    main()
