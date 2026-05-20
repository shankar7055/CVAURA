import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, GraduationCap, Briefcase, X, Bot, Target, BarChart3, Lightbulb, Layers, Zap } from "lucide-react";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { useApp } from "@/context/AppContext";
import type { UserType } from "@/lib/mock-data";
import BorderGlow from "@/components/BorderGlow";
import FlowingMenu from "@/components/FlowingMenu";
import GooeyNav from "@/components/GooeyNav";
import InfiniteMenu from "@/components/InfiniteMenu";
import Orb from "@/components/Orb";
import TextPressure from "@/components/TextPressure";
import { api } from "@/lib/api";

const features = [
  {
    icon: Bot,
    title: "Multi-Agent AI Chat",
    desc: "Chat with specialized AI agents that rewrite, optimize, and boost your resume in real time.",
  },
  {
    icon: Target,
    title: "Company Targeting",
    desc: "Paste a job URL and let our scraper agent extract keywords to tailor your resume automatically.",
  },
  {
    icon: BarChart3,
    title: "ATS Score Dashboard",
    desc: "Get a detailed breakdown across 8 weighted parameters with a visual keyword heatmap.",
  },
  {
    icon: Lightbulb,
    title: "Skill Gap Intelligence",
    desc: "Discover missing skills with curated learning paths, courses, and project suggestions.",
  },
  {
    icon: Layers,
    title: "Live Document Editor",
    desc: "Edit your resume in a clean, ATS-safe template with instant preview and formatting.",
  },
  {
    icon: Zap,
    title: "Fresher & Pro Modes",
    desc: "Scoring adapts to your career stage — projects & hackathons for freshers, impact metrics for pros.",
  },
];

const featureItems = [
  {
    image: '/feature-ai-chat.png', link: '#',
    title: 'Multi-Agent AI Chat',
    description: 'Chat with specialized AI agents that rewrite bullet points, optimize phrasing, and boost impact — all in real time with context-aware suggestions.'
  },
  {
    image: '/feature-targeting.png', link: '#',
    title: 'Company Targeting',
    description: 'Paste any job URL and our scraper agent extracts keywords, required skills, and role context to tailor your resume for maximum relevance.'
  },
  {
    image: '/feature-ats-score.png', link: '#',
    title: 'ATS Score Dashboard',
    description: 'Get a detailed breakdown across 8 weighted parameters — keyword match, formatting, education alignment, and more — with a visual heatmap.'
  },
  {
    image: '/feature-skill-gap.png', link: '#',
    title: 'Skill Gap Intelligence',
    description: 'Discover missing skills for your target role with curated learning paths, recommended courses, certifications, and project suggestions.'
  },
  {
    image: '/feature-editor.png', link: '#',
    title: 'Live Document Editor',
    description: 'Edit your resume in a clean, ATS-safe template with instant preview, smart formatting, and one-click PDF export — no design skills needed.'
  },
  {
    image: '/feature-modes.png', link: '#',
    title: 'Fresher & Pro Modes',
    description: 'Scoring adapts to your career stage — projects & hackathons matter for freshers, while impact metrics and leadership drive scores for pros.'
  },
];

const LandingPage: React.FC = () => {
  const { setUserType, setUploaded, setFileName, setResumeData, isDark } = useApp();
  const [dragging, setDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setFileName(f.name);
    setShowModal(true);
  }, [setFileName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSelect = async (type: UserType) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadResume(file, type);
      setResumeData(result);
      setUserType(type);
      setUploaded(true);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Top nav with GooeyNav */}
      <header className={`sticky top-0 z-30 flex items-center justify-between bg-card/80 backdrop-blur-md px-6 py-3 ${isDark ? 'bg-[#09090b]/90' : ''}`}>
        {/* Logo — hidden in light mode */}
        {isDark && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Cv<span className="gradient-text">Aura</span>
            </span>
          </div>
        )}
        {!isDark && <div />}
        <div className="flex items-center gap-2">
          <GooeyNav
            items={[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ]}
            initialActiveIndex={0}
          />
          <ToggleTheme className="ml-2 text-muted-foreground" />
        </div>
      </header>

      {/* Hero — LIGHT THEME */}
      {!isDark && (
        <section className="relative flex flex-col justify-end px-8 sm:px-16 pb-16 pt-8 min-h-screen">
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-full"
          >
            <h1
              className="font-bold tracking-tighter text-black leading-[0.9]"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 10rem)' }}
            >
              AI-Powered Resume<br />
              Analysis &amp; Editing
            </h1>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <motion.button
                onClick={() => document.getElementById("file-input")?.click()}
                className="rounded-full bg-black text-white px-10 py-4 text-lg font-semibold tracking-tight hover:bg-neutral-800 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started →
              </motion.button>
              <p className="text-base text-neutral-500 max-w-sm">
                Upload your resume and let our AI agents optimize it for ATS compatibility, impact, and clarity.
              </p>
            </div>
          </motion.div>
        </section>
      )}

      {/* Hero — DARK THEME (original) */}
      {isDark && (
        <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 min-h-screen">
          {/* Orb Background */}
          <div className="absolute inset-0 z-0">
            <Orb
              hoverIntensity={3}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
              backgroundColor="#000000"
            />
          </div>

          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-background/20 z-5"></div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10 flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                AI-Powered Resume<br />
                <span className="gradient-text">Analysis &amp; Editing</span>
              </h1>
              <p className="mt-4 max-w-lg text-base text-muted-foreground">
                Upload your resume and let our AI agents optimize it for ATS compatibility, impact, and clarity.
              </p>
            </div>

            {/* Drop zone */}
            <motion.div
              className={`relative w-full max-w-md cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drop your resume here</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX · Max 10MB</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Features Section */}
      <section className={`px-4 pt-20 pb-0 ${isDark ? 'bg-[#09090b]' : 'bg-secondary/30'}`}>
        {/* Features Grid */}
        <div className="mx-auto max-w-5xl">
          <div style={{ position: 'relative', minHeight: '120px', marginBottom: '24px', paddingTop: '12px' }}>
            <TextPressure
              text="Features"
              flex
              alpha={false}
              stroke={false}
              width
              weight
              italic
              textColor={isDark ? "#ffffff" : "#000000"}
              strokeColor="#5227FF"
              minFontSize={28}
            />
          </div>
        </div>
        <div style={{ height: '100vh', position: 'relative', width: '100%' }} className="overflow-hidden">
          <InfiniteMenu items={featureItems} scale={1} />
        </div>
      </section>

      {/* New How It Works Section */}
      <section className={`relative px-6 py-32 overflow-hidden ${isDark ? 'bg-background' : 'bg-secondary/20'}`}>
        {/* Background decorative elements */}
        {isDark && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        )}
        
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Process
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6"
            >
              How it <span className="gradient-text">works ?</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-2xl mx-auto text-lg sm:text-xl"
            >
              Four simple steps to transform your resume and land your dream job.
            </motion.p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative mt-16">
            {/* Connecting line for desktop */}
            <div className={`hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] ${isDark ? 'bg-gradient-to-r from-transparent via-primary/30 to-transparent' : 'bg-gradient-to-r from-transparent via-primary/20 to-transparent'} z-0`} />
            
            {[
              { 
                step: "01", 
                title: "Upload Document", 
                desc: "Securely upload your existing PDF or DOCX resume into our smart analyzer.",
                icon: Upload,
                delay: 0.1
              },
              { 
                step: "02", 
                title: "AI Analysis", 
                desc: "Our agents parse your experience, calculate ATS scores, and find skill gaps.",
                icon: BarChart3,
                delay: 0.2
              },
              { 
                step: "03", 
                title: "Live Optimization", 
                desc: "Chat with our AI to rewrite bullet points and tailor content to specific jobs.",
                icon: Bot,
                delay: 0.3
              },
              { 
                step: "04", 
                title: "Export & Apply", 
                desc: "Download a beautifully formatted, ATS-compliant PDF ready for applications.",
                icon: Sparkles,
                delay: 0.4
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: item.delay, duration: 0.5 }}
                className="relative z-10 flex flex-col items-center group"
              >
                {/* Number / Icon Shield */}
                <div className={`relative flex items-center justify-center w-24 h-24 rounded-3xl mb-8 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110 ${
                  isDark 
                    ? 'bg-[#111116] border border-white/10 shadow-[0_0_40px_-10px_rgba(82,39,255,0.3)]' 
                    : 'bg-white border border-black/5 shadow-xl'
                }`}>
                  <item.icon className="w-10 h-10 text-primary" />
                  <div className={`absolute -top-3 -right-3 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold font-mono bg-primary text-white shadow-lg`}>
                    {i + 1}
                  </div>
                </div>
                
                {/* Content Card */}
                <div className={`relative flex flex-col items-center text-center p-8 rounded-3xl w-full h-full transition-all duration-500 group-hover:shadow-2xl ${
                  isDark 
                    ? 'bg-[#111116]/80 border border-white/5 group-hover:border-primary/30' 
                    : 'bg-white/80 border border-black/5 group-hover:border-primary/20 group-hover:bg-white'
                }`}>
                  <span className="absolute -top-12 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary/10 to-transparent pointer-events-none select-none">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-4 relative z-10">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flowing Menu — Secondary Navigation */}
      <section className="border-t border-border">
        <div style={{ height: '420px', position: 'relative' }}>
          <FlowingMenu
            items={[
              { link: '/', text: 'Home', image: '/flowing-home.png' },
              { link: '/about', text: 'About', image: '/flowing-about.png' },
              { link: '/contact', text: 'Contact', image: '/flowing-contact.png' },
            ]}
            speed={12}
            textColor={isDark ? '#ffffff' : '#0a0a0b'}
            bgColor={isDark ? '#09090b' : '#fafafa'}
            marqueeBgColor={isDark ? '#ffffff' : '#0a0a0b'}
            marqueeTextColor={isDark ? '#09090b' : '#ffffff'}
            borderColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        All Rights Reserved · CvAura © {new Date().getFullYear()}
      </footer>

      {/* Experience Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-deep"
              style={{ margin: '0 auto' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Tell us about your journey</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This helps us tailor scoring to your career stage
                </p>
                {file && (
                  <p className="mt-2 text-xs text-primary font-medium">{file.name}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.button
                  onClick={() => handleSelect("fresher")}
                  disabled={uploading}
                  className="group rounded-xl border border-border bg-secondary/50 p-5 text-left transition-all hover:border-primary/40 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: uploading ? 1 : 1.02 }}
                  whileTap={{ scale: uploading ? 1 : 0.98 }}
                >
                  <GraduationCap className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="text-sm font-semibold text-foreground">Fresher</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Student or recent graduate. Focus on projects, hackathons, and education.
                  </p>
                </motion.button>

                <motion.button
                  onClick={() => handleSelect("experienced")}
                  disabled={uploading}
                  className="group rounded-xl border border-border bg-secondary/50 p-5 text-left transition-all hover:border-primary/40 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: uploading ? 1 : 1.02 }}
                  whileTap={{ scale: uploading ? 1 : 0.98 }}
                >
                  <Briefcase className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="text-sm font-semibold text-foreground">Experienced</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Working professional. Focus on impact quantification and role progression.
                  </p>
                </motion.button>
              </div>
              {uploading && (
                <p className="mt-4 text-center text-xs text-primary animate-pulse">Uploading and analyzing...</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;