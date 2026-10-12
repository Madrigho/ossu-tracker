import { useEffect, useMemo, useRef, useState } from "react";
const openUrl = (u: string) => window.open(u, "_blank", "noopener");
import { formatDistanceToNow } from "date-fns";
import { Check, Circle, Download, ExternalLink, RefreshCw, Search, Upload } from "lucide-react";
import { useStore } from "./store";
import StudyPanel from "./StudyPanel";
import CourseProgress from "./CourseProgress";
import HistoryPanel from "./HistoryPanel";
import { Course, Status, nextCourse, prerequisitesSatisfied, progressPercent } from "./core/curriculum";

const LABEL: Record<Status, string> = { not_started: "Not started", in_progress: "In progress", completed: "Completed", skipped: "Skipped" };
const FILTERS = ["all", "not_started", "in_progress", "completed", "skipped"] as const;

function CourseCard({ c }: { c: Course }) {
  const { progress, notes, curriculum, setStatus, setNotes, touch } = useStore();
  const status = progress[c.id] ?? "not_started";
  const [draft, setDraft] = useState(notes[c.id] ?? "");
  const blocked = !prerequisitesSatisfied(c, progress) && status === "not_started";
  const prereqNames = c.prerequisites.map((id) => curriculum!.courses.find((x) => x.id === id)?.name).filter(Boolean);
  return (
    <article className="rounded-lg border border-stone-300 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex items-start gap-3">
        {status === "completed" ? <Check className="mt-1 text-emerald-600" size={18} /> : <Circle className={`mt-1 ${status === "in_progress" ? "fill-amber-400 text-amber-400" : "text-stone-400"}`} size={14} />}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{c.name}</h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {[c.effort, c.duration].filter(Boolean).join(", ")}
            {prereqNames.length > 0 && <span className={blocked ? " text-amber-700" : ""}>{" "}Needs {prereqNames.join(", ")}</span>}
          </p>
        </div>
        <select aria-label={`Status of ${c.name}`} value={status} onChange={(e) => setStatus(c.id, e.target.value as Status)}
          className="rounded border border-stone-300 bg-transparent px-2 py-1 text-sm dark:border-stone-600">
          {(Object.keys(LABEL) as Status[]).map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
        </select>
        <button disabled={!c.url} onClick={() => { if (c.url) { touch(c.id); openUrl(c.url); } }} className="flex items-center gap-1 rounded bg-stone-900 px-3 py-1 text-sm text-white disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900">
          Open course <ExternalLink size={14} />
        </button>
      </div>
      <div className="mt-3"><CourseProgress c={c} editable /></div>
      <details className="mt-3 text-sm"><summary className="cursor-pointer text-stone-600 dark:text-stone-400">Notes</summary>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => draft !== (notes[c.id] ?? "") && setNotes(c.id, draft)}
          className="mt-2 w-full rounded border border-stone-300 bg-transparent p-2 dark:border-stone-600" rows={3} />
      </details>
    </article>
  );
}

export default function App() {
  const { curriculum, progress, lastAccessed, activeSub, setActiveSub, banner, fatal, updatedAt, init, refresh, setStatus, exportJson, importJson, startTimer, timer } = useStore();
  const importRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "/" && document.activeElement?.tagName !== "TEXTAREA" && document.activeElement !== search.current) { e.preventDefault(); search.current?.focus(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const next = useMemo(() => (curriculum ? nextCourse(curriculum.courses, progress, lastAccessed) : null), [curriculum, progress, lastAccessed]);
  if (fatal) return <main className="p-8">Couldn't load the curriculum: {fatal}. <a className="underline" href="https://raw.githubusercontent.com/ossu/computer-science/JSON/curriculum.json">Open the raw file</a> <button className="underline" onClick={refresh}>Retry</button></main>;
  if (!curriculum) return <main className="p-8">Loading curriculum…</main>;

  const activeId = curriculum.subsections.some((u) => u.id === activeSub) ? (activeSub as string) : curriculum.subsections[0].id;
  const q = query.trim().toLowerCase();
  const visible = curriculum.courses.filter((c) => (q ? c.name.toLowerCase().includes(q) : c.subsectionId === activeId) && (filter === "all" || (progress[c.id] ?? "not_started") === filter));
  return (
    <div className="flex h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="flex items-center gap-4 border-b border-stone-300 px-4 py-2 dark:border-stone-700">
        <h1 className="font-semibold">OSSU CS Progress</h1>
        <label className="flex flex-1 items-center gap-2 rounded border border-stone-300 px-2 dark:border-stone-700"><Search size={14} />
          <input ref={search} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Escape" && (setQuery(""), search.current?.blur())} placeholder="Search courses (press /)" className="w-full bg-transparent py-1 outline-none" /></label>
        <div className="w-40" title="Overall progress"><div className="h-2 rounded bg-stone-200 dark:bg-stone-800"><div className="h-2 rounded bg-emerald-600" style={{ width: `${progressPercent(curriculum.courses, progress)}%` }} /></div></div>
        <span className="text-sm tabular-nums">{progressPercent(curriculum.courses, progress)}%</span>
        <button onClick={() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([exportJson()], { type: "application/json" })); a.download = "ossu-progress.json"; a.click(); }} aria-label="Export progress" title="Export progress"><Download size={16} /></button>
        <button onClick={() => importRef.current?.click()} aria-label="Import progress" title="Import progress"><Upload size={16} /></button>
        <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { importJson(await f.text()); } catch { alert("Not a valid progress export file."); } e.target.value = ""; }} />
        <button onClick={refresh} title={updatedAt ? `Curriculum updated ${formatDistanceToNow(new Date(updatedAt))} ago` : "Refresh curriculum"} aria-label="Refresh curriculum"><RefreshCw size={16} /></button>
      </header>
      {banner && <p className="bg-amber-100 px-4 py-1 text-sm text-amber-900">{banner} <button className="underline" onClick={refresh}>Retry</button></p>}
      <div className="flex min-h-0 flex-1">
        <nav className="w-72 overflow-y-auto border-r border-stone-300 p-3 text-sm dark:border-stone-700">
          {curriculum.sections.map((s) => (
            <div key={s.id} className="mb-3"><div className="flex justify-between font-semibold"><span>{s.name}</span><span className="tabular-nums">{progressPercent(curriculum.courses.filter((c) => c.sectionId === s.id), progress)}%</span></div>
              {curriculum.subsections.filter((u) => u.sectionId === s.id).map((u) => (
                <button key={u.id} onClick={() => { setActiveSub(u.id); setQuery(""); }} className={`mt-1 flex w-full justify-between rounded px-2 py-1 text-left ${u.id === activeId && !q ? "bg-stone-200 dark:bg-stone-800" : ""}`}>
                  <span>{u.name}</span><span className="tabular-nums text-stone-500">{progressPercent(curriculum.courses.filter((c) => c.subsectionId === u.id), progress)}%</span></button>))}
            </div>))}
        </nav>
        <main className="flex-1 space-y-3 overflow-y-auto p-4">
          <StudyPanel next={next} />
          {next ? (
            <div className="flex items-center justify-between rounded-lg bg-emerald-700 p-4 text-white">
              <div><p className="text-sm opacity-80">Next up</p><p className="text-lg font-semibold">{next.name}</p><CourseProgress c={next} light /></div>
              <div className="flex gap-2">
                {(progress[next.id] ?? "not_started") === "not_started" && <button className="rounded border border-white/60 px-3 py-1" onClick={() => setStatus(next.id, "in_progress")}>Start</button>}
                <button disabled={!next.url} className="rounded bg-white px-3 py-1 font-medium text-emerald-800 disabled:opacity-50" onClick={() => { if (next.url) { if (timer?.courseId !== next.id) startTimer(next.id); openUrl(next.url); } }}>Resume</button>
              </div>
            </div>) : <p className="rounded-lg bg-emerald-100 p-4 text-emerald-900">All courses completed!</p>}
          <div className="flex gap-1 text-sm">{FILTERS.map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded px-2 py-1 ${filter === f ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "border border-stone-300 dark:border-stone-700"}`}>{f === "all" ? "All" : LABEL[f]}</button>)}</div>
          {visible.length === 0 ? <p className="text-stone-500">No courses match.</p> : visible.map((c) => <CourseCard key={c.id} c={c} />)}
        </main>
      </div>
      <HistoryPanel />{/* ossu/history-mount */}
    </div>
  );
}
