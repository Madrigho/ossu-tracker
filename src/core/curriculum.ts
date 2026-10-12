// Core logic for OSSU CS Progress Tracker (pure TS, no UI/Tauri deps -> easy to unit test).
// Adapted to the REAL schema of ossu/computer-science@JSON/curriculum.json:
// { Curriculum: [{ "Section Name", Explanation, Subsections: [{ Name, Explanation,
//   "Topics Covered", Courses: [{ Name, URL, Effort, Duration, Prerequisites (free text), Alternative }] }] }] }

export type Status = "not_started" | "in_progress" | "completed" | "skipped";

export interface Course {
  id: string;
  sectionId: string;
  subsectionId: string;
  name: string;
  url: string | null;
  duration: string | null;
  effort: string | null;
  prerequisites: string[]; // resolved course ids only
  order: number; // global curriculum order
}
export interface Subsection { id: string; sectionId: string; name: string; explanation: string; order: number }
export interface Section { id: string; name: string; explanation: string; order: number }
export interface Curriculum { sections: Section[]; subsections: Subsection[]; courses: Course[] }

export class CurriculumParseError extends Error {}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Parse raw JSON. Throws CurriculumParseError if the shape is unexpected. */
export function parseCurriculum(raw: unknown): Curriculum {
  const root = (raw as any)?.Curriculum;
  if (!Array.isArray(root)) throw new CurriculumParseError("Missing top-level 'Curriculum' array");

  const out: Curriculum = { sections: [], subsections: [], courses: [] };
  const seenNames = new Set<string>();
  const seenUrls = new Set<string>();
  const prereqText = new Map<string, string>();
  let order = 0;

  root.forEach((s: any, si: number) => {
    if (typeof s?.["Section Name"] !== "string" || !Array.isArray(s.Subsections))
      throw new CurriculumParseError(`Section ${si} has unexpected shape`);
    const sectionId = slugify(s["Section Name"]);
    out.sections.push({ id: sectionId, name: s["Section Name"], explanation: s.Explanation ?? "", order: si });

    s.Subsections.forEach((sub: any, ui: number) => {
      // Subsection names repeat across sections (e.g. "Core Systems"), so scope ids by section.
      const subsectionId = `${sectionId}/${slugify(sub.Name ?? `sub-${ui}`)}`;
      out.subsections.push({ id: subsectionId, sectionId, name: sub.Name, explanation: sub.Explanation ?? "", order: ui });

      for (const c of sub.Courses ?? []) {
        if (!c?.Name) continue;
        const nameKey = String(c.Name).trim().toLowerCase();
        const url = c.URL ? String(c.URL) : null;
        if (seenNames.has(nameKey) || (url && seenUrls.has(url))) continue; // dedupe, keep first
        seenNames.add(nameKey);
        if (url) seenUrls.add(url);
        const id = slugify(c.Name);
        prereqText.set(id, String(c.Prerequisites ?? ""));
        out.courses.push({
          id, sectionId, subsectionId, name: c.Name, url,
          duration: c.Duration ?? null, effort: c.Effort ?? null,
          prerequisites: [], order: order++,
        });
      }
    });
  });

  // Prerequisites are free text ("none", "", prose, markdown links). Resolve by matching known
  // course names inside the text; anything unresolvable is treated as satisfied (per spec).
  for (const c of out.courses) {
    const text = (prereqText.get(c.id) ?? "").toLowerCase();
    if (!text || text.trim() === "none") continue;
    c.prerequisites = out.courses
      .filter((o) => o.id !== c.id && text.includes(o.name.toLowerCase()))
      .map((o) => o.id);
  }
  return out;
}

export type ProgressMap = Record<string, Status | undefined>;
const st = (p: ProgressMap, id: string): Status => p[id] ?? "not_started";

export function prerequisitesSatisfied(c: Course, p: ProgressMap): boolean {
  return c.prerequisites.every((id) => ["completed", "skipped"].includes(st(p, id)));
}

/** completed / (total - skipped); 0 when nothing counts. */
export function progressPercent(courses: Course[], p: ProgressMap): number {
  const skipped = courses.filter((c) => st(p, c.id) === "skipped").length;
  const done = courses.filter((c) => st(p, c.id) === "completed").length;
  const denom = courses.length - skipped;
  return denom <= 0 ? 0 : Math.round((done / denom) * 100);
}

/** Resume order: in_progress -> available not_started -> first not_started -> null (all done). */
function inProgressMostRecent(ordered: Course[], p: ProgressMap, last: Record<string, string>): Course | undefined {
  let best: Course | undefined;
  for (const c of ordered) {
    if (st(p, c.id) !== "in_progress") continue;
    if (!best || (last[c.id] ?? "") > (last[best.id] ?? "")) best = c;
  }
  return best;
}

export function nextCourse(courses: Course[], p: ProgressMap, last: Record<string, string> = {}): Course | null {
  const ordered = [...courses].sort((a, b) => a.order - b.order);
  return (
    inProgressMostRecent(ordered, p, last) ??
    ordered.find((c) => st(p, c.id) === "not_started" && prerequisitesSatisfied(c, p)) ??
    ordered.find((c) => st(p, c.id) === "not_started") ??
    null
  );
}
