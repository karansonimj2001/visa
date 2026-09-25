# d:\application\automation\test_gemini.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def test_generation():
    print("--- GEMINI AI GENERATION TEST ---")
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        prompt = "Write a catchy 1-sentence motivational tweet for productivity niche. No hashtags."
        print(f"Sending prompt to Gemini: {prompt}")
        
        response = model.generate_content(prompt)
        if response and response.text:
            print(f"\nSUCCESS! Gemini generated: \"{response.text.strip()}\"")
            return True
        else:
            print("FAILED: No response text received.")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    test_generation()
