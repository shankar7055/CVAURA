import os, uuid
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from db import get_supabase
from schemas import ScoreRequest, ScoreResponse, ChatRequest, ChatResponse, TargetRequest, FixAllRequest, FixAllResponse
from services.parser import extract_text_from_pdf, extract_text_from_docx, structure_resume
from services.scorer import compute_score
from services.chat import chat_edit
from services.targeting import analyze_target
from services.pdf_generator import generate_resume_pdf
from services.fixer import fix_all_resume

app = FastAPI(title="CvAura API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BUCKET = "resumes"

# ── 1. INGESTION ENGINE ──────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_type: str = Form(...),          # "fresher" | "experienced"
):
    if user_type not in ("fresher", "experienced"):
        raise HTTPException(400, "user_type must be 'fresher' or 'experienced'")

    file_bytes = await file.read()
    filename = file.filename or "resume"
    ext = filename.rsplit(".", 1)[-1].lower()

    # Extract raw text
    if ext == "pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        raw_text = extract_text_from_docx(file_bytes)
    else:
        raise HTTPException(400, "Only PDF and DOCX files are supported")

    # Structure via Gemini
    parsed = structure_resume(raw_text)

    sb = get_supabase()

    # Create session
    session_id = str(uuid.uuid4())
    sb.table("sessions").insert({"id": session_id, "user_type": user_type}).execute()

    # Upload raw file to Supabase Storage
    storage_path = f"{session_id}/{filename}"
    sb.storage.from_(BUCKET).upload(storage_path, file_bytes, {"content-type": file.content_type})
    storage_url = sb.storage.from_(BUCKET).get_public_url(storage_path)

    # Save resume record
    resume_id = str(uuid.uuid4())
    sb.table("resumes").insert({
        "id": resume_id,
        "session_id": session_id,
        "storage_url": storage_url,
        "parsed_json": parsed.model_dump(),
    }).execute()

    return {
        "session_id": session_id,
        "resume_id": resume_id,
        "storage_url": storage_url,
        "parsed_json": parsed.model_dump(),
    }


# ── 2. SCORING ENGINE ────────────────────────────────────────────────────────

@app.post("/api/score", response_model=ScoreResponse)
async def score_resume(body: ScoreRequest):
    if body.user_type not in ("fresher", "experienced"):
        raise HTTPException(400, "user_type must be 'fresher' or 'experienced'")

    result = compute_score(body.parsed_json, body.user_type)

    sb = get_supabase()
    sb.table("scores").insert({
        "resume_id": body.resume_id,
        "overall_score": result.overall_score,
        "parameter_breakdown_json": [p.model_dump() for p in result.parameters],
    }).execute()

    return result


# ── 3. MULTI-AGENT CHAT/EDIT ─────────────────────────────────────────────────

@app.post("/api/chat-edit", response_model=ChatResponse)
async def chat_edit_endpoint(body: ChatRequest):
    result = chat_edit(
        prompt=body.prompt,
        section_key=body.section_key,
        section_data=body.section_data,
        history=body.chat_history,
    )
    return ChatResponse(
        updated_section=result.get("updated_section"),
        message=result.get("message", ""),
    )


# ── 4. TARGETING & RECOMMENDATION ENGINE ────────────────────────────────────

@app.post("/api/target-company")
async def target_company(body: TargetRequest):
    # Extract job title and company from target text if not provided
    job_title = body.job_title if hasattr(body, 'job_title') else ""
    company = body.company if hasattr(body, 'company') else ""
    
    result = await analyze_target(body.parsed_json, body.target, job_title, company)
    return result


# ── 5. FIX ALL WITH AI ─────────────────────────────────────────────────────

@app.post("/api/fix-all", response_model=FixAllResponse)
async def fix_all_endpoint(body: FixAllRequest):
    if body.user_type not in ("fresher", "experienced"):
        raise HTTPException(400, "user_type must be 'fresher' or 'experienced'")
    
    result = fix_all_resume(
        parsed_json=body.parsed_json,
        user_type=body.user_type,
        score_parameters=body.score_parameters,
        suggestions=body.suggestions,
    )
    
    return FixAllResponse(**result)


# ── 6. PDF EXPORT ───────────────────────────────────────────────────────────

@app.post("/api/export-pdf")
async def export_pdf(parsed_json: dict):
    """
    Generate and download edited resume as PDF
    """
    try:
        pdf_bytes = generate_resume_pdf(parsed_json)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=resume.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(500, f"PDF generation failed: {str(e)}")


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/test-db")
def test_db():
    sb = get_supabase()
    try:
        sessions_result = sb.table("sessions").select("*").limit(1).execute()
        resumes_result = sb.table("resumes").select("*").limit(1).execute()
        return {
            "status": "connected", 
            "sessions": sessions_result.data,
            "resumes": resumes_result.data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
