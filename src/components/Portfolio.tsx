import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Briefcase, Check, Copy, Moon, Sun } from "lucide-react";
import { metrics, profile, projects, stackGroups } from "../data/portfolioData";
import type { Project } from "../data/portfolioData";
import LiveTerminal from "./LiveTerminal";
import ProjectCard, { onSpotlight } from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import RobotCompanion from "./RobotCompanion";
import type { SectionId } from "./RobotCompanion";

type Theme = "dark" | "light";

const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");
.pf{--bg:#09090B;--card:#121215;--line:rgba(255,255,255,0.08);--fg:#fafafa;--muted:#a1a1aa;--glass:rgba(18,18,21,0.78);--spot:rgba(255,255,255,0.35);
background:var(--bg);color:var(--fg);font-family:Inter,ui-sans-serif,system-ui,sans-serif;min-height:100vh;transition:background .3s,color .3s}
.pf[data-theme="light"]{--bg:#F9F9FB;--card:#FFFFFF;--line:rgba(0,0,0,0.08);--fg:#0a0a0c;--muted:#5f5f68;--glass:rgba(255,255,255,0.8);--spot:rgba(0,0,0,0.4)}
.pf .font-mono{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
.pf *{transition-property:background-color,border-color,color;transition-duration:.25s}
.spot{position:relative}
.spot::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;opacity:0;
background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),var(--spot),transparent 60%);
-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;transition:opacity .25s}
.spot:hover::before{opacity:1}
@keyframes pfpulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.6)}70%{box-shadow:0 0 0 8px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
.pf-dot{animation:pfpulse 2s infinite}
@media (prefers-reduced-motion:reduce){.pf-dot{animation:none}html{scroll-behavior:auto!important}}
html{scroll-behavior:smooth}
`;

const NAV: { id: SectionId; label: string }[] = [
  { id: "about", label: "01. About" },
  { id: "architecture", label: "02. Architecture" },
  { id: "work", label: "03. Work" },
  { id: "contact", label: "04. Contact" },
];
const SECTION_IDS: SectionId[] = ["top", "about", "architecture", "work", "contact"];

export default function Portfolio() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem("pf-theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  const [active, setActive] = useState<SectionId>("top");
  const [selected, setSelected] = useState<Project | null>(null);
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("pf-theme", next);
    } catch {
      /* storage unavailable: theme still applies for this session */
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id as SectionId));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const closeModal = useCallback(() => setSelected(null), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = profile.email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pf" data-theme={theme}>
      <style>{STYLES}</style>

      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight">{profile.name}</span>
            <span className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
              <span className="pf-dot h-2 w-2 rounded-full bg-emerald-400" />
              Available for select projects
            </span>
          </a>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={`hidden rounded-md px-3 py-1.5 md:block ${active === n.id ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"}`}
              >
                {n.label}
              </a>
            ))}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="ml-2 rounded-md border border-[var(--line)] p-2 text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <section id="top" className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              Engineering silent, high-converting digital systems & fluid interfaces.
            </h1>
            <p className="mt-6 max-w-lg leading-relaxed text-[var(--muted)]">
              I’m {profile.name}, a frontend and full-stack engineer and the founder of NextVision group. I build
              fast products for education, services and startups, from the first sketch to the production deploy.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#contact" className="rounded-lg bg-[var(--fg)] px-5 py-2.5 text-sm font-medium text-[var(--bg)]">
                Start a Project
              </a>
              <a href="#work" className="rounded-lg border border-[var(--line)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--card)]">
                View Work
              </a>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm text-[var(--muted)]">
             <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--fg)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {profile.githubHandle}
            </a>
              <a href={profile.upwork} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--fg)]">
                <Briefcase size={16} /> Upwork
              </a>
            </div>
          </div>
          <LiveTerminal />
        </section>

        <section id="about" className="border-t border-[var(--line)] py-16">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight">Numbers that came from shipped work</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} onMouseMove={onSpotlight} className="spot rounded-xl border border-[var(--line)] bg-[var(--card)] p-6">
                <p className="text-3xl font-semibold tracking-tight md:text-4xl">{m.value}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="architecture" className="border-t border-[var(--line)] py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Tech stack & engineering capabilities</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {stackGroups.map((g, i) => (
              <div
                key={g.title}
                onMouseMove={onSpotlight}
                className={`spot rounded-xl border border-[var(--line)] bg-[var(--card)] p-6 ${i === 0 ? "md:col-span-2" : ""}`}
              >
                <h3 className="font-semibold">{g.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{g.blurb}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <span key={s} className="rounded-md border border-[var(--line)] px-2.5 py-1 font-mono text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="work" className="border-t border-[var(--line)] py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Selected projects & case studies</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={setSelected} onHoverChange={setHovering} />
            ))}
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-[var(--line)] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">Have a product that needs to ship well?</h2>
          <p className="mt-4 max-w-md text-[var(--muted)]">Send a short brief. I reply with scope, timeline and budget range.</p>
          <button
            onClick={copyEmail}
            className="mt-8 inline-flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--card)] px-5 py-3 font-mono text-sm hover:border-[var(--muted)]"
          >
            {profile.email}
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-[var(--muted)]" />}
          </button>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-[var(--muted)]">
            <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--fg)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {profile.githubHandle}
          </a>
            <a href={profile.upwork} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[var(--fg)]">
              <Briefcase size={15} /> Upwork <ArrowUpRight size={13} />
            </a>
          </div>
          <p className="mt-16 text-xs text-[var(--muted)]">© {new Date().getFullYear()} {profile.name}. Built with NextVision.</p>
        </div>
      </footer>

      <AnimatePresence>
        {copied && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-[var(--fg)] px-4 py-2 text-sm font-medium text-[var(--bg)]"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>

      <ProjectModal project={selected} onClose={closeModal} />
      <RobotCompanion theme={theme} section={active} thinking={hovering || selected !== null} />
    </div>
  );
}
