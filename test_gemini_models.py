# d:\application\automation\test_gemini_models.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def test_models():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in .env")
        return

    genai.configure(api_key=api_key)
    
    print("--- FETCHING AVAILABLE MODELS ---")
    try:
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        print(f"Found {len(available_models)} models supporting generation.")
        
        # Test each model
        for model_name in available_models:
            print(f"\nTesting model: {model_name}...")
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content("Say 'Hello' if you are working.")
                if response and response.text:
                    print(f"SUCCESS! {model_name} responded: {response.text.strip()}")
                    return model_name # Stop at first working model
            except Exception as e:
                print(f"FAILED: {model_name} - {e}")
                
    except Exception as e:
        print(f"Critical Error listing models: {e}")

if __name__ == "__main__":
    winner = test_models()
    if winner:
        print(f"\nWINNER: {winner} is the one to use!")
    else:
        print("\nNo working model found with this API key.")
