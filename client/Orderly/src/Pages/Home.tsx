import { useMemo, useState } from "react";
import RepoForm from "../Components/RepoForm";
import IssueCard from "../Components/IssueCard";
import type { Issue } from "../Components/IssueCard";

interface CategorizeResponse {
  repo: string;
  total_issues_analyzed: number;
  issues: Issue[];
}

const API_URL = "http://localhost:8000";

export default function Home() {
  const [data, setData] = useState<CategorizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const analyze = async (owner: string, repo: string) => {
    setLoading(true);
    setError(null);
    setFilter("all");
    try {
      const res = await fetch(`${API_URL}/categorize_issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail ?? `Request failed (${res.status})`);
      }
      setData(await res.json());
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    data?.issues.forEach((i) => {
      map[i.assigned_priority] = (map[i.assigned_priority] ?? 0) + 1;
    });
    return map;
  }, [data]);

  const visible =
    data?.issues.filter(
      (i) => filter === "all" || i.assigned_priority === filter,
    ) ?? [];

  return (
    <main>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M4 6h16M4 12h10M4 18h6" />
          </svg>
        </div>
        <h1 className="bg-linear-to-b from-white to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Orderly
        </h1>
        <p className="mt-3 text-slate-400">
          Bring order to your GitHub issue backlog.
        </p>
      </div>

      <RepoForm onSubmit={analyze} loading={loading} />

      {error && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-center text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/3"
            />
          ))}
        </div>
      )}

      {!loading && data && (
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="font-mono text-lg font-semibold">{data.repo}</h2>
            <p className="text-sm text-slate-400">
              <span className="text-xl font-bold text-white">
                {data.total_issues_analyzed}
              </span>{" "}
              issues analyzed
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["all", data.issues.length] as const,
              ...Object.entries(counts),
            ].map(([key, n]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition ${
                  filter === key
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                {key} <span className="ml-1 text-xs text-slate-500">{n}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {visible.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-slate-500">
                No issues to show.
              </p>
            ) : (
              visible.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            )}
          </div>
        </section>
      )}
    </main>
  );
}
