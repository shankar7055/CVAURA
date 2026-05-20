import os, json, time, copy
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1"
)

def _call_llm(prompt: str, max_retries: int = 3) -> str:
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5
            )
            return response.choices[0].message.content
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** (attempt + 1)
            time.sleep(wait_time)

def _parse_json_response(text: str) -> dict:
    """Strip markdown fences and parse JSON"""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


def _fix_summary(personal_info: dict, user_type: str, suggestions: list[str]) -> str:
    """Rewrite or create a professional summary"""
    current = personal_info.get("summary", "")
    prompt = f"""You are an expert resume writer. Rewrite (or create if empty) a professional summary for a "{user_type}" candidate.

Current summary: "{current}"
Name: {personal_info.get("name", "Candidate")}

Improvement suggestions to address:
{json.dumps(suggestions[:3])}

Rules:
- 2-3 sentences maximum
- Use strong action-oriented language
- For freshers: highlight technical skills, key projects, and career ambition
- For experienced: highlight years of experience, key achievements, and domain expertise
- Include quantifiable achievements if possible
- ATS-friendly — no special characters

Return ONLY the rewritten summary text as a plain string (no JSON, no quotes).
"""
    result = _call_llm(prompt)
    return result.strip().strip('"').strip("'")


def _fix_experience_bullets(experience: list[dict], user_type: str, suggestions: list[str]) -> list[dict]:
    """Rewrite experience bullets with quantification and strong verbs"""
    if not experience:
        return experience
    
    prompt = f"""You are an expert resume writer. Rewrite EVERY bullet point in the experience section.

Current experience:
{json.dumps(experience, indent=2)}

User type: {user_type}
Suggestions to address: {json.dumps(suggestions)}

Rules for EVERY bullet:
1. Start with a STRONG action verb (Led, Architected, Spearheaded, Delivered, Optimized, Reduced, Increased, Built, Designed, Implemented)
2. ADD quantifiable metrics where possible (%, $, users, time saved, team size). If none exist, add realistic estimates based on context.
3. Structure: "[Action Verb] [what you did] [using what technology/method], [resulting in quantifiable impact]"
4. Remove vague phrases like "Worked on", "Was responsible for", "Helped with"
5. Each bullet should be 1 line, impactful and specific
6. Keep the same number of bullets per experience entry

Return ONLY valid JSON — same structure as input (array of experience objects with title, company, period, bullets).
No markdown fences.
"""
    try:
        result = _call_llm(prompt)
        fixed = _parse_json_response(result)
        return fixed
    except Exception as e:
        print(f"Experience fix failed: {e}")
        return experience


def _fix_projects(projects: list[dict], user_type: str, suggestions: list[str]) -> list[dict]:
    """Enhance project descriptions with depth and metrics"""
    if not projects:
        return projects
    
    prompt = f"""You are an expert resume writer. Enhance EVERY project entry to be more impactful.

Current projects:
{json.dumps(projects, indent=2)}

User type: {user_type}
Suggestions: {json.dumps(suggestions)}

Rules:
1. Rewrite descriptions to highlight:
   - Problem solved and real-world impact
   - Technical complexity and architecture decisions
   - Scale/users/performance metrics (add realistic estimates if none exist)
2. Ensure tech_stack is comprehensive (add common complementary tools if obviously implied)
3. Each description should be 1-2 concise sentences
4. Use professional language, no first-person pronouns

Return ONLY valid JSON — same structure as input (array of project objects with name, description, tech_stack, link).
No markdown fences.
"""
    try:
        result = _call_llm(prompt)
        fixed = _parse_json_response(result)
        return fixed
    except Exception as e:
        print(f"Projects fix failed: {e}")
        return projects


def _fix_skills(skills: list[str], parsed: dict, user_type: str) -> list[str]:
    """Optimize skills list — add missing relevant skills, remove generic ones"""
    prompt = f"""You are a technical recruiter. Optimize this skills list for ATS.

Current skills: {json.dumps(skills)}
Experience titles: {[exp.get("title","") for exp in parsed.get("experience",[])]}
Project tech stacks: {[proj.get("tech_stack",[]) for proj in parsed.get("projects",[])]}
User type: {user_type}

Rules:
1. Keep all genuinely relevant skills
2. ADD skills that are clearly used in their projects/experience but missing from the skills list
3. REMOVE overly generic terms ("Problem Solving", "Team Player") — keep only technical/hard skills
4. Order by relevance — most important first
5. Include specific tool versions where implied (e.g., "React" → "React.js")
6. Maximum 25 skills

Return ONLY a JSON array of strings. No markdown.
"""
    try:
        result = _call_llm(prompt)
        fixed = _parse_json_response(result)
        return fixed if isinstance(fixed, list) else skills
    except Exception as e:
        print(f"Skills fix failed: {e}")
        return skills


def fix_all_resume(parsed_json: dict, user_type: str, 
                   score_parameters: list[dict], suggestions: list[str]) -> dict:
    """
    Fix all weak sections of the resume using AI.
    Returns the fixed parsed_json and a summary of changes.
    """
    original = copy.deepcopy(parsed_json)
    fixed = copy.deepcopy(parsed_json)
    changes = []
    
    # Identify weak areas from scores
    weak_areas = [p["label"] for p in score_parameters if p.get("score", 100) < 75]
    
    # 1. Always fix/improve summary
    try:
        old_summary = fixed.get("personal_info", {}).get("summary", "")
        new_summary = _fix_summary(fixed.get("personal_info", {}), user_type, suggestions)
        if new_summary and new_summary != old_summary:
            fixed["personal_info"]["summary"] = new_summary
            changes.append("Rewrote professional summary with stronger positioning and measurable highlights")
    except Exception as e:
        print(f"Summary fix failed: {e}")
    
    # Add delay to avoid rate limits
    time.sleep(1)
    
    # 2. Fix experience bullets if weak
    if fixed.get("experience") and any(
        area in weak_areas for area in [
            "Experience Quantification", "ATS Language", 
            "Keyword Match", "Leadership & Impact"
        ]
    ):
        try:
            new_exp = _fix_experience_bullets(fixed["experience"], user_type, suggestions)
            if new_exp:
                fixed["experience"] = new_exp
                changes.append("Enhanced all experience bullet points with action verbs, quantified metrics, and impact-driven language")
        except Exception as e:
            print(f"Experience fix failed: {e}")
    
    time.sleep(1)
    
    # 3. Fix projects if weak
    if fixed.get("projects") and any(
        area in weak_areas for area in [
            "Projects & GitHub", "Technical Depth", "Keyword Match"
        ]
    ):
        try:
            new_projects = _fix_projects(fixed["projects"], user_type, suggestions)
            if new_projects:
                fixed["projects"] = new_projects
                changes.append("Enhanced project descriptions with technical depth, metrics, and real-world impact")
        except Exception as e:
            print(f"Projects fix failed: {e}")
    
    time.sleep(1)
    
    # 4. Always optimize skills
    try:
        new_skills = _fix_skills(fixed.get("skills", []), fixed, user_type)
        if new_skills:
            old_count = len(fixed.get("skills", []))
            fixed["skills"] = new_skills
            changes.append(f"Optimized skills list ({old_count} → {len(new_skills)} skills) — added missing technical skills and removed generic terms")
    except Exception as e:
        print(f"Skills fix failed: {e}")
    
    if not changes:
        changes.append("Resume is already well-optimized. Minor formatting improvements applied.")
    
    return {
        "original_json": original,
        "fixed_json": fixed,
        "changes_summary": changes
    }
