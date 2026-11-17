import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, Lock, X } from "lucide-react";
import type { Project } from "../data/portfolioData";

interface Props {
  project: Project | null;
  onClose: () => void;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--line)] pt-6">
      <h4 className="mb-4 text-sm font-semibold">{title}</h4>
      {children}
    </section>
  );
}

export default function ProjectModal({ project, onClose }: Props) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-[var(--line)] bg-[var(--glass)] p-6 shadow-2xl backdrop-blur-2xl md:rounded-2xl md:p-10"
          >
            <button
              onClick={onClose}
              aria-label="Close case study"
              className="absolute right-4 top-4 rounded-md border border-[var(--line)] p-2 text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              <X size={16} />
            </button>

            <p className="font-mono text-xs text-[var(--muted)]">
              {project.index} / {project.year} / {project.category}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{project.title}</h3>
            <p className="mt-4 leading-relaxed text-[var(--muted)]">{project.overview}</p>

            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--fg)] px-4 py-2 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
              >
                Open live preview <ArrowUpRight size={15} />
              </a>
            ) : (
              <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3.5 py-2 font-mono text-xs text-[var(--muted)]">
                {project.status === "In Development" ? (
                  <>
                    <Clock size={14} className="text-amber-500" />
                    <span>In active development — live preview coming soon</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Private internal system — public access restricted</span>
                  </>
                )}
              </div>
            )}

            <div className="mt-10 space-y-8">
              <Block title="The client’s vision & budget breakdown">
                <p className="leading-relaxed text-[var(--muted)]">{project.vision}</p>
                <dl className="mt-4 divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] text-sm">
                  {project.budgetBreakdown.map((b) => (
                    <div key={b.item} className="flex justify-between gap-4 px-4 py-3">
                      <dt className="text-[var(--muted)]">{b.item}</dt>
                      <dd className="font-mono">{b.amount}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 px-4 py-3 font-medium">
                    <dt>Total budget</dt>
                    <dd className="font-mono text-emerald-500">{project.budget}</dd>
                  </div>
                </dl>
              </Block>

              <Block title="Engineering architecture & problem-solving">
                <ul className="space-y-4">
                  {project.architecture.map((a) => (
                    <li key={a.problem} className="rounded-lg border border-[var(--line)] p-4 text-sm leading-relaxed">
                      <p className="text-[var(--muted)]">Problem: {a.problem}</p>
                      <p className="mt-2">Solution: {a.solution}</p>
                    </li>
                  ))}
                </ul>
              </Block>

              <Block title="Measurable results">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {project.results.map((r) => (
                    <div key={r.label} className="rounded-lg border border-[var(--line)] p-4">
                      <p className="text-2xl font-semibold tracking-tight">{r.value}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{r.label}</p>
                    </div>
                  ))}
                </div>
              </Block>

              <div className="flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span key={s} className="rounded-md border border-[var(--line)] px-2 py-1 font-mono text-[11px] text-[var(--muted)]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}