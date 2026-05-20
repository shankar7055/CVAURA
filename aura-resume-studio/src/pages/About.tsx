import { motion } from "framer-motion";
import { Sparkles, Users, ShieldCheck, Globe, MessageSquare } from "lucide-react";
import { useApp } from "@/context/AppContext";

const aboutSections = [
  {
    title: "Our Mission",
    description:
      "CvAura exists to make career growth effortless. We help professionals and students create resumes that stand out to hiring managers and ATS systems alike.",
    icon: Globe,
  },
  {
    title: "What We Value",
    description:
      "Transparency, intelligence, and speed. We believe the best resume experience is clear, actionable, and powered by smart automation without sacrificing design.",
    icon: ShieldCheck,
  },
  {
    title: "Who We Serve",
    description:
      "From fresh graduates to experienced professionals, our platform adapts to every career stage with targeted resume insights and resume editing guidance.",
    icon: Users,
  },
];

const About = () => {
  const { isDark } = useApp();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden px-4 py-20 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-deep backdrop-blur-xl"
          >
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/20">
                  <Sparkles className="h-4 w-4" />
                  About Us
                </p>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Building smarter resumes with clarity and confidence.
                </h1>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-right sm:text-base">
                A modern resume experience designed for both light and dark modes, with fast AI-powered results and polished presentation for every stage of your career.
              </p>
            </div>

            <div className="grid gap-4 rounded-3xl border border-border bg-background/80 p-6 sm:grid-cols-3">
              {aboutSections.map((section) => (
                <motion.div
                  key={section.title}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-border bg-card p-6"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-deep backdrop-blur-xl">
              <h2 className="text-3xl font-bold text-foreground">Why CvAura?</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                We combine intelligent parsing, career-focused scoring, and clean UI so you can focus on what matters most: getting hired.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-background/90 p-5">
                  <p className="text-sm font-semibold text-foreground">Fast feedback</p>
                  <p className="mt-2 text-sm text-muted-foreground">Instant resume analysis and tailored recommendations.</p>
                </div>
                <div className="rounded-3xl border border-border bg-background/90 p-5">
                  <p className="text-sm font-semibold text-foreground">Career-focused</p>
                  <p className="mt-2 text-sm text-muted-foreground">Designed for students, freshers, and experienced professionals.</p>
                </div>
                <div className="rounded-3xl border border-border bg-background/90 p-5">
                  <p className="text-sm font-semibold text-foreground">Modern design</p>
                  <p className="mt-2 text-sm text-muted-foreground">Polished visuals that look great in both themes.</p>
                </div>
                <div className="rounded-3xl border border-border bg-background/90 p-5">
                  <p className="text-sm font-semibold text-foreground">Data-driven</p>
                  <p className="mt-2 text-sm text-muted-foreground">Actionable insights that help resumes pass ATS screening.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-[#09090b]/80 p-8 text-white shadow-deep backdrop-blur-xl">
              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-primary">Our promise</p>
                  <h2 className="mt-4 text-3xl font-bold">A consistent experience in every mode.</h2>
                </div>
                <p className="text-sm leading-7 text-slate-300">
                  Whether users choose light mode or dark mode, CvAura maintains readability, contrast, and a premium visual tone. Our interface adapts while keeping every interaction intuitive.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">Theme-aware visuals</p>
                    <p className="mt-2 text-sm text-slate-300">Elements shift elegantly with theme changes.</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">Clean typography</p>
                    <p className="mt-2 text-sm text-slate-300">Content stays crisp and easy to scan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-primary">Get to know us</p>
          <h2 className="mt-4 text-3xl font-bold text-foreground">A team focused on resume intelligence and user trust.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            We build tools that feel modern, perform reliably, and empower users to present their strongest professional story.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Innovation", value: "AI-driven" },
              { label: "Clarity", value: "Easy to use" },
              { label: "Impact", value: "Resume-ready" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-border bg-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-primary">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
