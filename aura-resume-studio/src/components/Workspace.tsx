import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, BarChart3, Lightbulb, Sparkles, GripVertical } from "lucide-react";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { useApp } from "@/context/AppContext";
import DocumentViewer from "@/components/DocumentViewer";
import ChatTab from "@/components/ChatTab";
import ScoreTab from "@/components/ScoreTab";
import RecommendationsTab from "@/components/RecommendationsTab";

const tabs = [
  { id: "chat", label: "Chat & Edit", icon: MessageSquare },
  { id: "score", label: "ATS Score", icon: BarChart3 },
  { id: "recommend", label: "Insights", icon: Lightbulb },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Workspace: React.FC = () => {
  const { isDark, fileName, userType } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>("score");
  const [leftWidth, setLeftWidth] = useState(55);
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = () => setDragging(true);

  React.useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const pct = (e.clientX / window.innerWidth) * 100;
      setLeftWidth(Math.max(30, Math.min(70, pct)));
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">
            Cv<span className="gradient-text">Aura</span>
          </span>
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
            {fileName}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary capitalize">
            {userType}
          </span>
        </div>
        <ToggleTheme className="text-muted-foreground" />
      </header>

      {/* Split Panes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Document */}
        <motion.div
          className="h-full overflow-y-auto border-r border-border bg-background"
          style={{ width: `${leftWidth}%` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-6 min-h-full">
            <DocumentViewer />
          </div>
        </motion.div>

        {/* Resize Handle */}
        <div
          className="group flex w-1 cursor-col-resize items-center justify-center hover:bg-primary/10 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary" />
        </div>

        {/* Right: AI Command Center */}
        <motion.div
          className="flex flex-1 flex-col overflow-hidden bg-background"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Tabs */}
          <div className="flex shrink-0 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full">
              {activeTab === "chat" && <ChatTab />}
              {activeTab === "score" && <ScoreTab />}
              {activeTab === "recommend" && <RecommendationsTab />}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Workspace;
