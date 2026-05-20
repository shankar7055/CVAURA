import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Globe, Check, X } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

const ChatTab: React.FC = () => {
  const { resumeData, setResumeData } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

  const handleSend = async () => {
    if (!input.trim() || !resumeData) return;
    
    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Determine which section to edit based on user input
      let sectionKey = "experience";
      let sectionData = resumeData.parsed_json.experience;
      
      if (input.toLowerCase().includes("project")) {
        sectionKey = "projects";
        sectionData = resumeData.parsed_json.projects;
      } else if (input.toLowerCase().includes("skill")) {
        sectionKey = "skills";
        sectionData = resumeData.parsed_json.skills;
      } else if (input.toLowerCase().includes("education")) {
        sectionKey = "education";
        sectionData = resumeData.parsed_json.education;
      } else if (input.toLowerCase().includes("summary")) {
        sectionKey = "personal_info";
        sectionData = resumeData.parsed_json.personal_info;
      }

      const result = await api.chatEdit(input, sectionKey, sectionData, messages);
      
      setPendingChanges({ sectionKey, data: result.updated_section });
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: result.message,
          agents: ["Chat Agent", "ATS Booster"],
        },
      ]);
    } catch (error) {
      console.error("Chat edit failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "Sorry, I couldn't process that request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyChanges = () => {
    if (!pendingChanges || !resumeData) return;
    const updated = {
      ...resumeData,
      parsed_json: {
        ...resumeData.parsed_json,
        [pendingChanges.sectionKey]: pendingChanges.data,
      },
    };
    setResumeData(updated);
    setPendingChanges(null);
  };

  const revertChanges = () => {
    setPendingChanges(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Pending Changes Banner */}
      {pendingChanges && (
        <div className="border-b border-border bg-primary/5 p-3 flex items-center justify-between">
          <p className="text-xs text-foreground">Changes ready to apply</p>
          <div className="flex gap-2">
            <button
              onClick={applyChanges}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-3 w-3" /> Apply
            </button>
            <button
              onClick={revertChanges}
              className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-xs hover:bg-secondary/80"
            >
              <X className="h-3 w-3" /> Revert
            </button>
          </div>
        </div>
      )}
      {/* Company Targeting */}
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            placeholder="Target a company (URL or name)..."
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
          />
          {targetCompany && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Targeting
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} index={i} role={msg.role} content={msg.content} agents={"agents" in msg ? msg.agents : undefined} />
        ))}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">AI is editing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
          <input
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            placeholder="Ask AI to edit your resume..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
