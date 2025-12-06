"""Test script to verify OpenAI API connectivity"""
import os
from dotenv import load_dotenv
import openai

load_dotenv(".env")


client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    print("Testing OpenAI API access...")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Say hello"}],
        max_tokens=50
    )
    print(f"✓ API is working! Response: {response.choices[0].message.content}")
except Exception as e:
    print(f"✗ API Error: {e}")

print("\nNow testing if Realtime API is accessible...")
try:
   
    models = client.models.list()
    realtime_models = [m for m in models.data if 'realtime' in m.id.lower()]
    if realtime_models:
        print(f"✓ Realtime models found: {[m.id for m in realtime_models]}")
    else:
        print("✗ No realtime models found - your account may not have access to OpenAI Realtime API")
        print("  This is a common issue. Let's use STT/TTS approach instead.")
except Exception as e:
    print(f"✗ Error checking models: {e}")
