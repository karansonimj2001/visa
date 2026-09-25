# d:\application\automation\twitter_bot.py
import os
import tweepy
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime
import time

load_dotenv()

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://aiicylzukkkhxcimsycb.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Clients initialization
print(f"--- SCRIPT STARTING AT {datetime.now()} ---")

try:
    print("Setting up Gemini Config...")
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    print("Initializing Supabase Client...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    print("Initializing Twitter (X) Client...")
    client_x = tweepy.Client(
        consumer_key=os.getenv("TWITTER_CONSUMER_KEY"),
        consumer_secret=os.getenv("TWITTER_CONSUMER_SECRET"),
        access_token=os.getenv("TWITTER_ACCESS_TOKEN"),
        access_token_secret=os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
    )
    print("All clients initialized successfully.")
except Exception as e:
    print(f"Initialization Error: {e}")

def generate_tweet(niche):
    print(f"Asking Gemini (models/gemini-1.5-flash) for content on: {niche}...")
    try:
        # Using the winner model path found in debug
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        response = model.generate_content(
            f"Act as a stoic discipline coach. Write a 1-sentence hardcore motivational tweet (max 240 chars) about {niche}. No hashtags. No generic emojis."
        )
        t_text = response.text.strip()
        print(f"Gemini output generated ({len(t_text)} chars).")
        return t_text
    except Exception as e:
        print(f"Gemini Generation Error: {e}")
        return "Discipline is the only bridge between goals and accomplishment."

def run_bot():
    print(f"\n--- BOT CYCLE STARTED ---")
    
    try:
        # 1. Fetch settings from Supabase
        print("Fetching settings from Supabase twitter_automation_settings table...")
        res = supabase.table('twitter_automation_settings').select('*').limit(1).maybe_single().execute()
        settings = res.data
        
        if not settings:
            print("No settings record found in Supabase. Please run the SQL seed script.")
            return

        if settings.get('status') != 'active':
            print(f"Bot is currently '{settings.get('status')}'. Needs to be 'active' to post.")
            return

        niche = settings.get('niche', 'General productivity tips')
        print(f"Target Niche: {niche}")

        # 2. Generate content
        tweet_text = generate_tweet(niche)
        print(f"Selected Tweet: \"{tweet_text}\"")

        # 3. Post to Twitter
        print("Uploading post to X (Twitter)...")
        # NOTE: This will fail with 402 if X balance is $0.00
        tw_response = client_x.create_tweet(text=tweet_text)
        tweet_id = tw_response.data['id']
        print(f"X Post SUCCESS! Tweet ID: {tweet_id}")

        # 4. Log the post back to Supabase
        print("Logging activity to Supabase operational logs...")
        supabase.table('twitter_posts').insert({
            "content": tweet_text,
            "created_at": datetime.now().isoformat()
        }).execute()
        print("Operational Log entry created.")

        print(f"\n--- BOT CYCLE COMPLETE AT {datetime.now()} ---")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    run_bot()
