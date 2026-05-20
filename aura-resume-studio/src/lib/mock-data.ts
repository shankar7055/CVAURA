export type UserType = "fresher" | "experienced";

export const mockResumeContent = {
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexjohnson",
  github: "github.com/alexjdev",
  summary:
    "Results-driven software engineer with 4+ years of experience building scalable web applications. Proficient in React, TypeScript, Node.js, and cloud infrastructure. Passionate about creating elegant solutions to complex problems.",
  experience: [
    {
      title: "Senior Frontend Engineer",
      company: "TechCorp Inc.",
      period: "Jan 2022 – Present",
      bullets: [
        "Led migration of legacy jQuery codebase to React, reducing bundle size by 40%",
        "Architected component library used across 5 product teams serving 2M+ users",
        "Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes",
        "Mentored 3 junior developers through structured code reviews and pair programming",
      ],
    },
    {
      title: "Frontend Developer",
      company: "StartupXYZ",
      period: "Jun 2020 – Dec 2021",
      bullets: [
        "Built real-time dashboard processing 50K+ events/second using WebSockets",
        "Developed responsive design system with accessibility-first approach (WCAG 2.1 AA)",
        "Reduced page load time by 60% through code splitting and lazy loading strategies",
      ],
    },
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      school: "University of California, Berkeley",
      year: "2020",
      gpa: "3.8/4.0",
    },
  ],
  skills: [
    "React", "TypeScript", "Node.js", "Python", "AWS", "Docker",
    "GraphQL", "PostgreSQL", "Redis", "Tailwind CSS", "Next.js", "Git",
  ],
  certifications: ["AWS Solutions Architect Associate", "Google Cloud Professional"],
};

export const fresherScoreParams = [
  { label: "Keyword Match", score: 78, weight: 15 },
  { label: "Education Alignment", score: 92, weight: 20 },
  { label: "Hackathons/Winnings", score: 45, weight: 10 },
  { label: "Projects & GitHub", score: 65, weight: 15 },
  { label: "Certifications/Publications", score: 70, weight: 10 },
  { label: "ATS Language", score: 82, weight: 10 },
  { label: "Soft Skills", score: 58, weight: 10 },
  { label: "LinkedIn Profile", score: 40, weight: 10 },
];

export const experiencedScoreParams = [
  { label: "Keyword Match", score: 78, weight: 15 },
  { label: "Experience Quantification", score: 85, weight: 20 },
  { label: "Role Progression", score: 72, weight: 10 },
  { label: "Technical Depth", score: 88, weight: 15 },
  { label: "Leadership & Impact", score: 65, weight: 10 },
  { label: "ATS Language", score: 82, weight: 10 },
  { label: "Industry Alignment", score: 70, weight: 10 },
  { label: "Certifications", score: 75, weight: 10 },
];

export const mockChatHistory = [
  { role: "user" as const, content: "Can you make my experience section more impactful?" },
  {
    role: "assistant" as const,
    content:
      "I've analyzed your experience section. Here are my suggestions:\n\n1. **Quantify more results** — Add metrics like revenue impact, user growth percentages\n2. **Use stronger action verbs** — Replace 'worked on' with 'architected', 'spearheaded'\n3. **Add context** — Mention team sizes, project scope, and business outcomes\n\nWould you like me to rewrite the first bullet point as an example?",
    agents: ["Chat Agent", "ATS Booster"],
  },
  { role: "user" as const, content: "Yes, rewrite the first bullet" },
  {
    role: "assistant" as const,
    content:
      'Here\'s an improved version:\n\n**Before:** "Led migration of legacy jQuery codebase to React"\n\n**After:** "Spearheaded enterprise-wide migration from jQuery to React 18, reducing bundle size by 40% and improving Core Web Vitals scores by 65%, directly contributing to a 12% increase in user retention across 2M+ monthly active users"\n\nThis version adds quantified impact and business context. Shall I apply this change?',
    agents: ["Chat Agent"],
  },
];

export const skillGaps = [
  { skill: "Kubernetes", current: 30, required: 75, category: "DevOps" },
  { skill: "System Design", current: 55, required: 85, category: "Architecture" },
  { skill: "Machine Learning", current: 20, required: 60, category: "AI/ML" },
  { skill: "GraphQL Advanced", current: 45, required: 80, category: "Backend" },
  { skill: "Performance Optimization", current: 60, required: 90, category: "Frontend" },
];

export const learningPaths = [
  {
    title: "Kubernetes for Developers",
    platform: "Udemy",
    duration: "12 hours",
    rating: 4.7,
    url: "#",
    icon: "🎓",
  },
  {
    title: "System Design Interview Prep",
    platform: "Coursera",
    duration: "8 weeks",
    rating: 4.8,
    url: "#",
    icon: "📐",
  },
  {
    title: "ML Crash Course",
    platform: "YouTube",
    duration: "6 hours",
    rating: 4.5,
    url: "#",
    icon: "🤖",
  },
  {
    title: "Advanced GraphQL Patterns",
    platform: "Frontend Masters",
    duration: "4 hours",
    rating: 4.9,
    url: "#",
    icon: "⚡",
  },
];

export const projectSuggestions = [
  {
    title: "K8s Microservices Platform",
    description: "Build a microservices app deployed on Kubernetes with auto-scaling, service mesh, and observability.",
    skills: ["Kubernetes", "Docker", "Prometheus"],
    difficulty: "Advanced",
    timeEstimate: "3-4 weeks",
  },
  {
    title: "Real-time ML Pipeline",
    description: "Create a streaming ML pipeline that processes data in real-time with feature engineering and model serving.",
    skills: ["Python", "TensorFlow", "Apache Kafka"],
    difficulty: "Advanced",
    timeEstimate: "4-5 weeks",
  },
  {
    title: "GraphQL Federation Gateway",
    description: "Implement a federated GraphQL gateway connecting multiple subgraphs with caching and rate limiting.",
    skills: ["GraphQL", "Node.js", "Redis"],
    difficulty: "Intermediate",
    timeEstimate: "2-3 weeks",
  },
];

export const heatmapData = [
  { text: "Results-driven", type: "hit" as const },
  { text: " software engineer with ", type: "neutral" as const },
  { text: "4+ years", type: "hit" as const },
  { text: " of experience building ", type: "neutral" as const },
  { text: "scalable web applications", type: "hit" as const },
  { text: ". Proficient in ", type: "neutral" as const },
  { text: "React", type: "hit" as const },
  { text: ", ", type: "neutral" as const },
  { text: "TypeScript", type: "hit" as const },
  { text: ", ", type: "neutral" as const },
  { text: "Node.js", type: "hit" as const },
  { text: ", and ", type: "neutral" as const },
  { text: "cloud infrastructure", type: "miss" as const },
  { text: ". Passionate about creating ", type: "neutral" as const },
  { text: "elegant solutions", type: "miss" as const },
  { text: " to complex problems.", type: "neutral" as const },
];
