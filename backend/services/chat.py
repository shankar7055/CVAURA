import os, json
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1"
)

SYSTEM_PROMPT = """You are an expert career coach and ATS resume specialist.
When asked to edit a resume section:
1. Use strong action verbs (Led, Architected, Spearheaded, Delivered, Optimized).
2. Add quantifiable metrics wherever possible (%, $, users, time saved).
3. Keep language ATS-friendly — avoid tables, graphics references, or special characters.
4. Return a JSON object with two keys:
   - "updated_section": the rewritten section data (same structure as input)
   - "message": a short conversational explanation of what you changed
Return ONLY valid JSON, no markdown fences."""

def chat_edit(prompt: str, section_key: str, section_data, history: list[dict]) -> dict:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for turn in history:
        messages.append({
            "role": turn["role"],
            "content": turn["content"]
        })

    user_msg = (
        f'Edit the "{section_key}" section of my resume.\n'
        f"Current data:\n{json.dumps(section_data, indent=2)}\n\n"
        f"Instruction: {prompt}"
    )
    messages.append({"role": "user", "content": user_msg})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)
