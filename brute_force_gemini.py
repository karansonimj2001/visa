# d:\application\automation\brute_force_gemini.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def test_key_and_model(api_key, model_candidate):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_candidate)
        response = model.generate_content("Say 'OK'")
        if response and hasattr(response, 'text') and response.text:
            return True, response.text.strip()
    except Exception as e:
        return False, str(e)
    return False, "Unknown Error"

def scan_all():
    # 1. Gather all potential keys found in the project
    potential_keys = []
    
    # Current key from .env
    env_key = os.getenv("GEMINI_API_KEY")
    if env_key: potential_keys.append(env_key)
    
    # Common model names to try
    model_names = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.0-pro',
        'models/gemini-1.5-flash',
        'models/gemini-pro'
    ]
    
    print(f"--- STARTING SCAN WITH {len(potential_keys)} KEYS ---")
    
    for key in potential_keys:
        print(f"\nScanning Key: {key[:8]}...")
        for model in model_names:
            print(f"  Testing {model}...", end=" ")
            success, msg = test_key_and_model(key, model)
            if success:
                print(f"-> SUCCESS! Response: {msg}")
                return key, model # We found a winner
            else:
                print(f"-> FAILED: {msg[:50]}...")
    
    return None, None

if __name__ == "__main__":
    winner_key, winner_model = scan_all()
    if winner_key:
        print(f"\nWINNING COMBO FOUND!")
        print(f"KEY: {winner_key}")
        print(f"MODEL: {winner_model}")
    else:
        print("\nNo working combination found. Please check your API quota or key permissions.")
