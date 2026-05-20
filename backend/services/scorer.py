import os, json, time
from openai import OpenAI
from schemas import ParsedResume, ScoreParameter, ScoreResponse

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

FRESHER_PARAMS = [
    {"label": "Keyword Match",              "weight": 15},
    {"label": "Education Alignment",        "weight": 20},
    {"label": "Hackathons / Awards",        "weight": 10},
    {"label": "Projects & GitHub",          "weight": 15},
    {"label": "Certifications",             "weight": 10},
    {"label": "ATS Language",               "weight": 10},
    {"label": "Soft Skills",                "weight": 10},
    {"label": "LinkedIn Profile",           "weight": 10},
]

EXPERIENCED_PARAMS = [
    {"label": "Keyword Match",              "weight": 15},
    {"label": "Experience Quantification",  "weight": 20},
    {"label": "Role Progression",           "weight": 10},
    {"label": "Technical Depth",            "weight": 15},
    {"label": "Leadership & Impact",        "weight": 10},
    {"label": "ATS Language",               "weight": 10},
    {"label": "Industry Alignment",         "weight": 10},
    {"label": "Certifications",             "weight": 10},
]

FRESHER_RUBRIC = """
SCORING RUBRIC FOR FRESHERS:
- Keyword Match: Check for industry-relevant keywords (programming languages, frameworks, tools). Penalize resumes with only generic terms.
- Education Alignment: GPA quality (>8.5 = strong), relevant coursework, university tier. Don't penalize for empty experience.
- Hackathons / Awards: National-level > university-level. Winning/top placement > participation. Count and quality matter.
- Projects & GitHub: Evaluate project DEPTH — tech stack diversity, real-world applicability, problem complexity, GitHub activity. 1-2 deep projects > 5 trivial ones.
- Certifications: Relevance to target field. Industry-recognized (AWS, Google, Microsoft) > generic certificates. Recency matters.
- ATS Language: Action verbs (Built, Developed, Designed, Implemented), no special characters/tables, clean formatting, no first-person pronouns.
- Soft Skills: Communication, teamwork, leadership evidence from clubs, volunteering, or project descriptions. Must be demonstrated, not just listed.
- LinkedIn Profile: Presence of LinkedIn URL. Bonus if GitHub is also provided.

QUANTIFICATION RULES FOR FRESHERS:
- Projects MUST mention: users served, performance metrics, tech stack specifics, deployment status
- If bullets lack numbers (users, %, time saved), penalize "Projects & GitHub" score by 15-20 points
- If hackathon entries lack award details or competition scale, penalize accordingly
"""

EXPERIENCED_RUBRIC = """
SCORING RUBRIC FOR EXPERIENCED PROFESSIONALS:
- Keyword Match: Must contain role-specific technical keywords, not just generic buzzwords. Check depth of keyword usage in context.
- Experience Quantification: CRITICAL — Every bullet point should ideally have numbers (revenue %, users impacted, cost saved $, team size led, latency reduced ms, uptime %). Vague bullets like "Worked on backend" score LOW. "Reduced API latency by 40% serving 2M daily users" scores HIGH.
- Role Progression: Evidence of career growth — title changes (Junior→Senior→Lead), increasing responsibility scope, promotions mentioned.
- Technical Depth: Specific technologies with version/context, architecture decisions, system design mentions, scale indicators (distributed systems, microservices).
- Leadership & Impact: Team management ("Led team of 5"), cross-functional work, mentoring, driving initiatives, P&L responsibility.
- ATS Language: Strong verbs (Spearheaded, Architected, Championed, Delivered, Scaled), professional tone, no first-person, no graphics references.
- Industry Alignment: Resume matches target industry conventions and terminology.
- Certifications: Professional certifications relevant to seniority level (e.g., AWS Solutions Architect, PMP, Scrum Master).

QUANTIFICATION RULES FOR EXPERIENCED:
- Each experience bullet MUST be checked for: specific numbers, impact metrics, scope indicators
- Score 90+ ONLY if >70% of bullets contain quantified results
- Score <50 if bullets are purely descriptive without metrics
- Leadership score requires explicit team size, budget, or organizational scope
"""

def _build_score_prompt(parsed: dict, user_type: str, params: list[dict]) -> str:
    param_list = "\n".join(f'- "{p["label"]}" (weight {p["weight"]}%)' for p in params)
    rubric = FRESHER_RUBRIC if user_type == "fresher" else EXPERIENCED_RUBRIC
    
    return f"""You are an expert ATS resume evaluator with 15 years of experience in technical recruiting.

Analyze the resume JSON below for a "{user_type}" candidate with EXTREME PRECISION.

{rubric}

For EACH parameter:
1. Score 0-100 based on the rubric above (be strict and honest, not generous)
2. Write a clear, specific "feedback" sentence (what's wrong and how to fix it)
3. Write a detailed "reasoning" paragraph (2-3 sentences explaining WHY you gave that score — cite specific resume content)

Return ONLY valid JSON as an array:
[{{"label":"...","score":0-100,"weight":0-100,"feedback":"One actionable sentence.","reasoning":"Detailed 2-3 sentence explanation citing specific resume content."}}]

Parameters to score:
{param_list}

RESUME JSON:
{json.dumps(parsed, indent=2)}

Return ONLY the JSON array, no markdown fences.
"""

def _build_suggestions_prompt(parsed: dict, user_type: str, parameters: list[dict]) -> str:
    scores_summary = "\n".join(
        f'- {p["label"]}: {p["score"]}/100 — {p["feedback"]}' 
        for p in parameters
    )
    
    return f"""You are a career coach reviewing a "{user_type}" candidate's resume ATS score results.

SCORE BREAKDOWN:
{scores_summary}

RESUME JSON:
{json.dumps(parsed, indent=2)[:3000]}

Based on the weak areas (scores below 80), generate exactly 6-7 SPECIFIC, ACTIONABLE improvement suggestions.

Rules:
- Each suggestion must be concrete and implementable (not vague like "improve your resume")
- Reference specific sections of the resume
- Prioritize by impact — most impactful suggestion first
- For freshers: focus on project depth, quantification, and skill demonstration
- For experienced: focus on metrics, impact quantification, and leadership signals

Return ONLY a JSON array of strings:
["Suggestion 1", "Suggestion 2", ...]

Return ONLY the JSON array, no markdown.
"""

def compute_score(parsed: dict, user_type: str) -> ScoreResponse:
    params = FRESHER_PARAMS if user_type == "fresher" else EXPERIENCED_PARAMS
    
    # Step 1: Score each parameter with detailed reasoning
    prompt = _build_score_prompt(parsed, user_type, params)
    response_text = _call_grok_with_retry(prompt)
    text = response_text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    items = json.loads(text)
    parameters = [ScoreParameter(**item) for item in items]
    overall = round(sum(p.score * p.weight / 100 for p in parameters))
    
    # Step 2: Generate actionable suggestions based on scores
    try:
        suggestions_prompt = _build_suggestions_prompt(
            parsed, user_type, 
            [{"label": p.label, "score": p.score, "feedback": p.feedback} for p in parameters]
        )
        suggestions_text = _call_grok_with_retry(suggestions_prompt)
        sug_text = suggestions_text.strip()
        if sug_text.startswith("```"):
            sug_text = sug_text.split("```")[1]
            if sug_text.startswith("json"):
                sug_text = sug_text[4:]
        suggestions = json.loads(sug_text)
    except Exception as e:
        print(f"Suggestions generation failed: {e}")
        suggestions = []
    
    return ScoreResponse(
        overall_score=overall, 
        parameters=parameters,
        suggestions=suggestions
    )
