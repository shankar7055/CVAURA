import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Download } from "lucide-react";

const DocumentViewer: React.FC = () => {
  const { resumeData } = useApp();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!resumeData) return;
    
    setDownloading(true);
    try {
      const blob = await api.exportPDF(resumeData.parsed_json);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.parsed_json.personal_info?.name || 'resume'}_edited.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!resumeData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Upload a resume to preview</p>
      </div>
    );
  }

  const r = resumeData.parsed_json;
  const pi = r.personal_info || {};

  return (
    <div className="relative">
      {/* Download PDF Button */}
      <div className="sticky top-0 z-10 flex justify-end p-4 bg-background/80 backdrop-blur-sm">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>
      
    <div className="mx-auto max-w-[700px] space-y-6 rounded-lg border border-border bg-card p-8 font-sans shadow-soft">
      {/* Header */}
      <div className="border-b border-border pb-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">{pi.name || "No Name"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pi.email} {pi.phone && `· ${pi.phone}`} {pi.location && `· ${pi.location}`}
        </p>
        {(pi.linkedin || pi.github) && (
          <p className="text-xs text-muted-foreground">
            {pi.linkedin} {pi.github && `· ${pi.github}`}
          </p>
        )}
      </div>

      {/* Summary */}
      {pi.summary && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Summary</h2>
          <p className="text-sm leading-relaxed text-foreground/80">{pi.summary}</p>
        </section>
      )}

      {/* Experience */}
      {r.experience && r.experience.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Experience</h2>
          {r.experience.map((exp: any, i: number) => (
            <div key={i} className="mb-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-foreground">{exp.title}</h3>
                <span className="text-xs text-muted-foreground">{exp.period}</span>
              </div>
              <p className="text-xs text-muted-foreground">{exp.company}</p>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {exp.bullets.map((b: string, j: number) => (
                    <li key={j} className="text-sm leading-relaxed text-foreground/80 before:mr-2 before:content-['•']">{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {r.projects && r.projects.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Projects</h2>
          {r.projects.map((proj: any, i: number) => (
            <div key={i} className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">{proj.name}</h3>
              <p className="text-sm leading-relaxed text-foreground/80 mt-1">{proj.description}</p>
              {proj.tech_stack && proj.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {proj.tech_stack.map((tech: string, j: number) => (
                    <span key={j} className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {r.education && r.education.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Education</h2>
          {r.education.map((edu: any, i: number) => (
            <div key={i} className="flex items-baseline justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{edu.degree}</p>
                <p className="text-xs text-muted-foreground">{edu.school}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{edu.year}</p>
                {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Hackathons */}
      {r.hackathons && r.hackathons.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Hackathons & Awards</h2>
          {r.hackathons.map((h: any, i: number) => (
            <div key={i} className="mb-1">
              <p className="text-sm text-foreground"><span className="font-semibold">{h.name}</span> - {h.award} ({h.year})</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {r.skills && r.skills.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {r.skills.map((s: string, i: number) => (
              <span key={i} className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {r.certifications && r.certifications.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Certifications</h2>
          <ul className="space-y-0.5">
            {r.certifications.map((c: any, i: number) => (
              <li key={i} className="text-sm text-foreground/80">{c.name} {c.issuer && `- ${c.issuer}`}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
    </div>
  );
};

export default DocumentViewer;
