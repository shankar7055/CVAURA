import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Globe, Mail, MessageSquare, Phone, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactCards = [
  {
    title: "Email",
    value: "akshatarya2507@gmail.com",
    href: "mailto:akshatarya2507@gmail.com",
    icon: Mail,
    description: "Reach out for product questions, collaboration ideas, or platform support.",
  },
  {
    title: "Mobile",
    value: "+91 8708364385",
    href: "tel:+918708364385",
    icon: Phone,
    description: "Prefer a direct conversation? Connect by phone for quick assistance.",
  },
  {
    title: "Linkedin",
    value: "https://www.linkedin.com/in/akshat--arya/",
    href: "https://www.linkedin.com/in/akshat--arya/",
    icon: Globe,
    description: "Explore professional updates, experience, and connect through LinkedIn.",
  },
  {
    title: "GitHub",
    value: "https://github.com/beastzex/",
    href: "https://github.com/beastzex/",
    icon: Globe,
    description: "See projects, code, and technical work on GitHub.",
  },
];

// ── Web3Forms ───────────────────────────────────────────────────────────
// To activate:
// 1. Go to https://web3forms.com
// 2. Enter your email (akshatarya2507@gmail.com) — no signup needed
// 3. You'll receive an access key in your inbox instantly
// 4. Paste it below replacing "YOUR_ACCESS_KEY_HERE"
const WEB3FORMS_ACCESS_KEY = "0dfd66fa-14f2-4352-82cd-5752e3e60cfd";

const Contact = () => {
  const { isDark } = useApp();
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSending(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `CvAura Contact: Message from ${formData.name}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSent(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSent(false), 5000);
      } else {
        setError("Failed to send message. Please try again or email directly.");
      }
    } catch (err) {
      console.error("Web3Forms error:", err);
      setError("Failed to send message. Please try again or email directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden px-4 py-20 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-deep backdrop-blur-xl sm:p-10"
          >
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/20">
                  <Sparkles className="h-4 w-4" />
                  Contact Us
                </p>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Let's build a sharper resume experience together.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                  Whether you want to share feedback, report an issue, or discuss improvements for CvAura, we'd love to hear from you. Every message helps us refine the product and create a more polished experience for every user.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {contactCards.map((item, index) => (
                    <motion.a
                      key={item.title}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
                      whileHover={{ y: -4 }}
                      className="group rounded-3xl border border-border bg-background/90 p-5 transition-all hover:border-primary/30 hover:shadow-glow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                      <h2 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h2>
                      <p className="mt-2 break-words text-sm font-medium text-foreground/90">{item.value}</p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </motion.a>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`rounded-[2rem] border border-border p-8 shadow-deep backdrop-blur-xl ${isDark ? "bg-[#09090b]/80 text-white" : "bg-background/95"}`}
              >
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-primary">
                    Send feedback
                  </p>
                  <h2 className={`mt-4 text-3xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>
                    Share your thoughts with CvAura
                  </h2>
                  <p className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-muted-foreground"}`}>
                    Use the form below to tell us what's working, what can improve, and how our resume analyzer can serve you better.
                  </p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={isDark ? "text-white" : "text-foreground"}>
                      enter your name
                    </Label>
                    <Input
                      id="name"
                      placeholder="enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      className={isDark ? "h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-primary" : "h-11 rounded-2xl border-border bg-background"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className={isDark ? "text-white" : "text-foreground"}>
                      your email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your email"
                      value={formData.email}
                      onChange={handleChange}
                      className={isDark ? "h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-primary" : "h-11 rounded-2xl border-border bg-background"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className={isDark ? "text-white" : "text-foreground"}>
                      your message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Your feedback using our resume analyzer"
                      value={formData.message}
                      onChange={handleChange}
                      className={isDark ? "min-h-[170px] rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-primary" : "min-h-[170px] rounded-2xl border-border bg-background"}
                    />
                  </div>

                  <div className={`rounded-3xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-border bg-secondary/30"}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
                          Your feedback using our resume analyzer
                        </p>
                        <p className={`mt-1 text-sm leading-6 ${isDark ? "text-slate-300" : "text-muted-foreground"}`}>
                          We appreciate insights on analysis quality, ATS scoring, editing suggestions, and overall usability.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status messages */}
                  {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  )}
                  {sent && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-500">Message sent successfully! We'll get back to you soon.</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-95 hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send message"
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-deep backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.28em] text-primary">Why connect with us</p>
              <h2 className="mt-4 text-3xl font-bold text-foreground">We listen closely to every product conversation.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                CvAura is built around clarity, trust, and actionable intelligence. Your suggestions help us improve resume analysis, make the editor more intuitive, and shape a premium experience in both light and dark modes.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Support", value: "Responsive" },
                  { label: "Feedback", value: "Valued" },
                  { label: "Product", value: "Evolving" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-border bg-background/80 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-primary">{item.label}</p>
                    <p className="mt-3 text-xl font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-deep backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Availability</p>
              <h2 className="mt-4 text-3xl font-bold text-foreground">Open to feedback, ideas, and collaboration.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Reach out through email, phone, LinkedIn, or GitHub. If you've used CvAura and have feedback on the analyzer, form flow, or overall polish, we're always happy to hear from you.
              </p>
              <div className="mt-6 space-y-4">
                <a
                  href="mailto:akshatarya2507@gmail.com"
                  className="flex items-center justify-between rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <span>akshatarya2507@gmail.com</span>
                  <Mail className="h-4 w-4" />
                </a>
                <a
                  href="tel:+918708364385"
                  className="flex items-center justify-between rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <span>+91 8708364385</span>
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
