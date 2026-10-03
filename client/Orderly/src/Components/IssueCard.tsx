import { useState } from "react";

export interface Issue {
  id: number;
  title: string;
  body: string;
  assigned_priority: string;
  match_scores: Record<string, number>;
}

const COLORS: Record<string, { badge: string; bar: string }> = {
  critical: {
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    bar: "from-rose-500 to-pink-500",
  },
  high: {
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    bar: "from-orange-500 to-amber-500",
  },
  medium: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    bar: "from-amber-400 to-yellow-400",
  },
  low: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    bar: "from-emerald-500 to-teal-400",
  },
};
const FALLBACK = {
  badge: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  bar: "from-indigo-500 to-violet-500",
};
const colorFor = (p: string) => COLORS[p.toLowerCase()] ?? FALLBACK;

export default function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false);
  const scores = Object.entries(issue.match_scores).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...scores.map(([, v]) => v));

  return (
    <article className="rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur transition hover:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-slate-500">#{issue.id}</p>
          <h3 className="mt-1 font-semibold leading-snug text-white">
            {issue.title}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${colorFor(issue.assigned_priority).badge}`}
        >
          {issue.assigned_priority}
        </span>
      </div>

      {issue.body?.trim() && (
        <p
          className={`mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-slate-400 ${open ? "" : "line-clamp-2"}`}
        >
          {issue.body}
        </p>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
      >
        {open ? "Hide details" : "Show match scores"}
      </button>

      {open && (
        <div className="mt-3 space-y-2.5 rounded-xl bg-black/20 p-4">
          {scores.map(([label, score]) => (
            <div key={label} className="flex items-center gap-3 text-xs">
              <span className="w-16 shrink-0 capitalize text-slate-400">
                {label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full bg-linear-to-r ${colorFor(label).bar}`}
                  style={{ width: `${Math.max(2, (score / max) * 100)}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-slate-300">
                {score.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
