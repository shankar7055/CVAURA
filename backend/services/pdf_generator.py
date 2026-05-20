from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib import colors
from io import BytesIO

def generate_resume_pdf(parsed_resume: dict) -> bytes:
    """
    Generate a professional ATS-friendly PDF from parsed resume JSON
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, 
                           rightMargin=0.75*inch, leftMargin=0.75*inch,
                           topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=8,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderWidth=1,
        borderColor=colors.HexColor('#3498db'),
        borderPadding=4,
        backColor=colors.HexColor('#ecf0f1')
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=4,
        fontName='Helvetica'
    )
    
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#34495e'),
        leftIndent=20,
        spaceAfter=3,
        fontName='Helvetica'
    )
    
    # Personal Info
    pi = parsed_resume.get("personal_info", {})
    if pi.get("name"):
        story.append(Paragraph(pi["name"], title_style))
    
    contact_parts = []
    if pi.get("email"):
        contact_parts.append(pi["email"])
    if pi.get("phone"):
        contact_parts.append(pi["phone"])
    if pi.get("location"):
        contact_parts.append(pi["location"])
    
    if contact_parts:
        contact_text = " | ".join(contact_parts)
        story.append(Paragraph(contact_text, normal_style))
    
    links = []
    if pi.get("linkedin"):
        links.append(f'<a href="{pi["linkedin"]}" color="blue">LinkedIn</a>')
    if pi.get("github"):
        links.append(f'<a href="{pi["github"]}" color="blue">GitHub</a>')
    
    if links:
        story.append(Paragraph(" | ".join(links), normal_style))
    
    story.append(Spacer(1, 0.15*inch))
    
    # Summary
    if pi.get("summary"):
        story.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
        story.append(Paragraph(pi["summary"], normal_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Education
    education = parsed_resume.get("education", [])
    if education:
        story.append(Paragraph("EDUCATION", heading_style))
        for edu in education:
            edu_text = f"<b>{edu.get('degree', 'Degree')}</b> - {edu.get('school', 'School')}"
            if edu.get("year"):
                edu_text += f" ({edu['year']})"
            if edu.get("gpa"):
                edu_text += f" | GPA: {edu['gpa']}"
            story.append(Paragraph(edu_text, normal_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Experience
    experience = parsed_resume.get("experience", [])
    if experience:
        story.append(Paragraph("PROFESSIONAL EXPERIENCE", heading_style))
        for exp in experience:
            exp_header = f"<b>{exp.get('title', 'Position')}</b> | {exp.get('company', 'Company')}"
            if exp.get("period"):
                exp_header += f" | {exp['period']}"
            story.append(Paragraph(exp_header, normal_style))
            
            for bullet in exp.get("bullets", []):
                story.append(Paragraph(f"• {bullet}", bullet_style))
            story.append(Spacer(1, 0.05*inch))
        story.append(Spacer(1, 0.1*inch))
    
    # Projects
    projects = parsed_resume.get("projects", [])
    if projects:
        story.append(Paragraph("PROJECTS", heading_style))
        for proj in projects:
            proj_header = f"<b>{proj.get('name', 'Project')}</b>"
            if proj.get("link"):
                proj_header += f' | <a href="{proj["link"]}" color="blue">Link</a>'
            story.append(Paragraph(proj_header, normal_style))
            
            if proj.get("description"):
                story.append(Paragraph(proj["description"], bullet_style))
            
            if proj.get("tech_stack"):
                tech = ", ".join(proj["tech_stack"])
                story.append(Paragraph(f"<i>Technologies: {tech}</i>", bullet_style))
            story.append(Spacer(1, 0.05*inch))
        story.append(Spacer(1, 0.1*inch))
    
    # Skills
    skills = parsed_resume.get("skills", [])
    if skills:
        story.append(Paragraph("TECHNICAL SKILLS", heading_style))
        skills_text = ", ".join(skills)
        story.append(Paragraph(skills_text, normal_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Hackathons
    hackathons = parsed_resume.get("hackathons", [])
    if hackathons:
        story.append(Paragraph("HACKATHONS & AWARDS", heading_style))
        for hack in hackathons:
            hack_text = f"<b>{hack.get('name', 'Hackathon')}</b>"
            if hack.get("award"):
                hack_text += f" - {hack['award']}"
            if hack.get("year"):
                hack_text += f" ({hack['year']})"
            story.append(Paragraph(hack_text, normal_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Certifications
    certifications = parsed_resume.get("certifications", [])
    if certifications:
        story.append(Paragraph("CERTIFICATIONS", heading_style))
        for cert in certifications:
            cert_text = f"<b>{cert.get('name', 'Certification')}</b>"
            if cert.get("issuer"):
                cert_text += f" - {cert['issuer']}"
            if cert.get("year"):
                cert_text += f" ({cert['year']})"
            story.append(Paragraph(cert_text, normal_style))
    
    # Build PDF
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
