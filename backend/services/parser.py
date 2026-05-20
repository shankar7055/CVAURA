import os, json, time, fitz
from openai import OpenAI
from schemas import ParsedResume

client = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1"
)

def _call_grok_with_retry(prompt: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt
            time.sleep(wait_time)

SCHEMA_PROMPT = """
Extract resume data from the text below and return ONLY valid JSON matching this schema exactly:
{
  "personal_info": {"name","email","phone","location","linkedin","github","summary"},
  "education":     [{"degree","school","year","gpa"}],
  "experience":    [{"title","company","period","bullets":[]}],
  "projects":      [{"name","description","tech_stack":[],"link"}],
  "hackathons":    [{"name","award","year"}],
  "skills":        [],
  "certifications":[{"name","issuer","year"}]
}
Use empty strings / empty arrays for missing fields. Return ONLY the JSON object, no markdown.

RESUME TEXT:
"""

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    return "\n".join(page.get_text() for page in doc)

def extract_text_from_docx(file_bytes: bytes) -> str:
    # fallback: treat as raw bytes and decode what we can
    import io
    try:
        import zipfile, xml.etree.ElementTree as ET
        z = zipfile.ZipFile(io.BytesIO(file_bytes))
        xml_content = z.read("word/document.xml")
        tree = ET.fromstring(xml_content)
        ns = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
        return " ".join(node.text for node in tree.iter(f"{ns}t") if node.text)
    except Exception:
        return file_bytes.decode("utf-8", errors="ignore")

def structure_resume(raw_text: str) -> ParsedResume:
    response_text = _call_grok_with_retry(SCHEMA_PROMPT + raw_text)
    text = response_text.strip()
    # strip markdown fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    data = json.loads(text)
    return ParsedResume(**data)
