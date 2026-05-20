import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.environ["GROK_API_KEY"],
    base_url="https://api.x.ai/v1"
)

try:
    response = client.chat.completions.create(
        model="grok-2-latest",
        messages=[{"role": "user", "content": "Say hello"}],
        temperature=0.3
    )
    print("✅ SUCCESS!")
    print(f"Model: grok-2-latest")
    print(f"Response: {response.choices[0].message.content}")
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("\nTrying to list available models...")
    try:
        models = client.models.list()
        print("Available models:")
        for model in models.data:
            print(f"  - {model.id}")
    except Exception as e2:
        print(f"Could not list models: {e2}")
