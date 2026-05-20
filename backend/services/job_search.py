import os, json, time
from openai import OpenAI
import httpx
from typing import Optional

client = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1"
)


def _generate_search_variations(job_title: str, resume_skills: list[str]) -> list[str]:
    """Generate alternate search queries to find broader job matches"""
    variations = [job_title]
    
    title_lower = job_title.lower()
    
    # Role-level variations
    role_mappings = {
        "software engineer": ["backend developer", "full stack developer", "software developer", "application engineer"],
        "software developer": ["software engineer", "backend developer", "full stack developer", "web developer"],
        "frontend developer": ["react developer", "UI developer", "web developer", "frontend engineer"],
        "backend developer": ["backend engineer", "server-side developer", "API developer", "software engineer"],
        "full stack developer": ["software engineer", "web developer", "full stack engineer", "application developer"],
        "data scientist": ["machine learning engineer", "data analyst", "AI engineer", "research scientist"],
        "data analyst": ["business analyst", "data scientist", "analytics engineer", "BI analyst"],
        "devops engineer": ["SRE", "cloud engineer", "platform engineer", "infrastructure engineer"],
        "cloud engineer": ["devops engineer", "AWS engineer", "platform engineer", "infrastructure engineer"],
        "ml engineer": ["machine learning engineer", "AI engineer", "data scientist", "deep learning engineer"],
        "sde": ["software engineer", "software developer", "application developer"],
        "sde intern": ["software engineering intern", "developer intern", "engineering intern"],
        "product manager": ["program manager", "technical program manager", "product owner"],
        "qa engineer": ["test engineer", "SDET", "quality assurance engineer", "automation engineer"],
        "cybersecurity": ["security engineer", "security analyst", "information security", "SOC analyst"],
    }
    
    for key, alts in role_mappings.items():
        if key in title_lower:
            variations.extend(alts[:3])
            break
    
    # Skill-based search queries (use top skills for broader matches)
    if resume_skills:
        top_skills = resume_skills[:5]
        # Create skill-based queries like "Python developer", "React engineer"
        for skill in top_skills[:3]:
            skill_lower = skill.lower()
            if skill_lower not in title_lower and len(skill_lower) > 2:
                variations.append(f"{skill} developer")
    
    # Remove duplicates while preserving order
    seen = set()
    unique = []
    for v in variations:
        v_lower = v.lower().strip()
        if v_lower not in seen:
            seen.add(v_lower)
            unique.append(v)
    
    return unique[:6]  # Max 6 variations


async def _search_remotive(job_title: str, limit: int = 15) -> list[dict]:
    """Search Remotive API for remote jobs — completely free, no key needed"""
    try:
        search_term = job_title.lower().replace(" ", "+")
        url = f"https://remotive.com/api/remote-jobs?search={search_term}&limit={limit}"
        
        async with httpx.AsyncClient(timeout=10.0) as client_http:
            response = await client_http.get(url)
            if response.status_code != 200:
                return []
            
            data = response.json()
            jobs = []
            for job in data.get("jobs", [])[:limit]:
                jobs.append({
                    "title": job.get("title", ""),
                    "company": job.get("company_name", ""),
                    "location": job.get("candidate_required_location", "Remote"),
                    "apply_url": job.get("url", ""),
                    "source": "Remotive",
                    "salary": job.get("salary", ""),
                    "posted": job.get("publication_date", "")[:10] if job.get("publication_date") else "",
                    "tags": job.get("tags", []),
                    "description": job.get("description", "")[:500],
                })
            return jobs
    except Exception as e:
        print(f"Remotive search failed: {e}")
        return []


async def _search_arbeitnow(job_title: str, limit: int = 15) -> list[dict]:
    """Search Arbeitnow API — free, no key needed"""
    try:
        search_term = job_title.replace(" ", "+")
        url = f"https://www.arbeitnow.com/api/job-board-api?search={search_term}"
        
        async with httpx.AsyncClient(timeout=10.0) as client_http:
            response = await client_http.get(url)
            if response.status_code != 200:
                return []
            
            data = response.json()
            jobs = []
            for job in data.get("data", [])[:limit]:
                jobs.append({
                    "title": job.get("title", ""),
                    "company": job.get("company_name", ""),
                    "location": job.get("location", ""),
                    "apply_url": job.get("url", ""),
                    "source": "Arbeitnow",
                    "salary": "",
                    "posted": job.get("created_at", "")[:10] if job.get("created_at") else "",
                    "tags": job.get("tags", []),
                    "description": job.get("description", "")[:500] if job.get("description") else "",
                })
            return jobs
    except Exception as e:
        print(f"Arbeitnow search failed: {e}")
        return []


async def _search_linkedin_public(job_title: str, company: str = "", limit: int = 10) -> list[dict]:
    """Scrape LinkedIn public job search — best effort, may fail due to rate limits"""
    try:
        from bs4 import BeautifulSoup
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        search_query = f"{job_title} {company}".strip().replace(" ", "%20")
        url = f"https://www.linkedin.com/jobs/search/?keywords={search_query}&position=1&pageNum=0"
        
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client_http:
            response = await client_http.get(url, headers=headers)
            if response.status_code != 200:
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            jobs = []
            job_cards = soup.find_all('div', class_='base-card', limit=limit)
            
            for card in job_cards:
                title_elem = card.find('h3', class_='base-search-card__title')
                company_elem = card.find('h4', class_='base-search-card__subtitle')
                location_elem = card.find('span', class_='job-search-card__location')
                link_elem = card.find('a', class_='base-card__full-link')
                
                if title_elem and link_elem:
                    jobs.append({
                        "title": title_elem.text.strip(),
                        "company": company_elem.text.strip() if company_elem else company,
                        "location": location_elem.text.strip() if location_elem else "",
                        "apply_url": link_elem.get('href', ''),
                        "source": "LinkedIn",
                        "salary": "",
                        "posted": "",
                        "tags": [],
                        "description": "",
                    })
            
            return jobs
    except Exception as e:
        print(f"LinkedIn search failed: {e}")
        return []


def _score_job_match_advanced(job: dict, resume_skills: list[str], 
                              job_title: str, resume_text: str) -> int:
    """
    Advanced match scoring that considers:
    - Title relevance (semantic, not just keyword overlap)
    - Skill alignment depth
    - Seniority level match
    - Description keyword overlap
    - Accessibility (ease of getting selected)
    """
    score = 0
    job_text = f"{job['title']} {' '.join(job.get('tags', []))} {job.get('description', '')}".lower()
    title_lower = job_title.lower()
    job_title_lower = job["title"].lower()
    
    # ── 1. Title Relevance (30 pts) ──
    # Exact/partial match
    title_words = set(title_lower.split())
    job_words = set(job_title_lower.split())
    common_words = title_words & job_words
    # Ignore filler words
    filler = {"and", "or", "the", "a", "an", "in", "at", "for", "of", "-", "/", "&"}
    meaningful_common = common_words - filler
    meaningful_title = title_words - filler
    
    if meaningful_title:
        title_score = len(meaningful_common) / len(meaningful_title)
        score += int(30 * min(1.0, title_score))
    
    # Synonym/related role bonus
    related_pairs = [
        ({"software", "engineer"}, {"developer", "programmer", "sde"}),
        ({"frontend"}, {"react", "angular", "vue", "ui"}),
        ({"backend"}, {"server", "api", "node", "django", "flask"}),
        ({"data", "scientist"}, {"ml", "machine", "learning", "ai"}),
        ({"devops"}, {"sre", "cloud", "platform", "infrastructure"}),
        ({"full", "stack"}, {"fullstack", "web", "mern", "mean"}),
    ]
    for group_a, group_b in related_pairs:
        if (group_a & title_words) and (group_b & job_words):
            score += 8
            break
        if (group_b & title_words) and (group_a & job_words):
            score += 8
            break
    
    # ── 2. Skill Match (35 pts) ──
    resume_skills_lower = [s.lower() for s in resume_skills[:20]]
    matched_skills = 0
    total_check = min(len(resume_skills_lower), 15)
    
    for skill in resume_skills_lower[:total_check]:
        # Check in title, tags, and description
        if skill in job_text:
            matched_skills += 1
        # Also check partial matches (e.g., "react" in "react.js")
        elif any(skill in tag.lower() for tag in job.get("tags", [])):
            matched_skills += 0.7
    
    if total_check > 0:
        skill_ratio = matched_skills / total_check
        score += int(35 * min(1.0, skill_ratio * 1.3))  # Slightly generous
    
    # ── 3. Seniority Match (15 pts) ──
    # Check if job seniority matches candidate
    junior_keywords = {"intern", "junior", "entry", "trainee", "fresher", "graduate", "associate"}
    mid_keywords = {"mid", "intermediate", "2+", "3+"}
    senior_keywords = {"senior", "lead", "principal", "staff", "manager", "director", "head", "5+", "7+", "10+"}
    
    resume_lower = resume_text.lower()
    candidate_is_junior = any(kw in resume_lower for kw in {"intern", "fresher", "graduate", "entry"})
    candidate_is_senior = any(kw in resume_lower for kw in {"senior", "lead", "principal", "manager"})
    
    job_is_junior = any(kw in job_title_lower for kw in junior_keywords)
    job_is_senior = any(kw in job_title_lower for kw in senior_keywords)
    
    if candidate_is_junior and job_is_junior:
        score += 15  # Perfect seniority match
    elif candidate_is_senior and job_is_senior:
        score += 15
    elif not job_is_senior and not job_is_junior:
        score += 10  # Mid-level — generally accessible
    elif candidate_is_junior and not job_is_senior:
        score += 8   # Junior applying to non-senior role
    else:
        score += 3   # Mismatch
    
    # ── 4. Accessibility Bonus (10 pts) ──
    # Roles that are easier to access get a small bonus
    easy_indicators = {"remote", "worldwide", "anywhere", "no experience", "entry level", "open to all"}
    if any(ind in job_text for ind in easy_indicators):
        score += 10
    elif "remote" in job.get("location", "").lower():
        score += 7
    
    # ── 5. Freshness & Quality (10 pts) ──
    if job.get("salary"):
        score += 4
    if job.get("posted"):
        score += 3
    if job["source"] == "LinkedIn":
        score += 3
    elif job["source"] == "Remotive":
        score += 2
    
    return min(100, max(5, score))


async def search_jobs(job_title: str, company: str = "", 
                      resume_skills: list[str] = [], resume_text: str = "",
                      max_results: int = 15) -> list[dict]:
    """
    Search multiple free job APIs with varied queries and return top ranked results.
    Uses search variations to find broader matches beyond the exact job title.
    """
    all_jobs = []
    search_queries = _generate_search_variations(job_title, resume_skills)
    
    print(f"[JobSearch] Searching with {len(search_queries)} query variations: {search_queries}")
    
    # Search each variation across all APIs
    for i, query in enumerate(search_queries):
        # Remotive — search every variation
        remotive_jobs = await _search_remotive(query, limit=10)
        all_jobs.extend(remotive_jobs)
        
        # Arbeitnow — search every variation
        arbeitnow_jobs = await _search_arbeitnow(query, limit=10)
        all_jobs.extend(arbeitnow_jobs)
        
        # LinkedIn — only for first 2 queries (rate limit sensitive)
        if i < 2:
            linkedin_jobs = await _search_linkedin_public(
                query, company if i == 0 else "", limit=10
            )
            all_jobs.extend(linkedin_jobs)
    
    print(f"[JobSearch] Total raw results: {len(all_jobs)}")
    
    # Score with advanced matching
    for job in all_jobs:
        job["match_score"] = _score_job_match_advanced(
            job, resume_skills, job_title, resume_text
        )
    
    # Deduplicate by title+company (normalized)
    seen = set()
    unique_jobs = []
    for job in all_jobs:
        key = f"{job['title'].lower().strip()}|{job['company'].lower().strip()}"
        if key not in seen and job.get("apply_url"):
            seen.add(key)
            unique_jobs.append(job)
    
    # Sort by match score descending
    unique_jobs.sort(key=lambda j: j["match_score"], reverse=True)
    
    # Clean up internal fields
    for job in unique_jobs:
        job.pop("tags", None)
        job.pop("description", None)
    
    print(f"[JobSearch] Unique results: {len(unique_jobs)}, returning top {max_results}")
    
    return unique_jobs[:max_results]
