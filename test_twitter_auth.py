# d:\application\automation\test_twitter_auth.py
import os
import tweepy
from dotenv import load_dotenv

load_dotenv()

def test_auth():
    print("--- TWITTER AUTH TEST ---")
    try:
        # Initializing client with v2 keys
        client = tweepy.Client(
            consumer_key=os.getenv("TWITTER_CONSUMER_KEY"),
            consumer_secret=os.getenv("TWITTER_CONSUMER_SECRET"),
            access_token=os.getenv("TWITTER_ACCESS_TOKEN"),
            access_token_secret=os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
        )
        
        # Checking account connectivity
        response = client.get_me()
        if response and response.data:
            print(f"SUCCESS! Keys are valid. Authenticated as: {response.data.username}")
            return True
        else:
            print("FAILED: Keys accepted but no user data returned.")
            return False
            
    except Exception as e:
        print(f"AUTH RESULT: {e}")
        return False

if __name__ == "__main__":
    test_auth()
