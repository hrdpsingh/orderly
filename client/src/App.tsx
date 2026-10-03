import Home from "./Pages/Home";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-125 w-200 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-32 h-100 w-100 rounded-full bg-fuchsia-600/10 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-4 py-16">
        <Home />
      </div>
    </div>
  );
}
