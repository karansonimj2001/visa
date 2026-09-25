# d:\application\automation\find_model.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def find_working_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("API key missing.")
        return

    genai.configure(api_key=api_key)
    
    print("--- Searching for working model ---")
    try:
        # Get all models that support generating content
        all_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        for name in all_models:
            print(f"Testing {name}...", end=" ")
            try:
                model = genai.GenerativeModel(name)
                response = model.generate_content("Say OK")
                if response.text:
                    print(f"SUCCESS! -> {name}")
                    return name
            except Exception as e:
                print(f"Failed ({str(e)[:50]}...)")
                
    except Exception as e:
        print(f"Error listing models: {e}")
    return None

if __name__ == "__main__":
    winner = find_working_model()
    if winner:
        print(f"WINNER: {winner}")
    else:
        print("No models work with this key.")
