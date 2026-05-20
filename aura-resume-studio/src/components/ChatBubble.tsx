import React from "react";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  agents?: string[];
  index: number;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, agents, index }) => {
  const isUser = role === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <div className={`max-w-[85%] space-y-1.5`}>
        {agents && agents.length > 0 && (
          <div className="flex gap-1.5 px-1">
            {agents.map((a) => (
              <span key={a} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {a}
              </span>
            ))}
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "gradient-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {content.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
              {i < content.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
