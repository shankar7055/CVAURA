import os, json, re
from openai import OpenAI
from bs4 import BeautifulSoup
import httpx
from typing import Optional

client = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1"
)

# DSA/CS Fundamentals requirements for software roles
DSA_REQUIREMENTS = {
    "software_intern": {
        "must_have": ["Data Structures", "Algorithms", "Problem Solving", "LeetCode/HackerRank"],
        "platforms": ["LeetCode", "HackerRank", "CodeChef", "Codeforces"],
        "topics": ["Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Sorting", "Searching"],
        "recommendation": "For software intern roles, strong DSA skills are MANDATORY. Aim for 150+ LeetCode problems (Easy: 50, Medium: 80, Hard: 20). Focus on CS fundamentals: OS, DBMS, Networks, OOP."
    },
    "software_engineer": {
        "must_have": ["Advanced DSA", "System Design Basics", "Competitive Programming", "LeetCode Medium/Hard"],
        "platforms": ["LeetCode", "HackerRank", "GeeksforGeeks"],
        "topics": ["Advanced Trees", "Graphs", "DP", "Greedy", "Backtracking", "Bit Manipulation", "Segment Trees"],
        "recommendation": "Software Engineer roles require 200+ LeetCode problems with focus on Medium/Hard. Master system design basics, HLD/LLD concepts, and CS fundamentals."
    },
    "sde": {
        "must_have": ["Expert DSA", "System Design", "Competitive Programming", "LeetCode Hard"],
        "platforms": ["LeetCode", "Codeforces", "AtCoder"],
        "topics": ["Advanced DP", "Graph Algorithms", "Advanced Data Structures", "System Design Patterns"],
        "recommendation": "SDE positions demand 300+ LeetCode problems including Hard problems. Deep system design knowledge (HLD/LLD), scalability, and distributed systems expertise required."
    }
}

def _detect_software_role(job_title: str, jd_text: str) -> Optional[str]:
    """Detect if role is software-related and return category"""
    job_lower = (job_title + " " + jd_text).lower()
    
    if any(kw in job_lower for kw in ["intern", "internship", "trainee"]):
        return "software_intern"
    elif any(kw in job_lower for kw in ["sde", "software development engineer"]):
        return "sde"
    elif any(kw in job_lower for kw in ["software engineer", "developer", "backend", "frontend", "full stack", "fullstack"]):
        return "software_engineer"
    
    return None

def _check_dsa_presence(resume_text: str) -> dict:
    """Check if resume mentions DSA/competitive programming"""
    resume_lower = resume_text.lower()
    
    platforms_mentioned = []
    for platform in ["leetcode", "hackerrank", "codechef", "codeforces", "geeksforgeeks", "atcoder"]:
        if platform in resume_lower:
            platforms_mentioned.append(platform.title())
    
    dsa_keywords = ["data structures", "algorithms", "dsa", "competitive programming", "problem solving"]
    dsa_mentioned = any(kw in resume_lower for kw in dsa_keywords)
    
    return {
        "has_dsa": dsa_mentioned,
        "platforms": platforms_mentioned,
        "needs_improvement": not dsa_mentioned or len(platforms_mentioned) == 0
    }

async def _scrape_linkedin_jobs(job_title: str, company: str, max_results: int = 5) -> list[dict]:
    """Scrape LinkedIn job postings (simplified - uses search)"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        # Use LinkedIn job search URL
        search_query = f"{job_title} {company}".replace(" ", "%20")
        url = f"https://www.linkedin.com/jobs/search/?keywords={search_query}"
        
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract job cards
            jobs = []
            job_cards = soup.find_all('div', class_='base-card', limit=max_results)
            
            for card in job_cards:
                title_elem = card.find('h3', class_='base-search-card__title')
                company_elem = card.find('h4', class_='base-search-card__subtitle')
                link_elem = card.find('a', class_='base-card__full-link')
                
                if title_elem and link_elem:
                    jobs.append({
                        "title": title_elem.text.strip(),
                        "company": company_elem.text.strip() if company_elem else company,
                        "url": link_elem.get('href', ''),
                        "source": "LinkedIn"
                    })
            
            return jobs
    except Exception as e:
        print(f"LinkedIn scraping failed: {e}")
        return []

async def _scrape_job_description(url: str) -> str:
    """Fetch job description from URL"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                return ""
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try common job description containers
            jd_containers = [
                soup.find('div', class_='description'),
                soup.find('div', class_='job-description'),
                soup.find('section', class_='description'),
                soup.find('div', {'id': 'job-details'}),
            ]
            
            for container in jd_containers:
                if container:
                    return container.get_text(separator=' ', strip=True)
            
            return soup.get_text(separator=' ', strip=True)[:5000]
    except Exception as e:
        print(f"JD scraping failed: {e}")
        return ""

async def _scrape_linkedin_profiles(job_title: str, company: str, max_results: int = 3) -> list[dict]:
    """Scrape LinkedIn profiles of people with similar roles (simplified)"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        # LinkedIn people search
        search_query = f"{job_title} {company}".replace(" ", "%20")
        url = f"https://www.linkedin.com/search/results/people/?keywords={search_query}"
        
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            profiles = []
            profile_cards = soup.find_all('li', class_='reusable-search__result-container', limit=max_results)
            
            for card in profile_cards:
                name_elem = card.find('span', {'aria-hidden': 'true'})
                title_elem = card.find('div', class_='entity-result__primary-subtitle')
                
                if name_elem:
                    profiles.append({
                        "name": name_elem.text.strip(),
                        "title": title_elem.text.strip() if title_elem else job_title,
                        "company": company
                    })
            
            return profiles
    except Exception as e:
        print(f"Profile scraping failed: {e}")
        return []

def _extract_skills_from_jds(jd_texts: list[str]) -> dict:
    """Extract common skills and requirements from multiple JDs using AI"""
    combined_jds = "\n\n---\n\n".join(jd_texts[:3])  # Use top 3 JDs
    
    prompt = f"""
Analyze these real job descriptions and extract:
1. Most frequently mentioned technical skills
2. Required experience level
3. Must-have qualifications
4. Nice-to-have skills
5. Common tools/technologies

Return ONLY valid JSON:
{{
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", "skill2", ...],
  "tools": ["tool1", "tool2", ...],
  "experience_level": "entry/mid/senior",
  "key_requirements": ["req1", "req2", ...]
}}

JOB DESCRIPTIONS:
{combined_jds[:4000]}
"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"Skill extraction failed: {e}")
        return {
            "required_skills": [],
            "preferred_skills": [],
            "tools": [],
            "experience_level": "unknown",
            "key_requirements": []
        }

async def scrape_and_analyze(
    job_title: str,
    company: str,
    resume_text: str,
    jd_text: str
) -> dict:
    """
    Main function: Scrape LinkedIn + job boards, analyze real requirements
    """
    
    # 1. Check if software role and DSA requirements
    role_category = _detect_software_role(job_title, jd_text)
    dsa_check = _check_dsa_presence(resume_text)
    
    dsa_recommendations = None
    if role_category and dsa_check["needs_improvement"]:
        dsa_req = DSA_REQUIREMENTS[role_category]
        dsa_recommendations = {
            "category": role_category,
            "must_have": dsa_req["must_have"],
            "platforms": dsa_req["platforms"],
            "topics": dsa_req["topics"],
            "recommendation": dsa_req["recommendation"],
            "current_status": dsa_check
        }
    
    # 2. Scrape LinkedIn jobs
    linkedin_jobs = await _scrape_linkedin_jobs(job_title, company)
    
    # 3. Scrape job descriptions
    jd_texts = [jd_text]  # Start with user-provided JD
    for job in linkedin_jobs[:2]:  # Scrape top 2 additional JDs
        if job.get("url"):
            scraped_jd = await _scrape_job_description(job["url"])
            if scraped_jd:
                jd_texts.append(scraped_jd)
    
    # 4. Extract common skills from real JDs
    real_requirements = _extract_skills_from_jds(jd_texts)
    
    # 5. Scrape LinkedIn profiles (for reference)
    profiles = await _scrape_linkedin_profiles(job_title, company)
    
    return {
        "dsa_recommendations": dsa_recommendations,
        "real_job_requirements": real_requirements,
        "similar_jobs_found": len(linkedin_jobs),
        "linkedin_jobs": linkedin_jobs[:3],
        "similar_profiles": profiles,
        "analysis_sources": len(jd_texts)
    }
