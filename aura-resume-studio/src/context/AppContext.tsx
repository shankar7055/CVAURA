import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserType } from "@/lib/mock-data";

interface ResumeData {
  session_id: string;
  resume_id: string;
  storage_url: string;
  parsed_json: any;
}

interface ScoreData {
  overall_score: number;
  parameters: any[];
  suggestions?: string[];
}

interface FixedResumeData {
  original_json: any;
  fixed_json: any;
  changes_summary: string[];
}

interface AppState {
  userType: UserType | null;
  setUserType: (t: UserType) => void;
  uploaded: boolean;
  setUploaded: (v: boolean) => void;
  fileName: string;
  setFileName: (n: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData) => void;
  scoreData: ScoreData | null;
  setScoreData: (data: ScoreData) => void;
  fixedResumeData: FixedResumeData | null;
  setFixedResumeData: (data: FixedResumeData | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return true; // default dark
  });
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [fixedResumeData, setFixedResumeData] = useState<FixedResumeData | null>(null);

  // Sync isDark with the document's dark class (set by ToggleTheme component)
  useEffect(() => {
    // Set initial class
    document.documentElement.classList.toggle("dark", isDark);

    const observer = new MutationObserver(() => {
      const hasDark = document.documentElement.classList.contains("dark");
      setIsDark(hasDark);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    document.documentElement.classList.toggle("dark", newVal);
    localStorage.setItem("theme", newVal ? "dark" : "light");
  };

  return (
    <AppContext.Provider value={{ userType, setUserType, uploaded, setUploaded, fileName, setFileName, isDark, toggleTheme, resumeData, setResumeData, scoreData, setScoreData, fixedResumeData, setFixedResumeData }}>
      {children}
    </AppContext.Provider>
  );
};
