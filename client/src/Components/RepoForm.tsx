import { useState } from "react";
import type { FormEvent } from "react";

interface Props {
  onSubmit: (owner: string, repo: string) => void;
  loading: boolean;
}

export default function RepoForm({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = value
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
      .replace(/\/+$/, "");
    const [owner, repo] = cleaned.split("/");
    if (!owner || !repo) return setInvalid(true);
    setInvalid(false);
    onSubmit(owner, repo);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setInvalid(false);
          }}
          placeholder="owner/repo or GitHub URL"
          className={`flex-1 rounded-xl border bg-white/5 px-4 py-3.5 outline-none transition placeholder-slate-500 focus:ring-2 ${
            invalid
              ? "border-rose-500/50 focus:ring-rose-500/20"
              : "border-white/10 focus:border-indigo-400/50 focus:ring-indigo-500/20"
          }`}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="rounded-xl bg-linear-to-r from-indigo-500 to-fuchsia-500 px-6 py-3.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
      {invalid && (
        <p className="mt-2 text-sm text-rose-400">
          Use the format <code className="font-mono">owner/repo</code>.
        </p>
      )}
    </form>
  );
}
