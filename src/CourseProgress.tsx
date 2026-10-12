import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useStore } from "./store";
import { Course } from "./core/curriculum";
import { effortHours, midpoint, minutesForCourse } from "./core/study";
import { addItem, checklistPct, deleteItem, firstUnchecked, renameItem, seedWeeks, toggleItem } from "./core/checklist";

const hm = (m: number) => `${Math.floor(m / 60)}h ${String(Math.floor(m % 60)).padStart(2, "0")}m`;

const Bar = ({ pct, light }: { pct: number; light?: boolean }) => (
  <div className={`mt-1 h-1.5 w-56 rounded ${light ? "bg-white/30" : "bg-stone-200 dark:bg-stone-800"}`}>
    <div className={`h-1.5 rounded ${light ? "bg-white" : "bg-emerald-600"}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
  </div>
);

export default function CourseProgress({ c, editable, light }: { c: Course; editable?: boolean; light?: boolean }) {
  const { sessions, stoppedAt, setStoppedAt, checklists, setChecklist } = useStore();
  const items = checklists[c.id] ?? [];
  const [draft, setDraft] = useState(stoppedAt[c.id] ?? "");
  const [newLabel, setNewLabel] = useState("");
  const [weeks, setWeeks] = useState(/week/i.test(c.duration ?? "") ? Math.max(1, Math.round(midpoint(c.duration) ?? 4)) : Math.min(20, Math.max(1, Math.round((effortHours(c.effort, c.duration) ?? 32) / 8))));

  const est = effortHours(c.effort, c.duration);
  const logged = minutesForCourse(sessions, c.id);
  const timePct = est ? (logged / (est * 60)) * 100 : 0;
  const stop = firstUnchecked(items);
  const done = items.filter((i) => i.done).length;
  const muted = light ? "text-white/90" : "text-stone-600 dark:text-stone-400";
  const field = "rounded border border-stone-300 bg-transparent px-2 py-1 dark:border-stone-600";
  const add = () => { setChecklist(c.id, addItem(items, newLabel)); setNewLabel(""); };

  return (
    <div className={`mt-2 text-sm ${muted}`}>
      <div>Logged {hm(logged)}{est ? ` of about ${Math.round(est)}h` : ""}</div>
      {est ? <Bar pct={timePct} light={light} /> : null}

      {items.length > 0 && (
        <>
          <div className="mt-2">Checklist: {done} of {items.length} done ({Math.round(checklistPct(items))}%)</div>
          <Bar pct={checklistPct(items)} light={light} />
          <div className="mt-1">{stop ? `Stopped at: ${stop.label}` : "Checklist complete"}</div>
        </>
      )}

      {items.length === 0 && (editable ? (
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => draft !== (stoppedAt[c.id] ?? "") && setStoppedAt(c.id, draft)}
          placeholder="Stopped at (e.g. Week 3, lecture 2)" aria-label={`Where you stopped in ${c.name}`} className={`mt-2 w-full max-w-md ${field}`} />
      ) : stoppedAt[c.id] ? <div className="mt-1">Stopped at: {stoppedAt[c.id]}</div> : null)}

      {editable && (
        <details className="mt-2" open={items.length > 0}>
          <summary className="cursor-pointer">Checklist</summary>
          <ul className="mt-2 space-y-1">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-2">
                <input type="checkbox" checked={i.done} onChange={() => setChecklist(c.id, toggleItem(items, i.id))} aria-label={`Mark ${i.label} done`} />
                <input defaultValue={i.label} aria-label="Item label"
                  onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== i.label) setChecklist(c.id, renameItem(items, i.id, v)); else e.target.value = i.label; }}
                  className={`flex-1 rounded border border-transparent bg-transparent px-1 hover:border-stone-300 focus:border-stone-400 dark:hover:border-stone-600 ${i.done ? "line-through opacity-60" : ""}`} />
                <button onClick={() => setChecklist(c.id, deleteItem(items, i.id))} aria-label={`Delete ${i.label}`}><X size={14} /></button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex max-w-md gap-2">
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Add item (e.g. Week 3, lecture 2)" aria-label="New checklist item" className={`flex-1 ${field}`} />
            <button onClick={add} aria-label="Add item" className={`flex items-center ${field}`}><Plus size={14} /></button>
          </div>
          {items.length === 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span>Start with</span>
              <input type="number" min={1} max={60} value={weeks} onChange={(e) => setWeeks(Number(e.target.value) || 1)} aria-label="Number of weeks" className={`w-16 ${field}`} />
              <span>weeks</span>
              <button onClick={() => setChecklist(c.id, seedWeeks(weeks))} className={field}>Add weeks</button>
            </div>
          )}
        </details>
      )}
    </div>
  );
}