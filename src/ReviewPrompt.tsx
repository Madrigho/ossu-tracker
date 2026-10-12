import { useStore } from "./store";
import { reviewDue } from "./core/review";

type Props = { courses?: Course[]; force?: boolean; onDone?: () => void };
import { toggleItem } from "./core/checklist";
import { Course } from "./core/curriculum";

export default function ReviewPrompt({ courses, force, onDone }: Props = {}) {
  const { checklists, setChecklist, lastReviewAt, dismissReview, progress } =
    useStore();

  if (!force && !reviewDue(lastReviewAt)) return null;

  const nameFor = (id: string) =>
    courses?.find((c) => c.id === id)?.name ?? id;

  const targets = Object.entries(checklists)
    .filter(([courseId, items]) => {
      const status = progress[courseId];
      if (status === "completed" || status === "skipped") return false;
      return items.some((i) => !i.done);
    })
    .map(([courseId, items]) => ({ courseId, items }));

  if (targets.length === 0) return null;

  const handleTick = (courseId: string, itemId: string) => {
    const fresh = useStore.getState().checklists[courseId] ?? [];
    setChecklist(courseId, toggleItem(fresh, itemId));
  };

  return (
    <div className="fixed left-1/2 top-2 z-50 w-[min(640px,calc(100vw-1rem))] -translate-x-1/2 rounded border border-emerald-600/50 bg-emerald-50 p-3 shadow-lg dark:border-emerald-500/40 dark:bg-emerald-950/95">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">Weekly review — what did you finish?</p>
          <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
            Tick items you completed since your last review. Changes save instantly.
          </p>
        </div>
        <button
          onClick={() => { dismissReview(); onDone?.(); }}
          className="rounded border border-stone-300 px-2 py-1 text-sm hover:bg-white/40 dark:border-stone-600"
        >
          Done
        </button>
      </div>
      <div className="mt-2 max-h-[60vh] space-y-3 overflow-auto pr-1">
        {targets.map(({ courseId, items }) => (
          <div key={courseId}>
            <p className="text-sm font-medium">{nameFor(courseId)}</p>
            <ul className="mt-1 space-y-1">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={i.done}
                    onChange={() => handleTick(courseId, i.id)}
                    aria-label={`Mark ${i.label} done`}
                  />
                  <span className={i.done ? "line-through opacity-60" : ""}>
                    {i.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}