import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { metrics, stackGroups } from "../data/portfolioData";

type Kind = "cmd" | "out" | "ok";
interface Line { kind: Kind; text: string }

const BOOT: Line[] = [
  { kind: "cmd", text: "initializing NextVision architecture..." },
  { kind: "ok", text: "modules loaded: 12/12" },
  { kind: "out", text: "Lighthouse Performance: 99/100" },
  { kind: "out", text: "active_projects: 4" },
  { kind: "ok", text: "status: ready_to_ship" },
];

const COMMANDS: Record<string, string[]> = {
  whoami: [
    "Islombek Abduvaliyev",
    "Frontend & Full-Stack Engineer",
    "Founder, NextVision group",
    "location: Uzbekistan | open to select projects",
  ],
  stack: stackGroups.map((g) => `${g.title}: ${g.items.join(", ")}`),
  metrics: metrics.map((m) => `${m.label}: ${m.value}`),
  help: ["available commands: whoami, stack, metrics, clear"],
};

const TABS = ["whoami", "stack", "metrics"];

export default function LiveTerminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const timers = useRef<number[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  const enqueue = useCallback((batch: Line[], gap = 260) => {
    batch.forEach((line, i) => {
      const id = window.setTimeout(() => setLines((prev) => [...prev, line]), i * gap);
      timers.current.push(id);
    });
  }, []);

  useEffect(() => {
    enqueue(BOOT, 520);
    return () => timers.current.forEach((id) => window.clearTimeout(id));
  }, [enqueue]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === "clear") {
      timers.current.forEach((id) => window.clearTimeout(id));
      setLines([]);
      return;
    }
    const out = COMMANDS[cmd];
    setLines((prev) => [...prev, { kind: "cmd", text: cmd }]);
    if (out) enqueue(out.map((text) => ({ kind: "out" as Kind, text })), 140);
    else enqueue([{ kind: "out", text: `command not found: ${cmd}. Type "help".` }], 0);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 flex-1 truncate font-mono text-xs text-[var(--muted)]">nextvision@portfolio: ~</span>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => run(t)}
              className="rounded-md border border-[var(--line)] px-2 py-1 font-mono text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={bodyRef}
        className="h-72 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-6"
        aria-live="polite"
        onClick={() => document.getElementById("terminal-input")?.focus()}
      >
        {lines.map((l, i) => (
          <div key={i} className={l.kind === "ok" ? "text-emerald-400" : l.kind === "cmd" ? "text-[var(--fg)]" : "text-[var(--muted)]"}>
            <span className="mr-2 select-none text-emerald-400">{l.kind === "out" ? " " : ">"}</span>
            {l.text}
          </div>
        ))}
        <div className="flex items-center text-[var(--fg)]">
          <span className="mr-2 select-none text-emerald-400">$</span>
          <input
            id="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command"
            placeholder="type: whoami, stack, metrics"
            className="w-full bg-transparent outline-none placeholder:text-[var(--muted)]/60"
          />
        </div>
      </div>
    </div>
  );
}
