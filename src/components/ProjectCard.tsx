import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../data/portfolioData";

export const onSpotlight = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

interface Props {
  project: Project;
  onOpen: (project: Project) => void;
  onHoverChange: (hovering: boolean) => void;
}

const STATUS_STYLES: Record<Project["status"], string> = {
  Live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  "In Development": "border-amber-500/30 bg-amber-500/10 text-amber-500",
  Internal: "border-zinc-500/30 bg-zinc-500/10 text-[var(--muted)]",
};

export default function ProjectCard({ project, onOpen, onHoverChange }: Props) {
  return (
    <motion.article
      layout
      onMouseMove={onSpotlight}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      className="spot group flex flex-col rounded-xl border border-[var(--line)] bg-[var(--card)] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[var(--muted)]">
        <span>{project.index} / {project.year}</span>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${STATUS_STYLES[project.status]}`}>
            {project.status === "Internal" ? "Private System" : project.status}
          </span>
          <span className="rounded-full border border-[var(--line)] px-2.5 py-0.5">{project.category}</span>
        </div>
      </div>

      <h3 className="mt-5 text-2xl font-semibold tracking-tight">{project.title}</h3>

      <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-500">
        Client budget: {project.budget}
      </div>

      <blockquote className="mt-4 border-l border-[var(--line)] pl-4 text-sm leading-relaxed text-[var(--muted)]">
        Client vision: “{project.quote}”
      </blockquote>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span key={s} className="rounded-md border border-[var(--line)] px-2 py-1 font-mono text-[11px] text-[var(--muted)]">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-6">
        <button
          onClick={() => onOpen(project)}
          className="text-sm font-medium transition-transform group-hover:translate-x-1"
        >
          {project.status === "Live" ? "Inspect Case Study ->" : "View Architecture ->"}
        </button>

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 font-mono text-xs text-[var(--muted)] transition-colors hover:border-[var(--fg)] hover:text-[var(--fg)]"
          >
            Live Site <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </motion.article>
  );
}