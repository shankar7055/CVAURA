const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  async uploadResume(file: File, userType: "fresher" | "experienced") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_type", userType);
    
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  async scoreResume(parsedJson: any, userType: string, resumeId: string) {
    const res = await fetch(`${API_BASE}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parsed_json: parsedJson, user_type: userType, resume_id: resumeId }),
    });
    if (!res.ok) throw new Error("Scoring failed");
    return res.json();
  },

  async chatEdit(prompt: string, sectionKey: string, sectionData: any, chatHistory: any[]) {
    const res = await fetch(`${API_BASE}/api/chat-edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, section_key: sectionKey, section_data: sectionData, chat_history: chatHistory }),
    });
    if (!res.ok) throw new Error("Chat edit failed");
    return res.json();
  },

  async targetCompany(parsedJson: any, target: string, jobTitle: string = "", company: string = "") {
    const res = await fetch(`${API_BASE}/api/target-company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parsed_json: parsedJson, target, job_title: jobTitle, company }),
    });
    if (!res.ok) throw new Error("Target analysis failed");
    return res.json();
  },

  async fixAll(parsedJson: any, userType: string, scoreParameters: any[], suggestions: string[]) {
    const res = await fetch(`${API_BASE}/api/fix-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        parsed_json: parsedJson, 
        user_type: userType,
        score_parameters: scoreParameters,
        suggestions: suggestions,
      }),
    });
    if (!res.ok) throw new Error("Fix all failed");
    return res.json();
  },

  async exportPDF(parsedJson: any) {
    const res = await fetch(`${API_BASE}/api/export-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedJson),
    });
    if (!res.ok) throw new Error("PDF export failed");
    return res.blob();
  },
};
