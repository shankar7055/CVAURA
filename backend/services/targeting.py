import os, json
from sklearn.feature_extraction.text import TfidfVectorizer
from openai import OpenAI
from youtubesearchpython import VideosSearch
from services.scraper import scrape_and_analyze
from services.job_search import search_jobs

client = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1"
)

def _search_youtube_videos(skill: str, max_results: int = 3) -> list[dict]:
    try:
        search = VideosSearch(f"{skill} tutorial", limit=max_results)
        results = search.result()["result"]
        return [
            {
                "title": v["title"],
                "url": v["link"],
                "duration": v.get("duration", "N/A"),
                "channel": v.get("channel", {}).get("name", "Unknown"),
            }
            for v in results
        ]
    except Exception as e:
        print(f"YouTube search failed for {skill}: {e}")
        return []

def _resume_to_text(parsed: dict) -> str:
    parts = []
    pi = parsed.get("personal_info", {})
    parts.append(pi.get("summary", ""))
    for exp in parsed.get("experience", []):
        parts.append(exp.get("title", ""))
        parts.extend(exp.get("bullets", []))
    for proj in parsed.get("projects", []):
        parts.append(proj.get("description", ""))
        parts.extend(proj.get("tech_stack", []))
    parts.extend(parsed.get("skills", []))
    for cert in parsed.get("certifications", []):
        parts.append(cert.get("name", ""))
    return " ".join(filter(None, parts))

def _extract_skills_list(parsed: dict) -> list[str]:
    """Extract all skills from parsed resume for job matching"""
    skills = list(parsed.get("skills", []))
    for proj in parsed.get("projects", []):
        skills.extend(proj.get("tech_stack", []))
    return list(set(skills))

def _extract_missing_keywords(resume_text: str, jd_text: str, top_n: int = 15) -> list[str]:
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=200)
    vectorizer.fit([jd_text])
    jd_terms = set(vectorizer.get_feature_names_out())

    vectorizer2 = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    vectorizer2.fit([resume_text])
    resume_terms = set(vectorizer2.get_feature_names_out())

    missing = list(jd_terms - resume_terms)
    # rank by TF-IDF score in JD
    tfidf_matrix = vectorizer.transform([jd_text])
    feature_names = vectorizer.get_feature_names_out()
    scores = dict(zip(feature_names, tfidf_matrix.toarray()[0]))
    missing_scored = sorted(
        [(t, scores.get(t, 0)) for t in missing],
        key=lambda x: x[1], reverse=True
    )
    return [t for t, _ in missing_scored[:top_n]]

def _gemini_recommendations(resume_text: str, jd_text: str, missing_keywords: list[str], scraped_data: dict) -> dict:
    # Extract real requirements from scraped data
    real_reqs = scraped_data.get("real_job_requirements", {})
    dsa_recs = scraped_data.get("dsa_recommendations")
    
    prompt = f"""You are a senior career advisor with expertise in technical hiring. Analyze this resume against REAL job market data with precision.

REAL JOB REQUIREMENTS (from {scraped_data.get('analysis_sources', 1)} actual job postings):
- Required Skills: {json.dumps(real_reqs.get('required_skills', []))}
- Preferred Skills: {json.dumps(real_reqs.get('preferred_skills', []))}
- Tools/Technologies: {json.dumps(real_reqs.get('tools', []))}
- Experience Level: {real_reqs.get('experience_level', 'unknown')}
- Key Requirements: {json.dumps(real_reqs.get('key_requirements', []))}

Missing keywords from TF-IDF analysis: {json.dumps(missing_keywords)}

{f"DSA/CS FUNDAMENTALS ALERT: This is a {dsa_recs['category']} role. DSA skills are MANDATORY. Current status: {dsa_recs['current_status']}. Recommendation: {dsa_recs['recommendation']}" if dsa_recs else ""}

IMPORTANT RULES FOR LEARNING PATHS:
1. Provide REAL, VERIFIED course URLs only. Use these known platforms:
   - Coursera: https://www.coursera.org/learn/[course-slug]
   - Udemy: https://www.udemy.com/course/[course-slug]/
   - freeCodeCamp: https://www.freecodecamp.org/learn/[path]
   - LeetCode: https://leetcode.com/problemset/
   - HackerRank: https://www.hackerrank.com/domains/[domain]
   - MIT OCW: https://ocw.mit.edu/courses/
   - Khan Academy: https://www.khanacademy.org/computing/
2. If you're not sure of the exact URL, use the platform's main search page
3. Duration estimates must be realistic (e.g., "2-4 weeks at 5 hrs/week")
4. Order learning paths by priority — most critical gaps first
5. Each skill gap assessment must be backed by specific evidence from the JD

Return ONLY valid JSON (no markdown) with this structure:
{{
  "missing_keywords": ["..."],
  "skill_gaps": [
    {{
      "skill": "...",
      "current_level": 0-100,
      "required_level": 0-100,
      "priority": "Critical | High | Medium | Low",
      "learning_path": {{
        "title": "Course/resource name",
        "platform": "Coursera | YouTube | Udemy | LeetCode | freeCodeCamp",
        "url": "https://verified-url-to-course",
        "duration": "Realistic time estimate"
      }},
      "project_suggestion": "One specific project idea with tech stack to demonstrate this skill.",
      "industry_demand": "Why this skill is critical — cite specific JD requirements"
    }}
  ],
  "dsa_requirements": {{
    "needed": true/false,
    "platforms": ["LeetCode", "HackerRank", ...],
    "target_problems": "e.g., 150+ problems (50 Easy, 80 Medium, 20 Hard)",
    "topics": ["Arrays", "DP", ...],
    "current_status": "Has DSA mentioned: yes/no, Platforms mentioned: [...]"
  }},
  "cs_fundamentals": {{
    "required": ["OS", "DBMS", "Networks", "OOP", ...],
    "missing": ["..."]
  }},
  "strengths": ["Based on real job requirements, what candidate has..."],
  "weaknesses": ["Critical gaps based on actual job postings..."],
  "competitive_edge": ["What will make candidate stand out..."]
}}

JOB DESCRIPTION:
{jd_text[:3000]}

RESUME:
{resume_text[:2000]}
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    data = json.loads(text)
    return data


async def analyze_target(parsed: dict, target: str, job_title: str = "", company: str = "") -> dict:
    resume_text = _resume_to_text(parsed)
    resume_skills = _extract_skills_list(parsed)
    missing = _extract_missing_keywords(resume_text, target)
    
    # Scrape real job data from LinkedIn and job boards
    scraped_data = await scrape_and_analyze(job_title, company, resume_text, target)
    
    # Generate AI recommendations with real market data
    recommendations = _gemini_recommendations(resume_text, target, missing, scraped_data)
    
    # Add YouTube videos for each skill gap
    for gap in recommendations.get("skill_gaps", []):
        videos = _search_youtube_videos(gap["skill"])
        gap["youtube_videos"] = videos
    
    # Search for real job postings the candidate can apply to
    job_suggestions = []
    if job_title:
        job_suggestions = await search_jobs(
            job_title=job_title, 
            company=company, 
            resume_skills=resume_skills,
            resume_text=resume_text,
            max_results=15
        )
    
    # Merge scraped data with recommendations
    return {
        **recommendations,
        "market_insights": {
            "similar_jobs_analyzed": scraped_data.get("similar_jobs_found", 0),
            "data_sources": scraped_data.get("analysis_sources", 1),
            "linkedin_jobs": scraped_data.get("linkedin_jobs", []),
            "similar_profiles": scraped_data.get("similar_profiles", []),
            "real_requirements": scraped_data.get("real_job_requirements", {})
        },
        "dsa_analysis": scraped_data.get("dsa_recommendations"),
        "job_suggestions": job_suggestions
    }
