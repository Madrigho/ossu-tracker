import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "./store";
import { Course } from "./core/curriculum";
import { localDay } from "./core/study";

export default function HistoryPanel({ courses }: { courses?: Course[] }) {
  const { sessions, addSession, updateSession, deleteSession } = useStore();
  const [newMinutes, setNewMinutes] = useState(30);
  const [newCourse, setNewCourse] = useState(courses?.[0]?.id ?? "");
  const [newDay, setNewDay] = useState(localDay(new Date()));
  const field =
    "rounded border border-stone-300 bg-transparent px-2 py-1 dark:border-stone-600";

  const nameFor = (id: string) =>
    courses?.find((c) => c.id === id)?.name ?? id;

  const sorted = sessions
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.day.localeCompare(a.s.day));

  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer">
        Session history ({sessions.length})
      </summary>
      <div className="mt-2">
        {sessions.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">
            No sessions logged yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {sorted.map(({ s, i }) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={s.day}
                  aria-label="Session date"
                  onChange={(e) => updateSession(i, { day: e.target.value })}
                  className={field}
                />
                <input
                  type="number"
                  min={1}
                  value={s.minutes}
                  aria-label="Session minutes"
                  onChange={(e) =>
                    updateSession(i, { minutes: Number(e.target.value) || 1 })
                  }
                  className={`w-20 ${field}`}
                />
                <span>min</span>
                <span className="truncate">{nameFor(s.courseId)}</span>
                <button
                  onClick={() => deleteSession(i)}
                  aria-label="Delete session"
                  className="ml-auto rounded border border-stone-300 px-2 py-1 dark:border-stone-600"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span>Add session:</span>
          <input
            type="date"
            value={newDay}
            onChange={(e) => setNewDay(e.target.value)}
            aria-label="New session date"
            className={field}
          />
          <input
            type="number"
            min={1}
            value={newMinutes}
            onChange={(e) => setNewMinutes(Number(e.target.value) || 1)}
            aria-label="New session minutes"
            className={`w-20 ${field}`}
          />
          <span>min</span>
          {courses && courses.length > 0 && (
            <select
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              aria-label="New session course"
              className={`max-w-xs ${field}`}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => {
              if (!newCourse) return;
              addSession(newMinutes, newCourse, newDay);
            }}
            className="flex items-center gap-1 rounded border border-stone-300 px-2 py-1 dark:border-stone-600"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </details>
  );
}