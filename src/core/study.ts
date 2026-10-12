import { Course, ProgressMap } from "./curriculum";

export interface Session { courseId: string; day: string; minutes: number } // day = local YYYY-MM-DD

export const WEEKDAY_MIN = 180; // 3 h Mon-Fri
export const WEEKEND_MIN = 300; // 5 h Sat-Sun
export const WEEKLY_TARGET_MIN = 5 * WEEKDAY_MIN + 2 * WEEKEND_MIN; // 1500 = 25 h

export const localDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const dailyTargetMinutes = (d: Date) => (d.getDay() === 0 || d.getDay() === 6 ? WEEKEND_MIN : WEEKDAY_MIN);

export const minutesOnDay = (s: Session[], d: Date) => s.filter((x) => x.day === localDay(d)).reduce((a, x) => a + x.minutes, 0);

/** Minutes logged in the Monday-Sunday week containing d. */
export function weekMinutes(s: Session[], d: Date): number {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  const days = new Set(Array.from({ length: 7 }, (_, i) => localDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))));
  return s.filter((x) => days.has(x.day)).reduce((a, x) => a + x.minutes, 0);
}

/** First number, or midpoint of a range like "4-8" / "4–12". */
export function midpoint(text: string | null | undefined): number | null {
  const m = /(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?/.exec(text ?? "");
  return m ? (m[2] ? (parseFloat(m[1]) + parseFloat(m[2])) / 2 : parseFloat(m[1])) : null;
}

/** Total hours for a course: "X hours/week" x duration in weeks, or "X hours" total. null if unknown. */
export function effortHours(effort: string | null, duration: string | null): number | null {
  const e = effort ?? "";
  if (/hours?\s*\/\s*week/i.test(e)) {
    const perWeek = midpoint(e); const d = midpoint(duration);
    if (perWeek === null || d === null) return null;
    return perWeek * (/month/i.test(duration ?? "") ? d * 4.345 : d);
  }
  return /hours?/i.test(e) ? midpoint(e) : null;
}

/** Hours left across courses not completed/skipped; `unknown` counts courses with no usable estimate. */
export function remainingHours(courses: Course[], p: ProgressMap): { hours: number; unknown: number } {
  let hours = 0, unknown = 0;
  for (const c of courses) {
    const s = p[c.id] ?? "not_started";
    if (s === "completed" || s === "skipped") continue;
    const h = effortHours(c.effort, c.duration);
    if (h === null) unknown++; else hours += h;
  }
  return { hours, unknown };
}

/** Day the remaining hours are done if you hit every daily target from `from` onward (today counts in full). */
export function estimateFinish(hours: number, from: Date): Date | null {
  if (hours <= 0) return null;
  let left = hours * 60; const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 5000; i++) { left -= dailyTargetMinutes(d); if (left <= 0) return d; d.setDate(d.getDate() + 1); }
  return null;
}
export const minutesForCourse = (s: Session[], courseId: string) =>
  s.filter((x) => x.courseId === courseId).reduce((a, x) => a + x.minutes, 0);
