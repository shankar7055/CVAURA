import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Download, ChevronRight, CheckCircle2, AlertTriangle, ArrowLeftRight } from "lucide-react";
import ScoreCard from "@/components/ScoreCard";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

const ScoreTab: React.FC = () => {
  const { userType, resumeData, scoreData, setScoreData, fixedResumeData, setFixedResumeData } = useApp();
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (resumeData && userType && !scoreData) {
      setLoading(true);
      api.scoreResume(resumeData.parsed_json, userType, resumeData.resume_id)
        .then(setScoreData)
        .catch(err => {
          console.error("Score failed:", err);
          alert("Failed to calculate score. API quota may be exceeded. Please try again later.");
        })
        .finally(() => setLoading(false));
    }
  }, [resumeData, userType, scoreData, setScoreData]);

  const handleFixAll = async () => {
    if (!resumeData || !scoreData || !userType) return;
    setFixing(true);
    try {
      const result = await api.fixAll(
        resumeData.parsed_json,
        userType,
        scoreData.parameters,
        scoreData.suggestions || []
      );
      setFixedResumeData(result);
      setShowComparison(true);
    } catch (err) {
      console.error("Fix All failed:", err);
      alert("Failed to fix resume. Please try again.");
    } finally {
      setFixing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!fixedResumeData) return;
    try {
      const blob = await api.exportPDF(fixedResumeData.fixed_json);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume-improved.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Calculating ATS score...</p>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Upload a resume to see your score</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Overall Score */}
      <motion.div
        className="flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ScoreCard score={scoreData.overall_score} size={180} />
      </motion.div>

      {/* Parameter Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Score Breakdown</h3>
        {scoreData.parameters.map((p: any, i: number) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">{p.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{p.weight}%w</span>
                <span className="text-xs font-semibold text-foreground">{p.score}</span>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: p.score >= 80 ? "hsl(142 71% 45%)" : p.score >= 60 ? "hsl(45 93% 47%)" : "hsl(0 84% 60%)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${p.score}%` }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{p.feedback}</p>
            {p.reasoning && (
              <p className="text-[10px] text-muted-foreground/70 italic">{p.reasoning}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Suggestions */}
      {scoreData.suggestions && scoreData.suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Improvement Suggestions
          </h3>
          <div className="space-y-2">
            {scoreData.suggestions.map((suggestion: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-start gap-2 rounded-lg border border-border bg-card p-3"
              >
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-xs text-foreground/90 leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fix All with AI Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {!fixedResumeData ? (
          <button
            onClick={handleFixAll}
            disabled={fixing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            {fixing ? "AI is fixing your resume..." : "Fix All with AI"}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4" />
              {showComparison ? "Hide Comparison" : "View Before / After"}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Improved Resume (PDF)
            </button>
          </div>
        )}
      </motion.div>

      {/* Before/After Comparison */}
      <AnimatePresence>
        {showComparison && fixedResumeData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Changes Summary */}
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Changes Made
              </h4>
              <ul className="space-y-1">
                {fixedResumeData.changes_summary.map((change: string, i: number) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                    <ChevronRight className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary Comparison */}
            <ComparisonSection
              title="Professional Summary"
              before={fixedResumeData.original_json?.personal_info?.summary || ""}
              after={fixedResumeData.fixed_json?.personal_info?.summary || ""}
            />

            {/* Experience Comparison */}
            {fixedResumeData.fixed_json?.experience?.map((exp: any, i: number) => {
              const origExp = fixedResumeData.original_json?.experience?.[i];
              if (!origExp) return null;
              return (
                <ComparisonSection
                  key={i}
                  title={`${exp.title || "Role"} @ ${exp.company || "Company"}`}
                  before={origExp.bullets?.join("\n• ") || ""}
                  after={exp.bullets?.join("\n• ") || ""}
                />
              );
            })}

            {/* Skills Comparison */}
            <ComparisonSection
              title="Skills"
              before={(fixedResumeData.original_json?.skills || []).join(", ")}
              after={(fixedResumeData.fixed_json?.skills || []).join(", ")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Before/After comparison component
const ComparisonSection: React.FC<{ title: string; before: string; after: string }> = ({ title, before, after }) => {
  if (before === after) return null;
  
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-3 py-2 bg-secondary/50 border-b border-border">
        <h5 className="text-xs font-semibold text-foreground">{title}</h5>
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="p-3">
          <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Before</span>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{before || "(empty)"}</p>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">After</span>
          <p className="mt-1 text-[11px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{after || "(empty)"}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoreTab;
