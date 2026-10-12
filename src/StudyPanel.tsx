import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Play, Square } from "lucide-react";
import { useStore } from "./store";
import { Course } from "./core/curriculum";
import { dailyTargetMinutes, estimateFinish, minutesOnDay, remainingHours, weekMinutes, WEEKLY_TARGET_MIN } from "./core/study";

const hm = (m: number) => `${Math.floor(m / 60)}h ${String(Math.floor(m % 60)).padStart(2, "0")}m`;
const Bar = ({ value, max }: { value: number; max: number }) => (
  <div className="mt-1 h-2 rounded bg-stone-200 dark:bg-stone-800"><div className="h-2 rounded bg-emerald-600" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
);

export default function StudyPanel({ next }: { next: Course | null }) {
  const { sessions, timer, curriculum, progress, startTimer, stopTimer, cancelTimer } = useStore();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const secs = timer ? Math.max(0, Math.floor((now.getTime() - new Date(timer.startedAt).getTime()) / 1000)) : 0;
  const running = secs / 60;
  const clock = [Math.floor(secs / 3600), Math.floor((secs % 3600) / 60), secs % 60].map((n) => String(n).padStart(2, "0")).join(":");
  const today = minutesOnDay(sessions, now) + running;
  const week = weekMinutes(sessions, now) + running;
  const target = dailyTargetMinutes(now);
  const rem = curriculum ? remainingHours(curriculum.courses, progress) : { hours: 0, unknown: 0 };
  const finish = estimateFinish(rem.hours, now);
  const timerCourse = timer ? curriculum?.courses.find((c) => c.id === timer.courseId) : null;

  return (
    <section className="rounded-lg border border-stone-300 p-4 dark:border-stone-700">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><div className="flex justify-between text-sm"><span>Today</span><span className="tabular-nums">{hm(today)} of {hm(target)}</span></div><Bar value={today} max={target} /></div>
        <div><div className="flex justify-between text-sm"><span>This week</span><span className="tabular-nums">{hm(week)} of {hm(WEEKLY_TARGET_MIN)}</span></div><Bar value={week} max={WEEKLY_TARGET_MIN} /></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        {timer ? (
          <>
            <span>Studying {timerCourse?.name ?? timer.courseId}</span>
            <span className="font-mono tabular-nums">{clock}</span>
            <button onClick={stopTimer} className="flex items-center gap-1 rounded bg-stone-900 px-3 py-1 text-white dark:bg-stone-100 dark:text-stone-900"><Square size={12} /> Stop and save</button>
            <button onClick={cancelTimer} className="underline">Discard</button>
          </>
        ) : next ? (
          <button onClick={() => startTimer(next.id)} className="flex items-center gap-1 rounded bg-stone-900 px-3 py-1 text-white dark:bg-stone-100 dark:text-stone-900"><Play size={12} /> Start timer: {next.name}</button>
        ) : null}
        {finish && <span className="ml-auto text-stone-600 dark:text-stone-400">At your goal pace: about {format(finish, "MMM yyyy")}</span>}
      </div>
      {finish && <p className="mt-1 text-xs text-stone-500">Rough upper bound: counts every listed course, including alternatives, and skips {rem.unknown} with no time estimate.</p>}
    </section>
  );
}