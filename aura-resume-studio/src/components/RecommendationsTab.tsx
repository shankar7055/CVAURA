import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { ExternalLink, Clock, Star, Video, Search, Briefcase, MapPin, ArrowUpRight } from "lucide-react";

const RecommendationsTab: React.FC = () => {
  const { resumeData } = useApp();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");

  const fetchInsights = async (jdText: string) => {
    if (!resumeData) return;
    setLoading(true);
    try {
      const result = await api.targetCompany(resumeData.parsed_json, jdText, jobTitle, company);
      setInsights(result);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (targetInput.trim()) {
      fetchInsights(targetInput);
    }
  };
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Target Company Input */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Target Company / Role</h3>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Job Title (e.g., Software Engineer)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <input
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Company (e.g., Google)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <textarea
            className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary min-h-[80px]"
            placeholder="Paste full job description here..."
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !targetInput.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {loading ? "Analyzing with AI + Web Scraping..." : "Analyze with Real Market Data"}
        </button>
      </section>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground animate-pulse">Analyzing skill gaps...</p>
        </div>
      )}

      {!insights && !loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Enter a job description to get personalized insights</p>
        </div>
      )}

      {insights && (
        <>
      {/* Market Insights */}
      {insights?.market_insights && (
        <section className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">📊 Real Market Data</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Jobs Analyzed:</span>
              <span className="ml-2 font-semibold text-foreground">{insights.market_insights.similar_jobs_analyzed}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Data Sources:</span>
              <span className="ml-2 font-semibold text-foreground">{insights.market_insights.data_sources}</span>
            </div>
          </div>
        </section>
      )}

      {/* DSA Requirements Alert */}
      {insights?.dsa_analysis && (
        <section className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
          <h4 className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2">⚠️ DSA & CS Fundamentals Required</h4>
          <p className="text-xs text-foreground/80 mb-2">{insights.dsa_analysis.recommendation}</p>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-foreground">Platforms to Practice:</p>
            <div className="flex flex-wrap gap-1">
              {insights.dsa_analysis.platforms.map((platform: string) => (
                <span key={platform} className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] text-orange-600">{platform}</span>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[10px] font-semibold text-foreground">Current Status:</p>
            <p className="text-xs text-muted-foreground">
              DSA Mentioned: {insights.dsa_analysis.current_status.has_dsa ? "✓ Yes" : "✗ No"} | 
              Platforms: {insights.dsa_analysis.current_status.platforms.length > 0 ? insights.dsa_analysis.current_status.platforms.join(", ") : "None"}
            </p>
          </div>
        </section>
      )}

      {/* Strengths & Weaknesses */}
      {insights?.strengths && insights?.weaknesses && (
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">Strengths</h4>
            <ul className="space-y-1">
              {insights.strengths.map((strength: string, i: number) => (
                <li key={i} className="text-xs text-foreground/80 before:content-['✓'] before:mr-2 before:text-green-500">{strength}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">Weaknesses</h4>
            <ul className="space-y-1">
              {insights.weaknesses.map((weakness: string, i: number) => (
                <li key={i} className="text-xs text-foreground/80 before:content-['✗'] before:mr-2 before:text-red-500">{weakness}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Competitive Edge */}
      {insights?.competitive_edge && (
        <section className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
          <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">🚀 Competitive Edge</h4>
          <ul className="space-y-1">
            {insights.competitive_edge.map((edge: string, i: number) => (
              <li key={i} className="text-xs text-foreground/80 before:content-['→'] before:mr-2 before:text-purple-500">{edge}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Skill Gaps */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Skill Gaps</h3>
        {insights?.skill_gaps?.map((gap: any, i: number) => (
          <motion.div
            key={gap.skill}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="space-y-2 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{gap.skill}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                gap.priority === "Critical" ? "bg-red-500/10 text-red-500" :
                gap.priority === "High" ? "bg-orange-500/10 text-orange-500" :
                gap.priority === "Medium" ? "bg-yellow-500/10 text-yellow-600" :
                "bg-blue-500/10 text-blue-500"
              }`}>{gap.priority}</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="absolute h-full rounded-full bg-red-500/30"
                initial={{ width: 0 }}
                animate={{ width: `${gap.required_level || 80}%` }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
              />
              <motion.div
                className="absolute h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${gap.current_level || 30}%` }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
              />
            </div>
            {gap.industry_demand && (
              <p className="text-[10px] text-muted-foreground italic">{gap.industry_demand}</p>
            )}
            <p className="text-xs text-muted-foreground">{gap.project_suggestion}</p>
            
            {/* Learning Path */}
            {gap.learning_path && (
              <a
                href={gap.learning_path.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-primary/5 border border-primary/20 p-2 text-xs hover:bg-primary/10 group"
              >
                <Star className="h-3 w-3 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-foreground group-hover:text-primary font-medium">{gap.learning_path.title}</p>
                  <p className="text-[10px] text-muted-foreground">{gap.learning_path.platform} · {gap.learning_path.duration}</p>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
              </a>
            )}

            {/* YouTube Videos */}
            {gap.youtube_videos && gap.youtube_videos.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-[10px] font-semibold text-foreground flex items-center gap-1">
                  <Video className="h-3 w-3 text-red-500" /> Learning Resources
                </p>
                {gap.youtube_videos.map((video: any, j: number) => (
                  <a
                    key={j}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md bg-secondary p-2 text-xs hover:bg-secondary/80 group"
                  >
                    <Video className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-foreground group-hover:text-primary">{video.title}</p>
                      <p className="text-[10px] text-muted-foreground">{video.channel} · {video.duration}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </section>

      {/* Job Suggestions — Apply to Similar Roles */}
      {insights?.job_suggestions && insights.job_suggestions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Apply to Similar Roles</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on your resume, you'd be a strong candidate for these positions:
          </p>
          <div className="space-y-2">
            {insights.job_suggestions.map((job: any, i: number) => (
              <motion.a
                key={i}
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="block rounded-lg border border-border bg-card p-3 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary truncate">
                      {job.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{job.company}</p>
                    {job.location && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {job.location}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    {/* Match Score */}
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${job.match_score}%`,
                            background: job.match_score >= 70 ? "hsl(142 71% 45%)" : job.match_score >= 40 ? "hsl(45 93% 47%)" : "hsl(0 84% 60%)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-foreground">{job.match_score}%</span>
                    </div>
                    {/* Source badge */}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                      job.source === "LinkedIn" ? "bg-blue-500/10 text-blue-600" :
                      job.source === "Remotive" ? "bg-green-500/10 text-green-600" :
                      "bg-purple-500/10 text-purple-600"
                    }`}>{job.source}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {job.salary && (
                      <span className="text-[10px] text-muted-foreground">{job.salary}</span>
                    )}
                    {job.posted && (
                      <span className="text-[10px] text-muted-foreground">Posted: {job.posted}</span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>
      )}
      </>
      )}
    </div>
  );
};

export default RecommendationsTab;
