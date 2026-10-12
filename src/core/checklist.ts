export type ChecklistItem = {
  id: string; // uuid-ish: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  label: string; // e.g. "Week 3, Lecture 2"
  done: boolean;
};

export const firstUnchecked = (items: ChecklistItem[] | undefined) =>
  (items ?? []).find((i) => !i.done);

export const checklistPct = (items: ChecklistItem[] | undefined) => {
  const list = items ?? [];
  if (list.length === 0) return 0;
  return (list.filter((i) => i.done).length / list.length) * 100;
};

export const seedWeeks = (count: number): ChecklistItem[] =>
  Array.from({ length: Math.max(1, count) }, (_, i) => ({
    id: `seed-${i}-${Math.random().toString(36).slice(2, 8)}`,
    label: `Week ${i + 1}`,
    done: false,
  }));

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const newItem = (label: string): ChecklistItem => ({ id: mkId(), label: label.trim(), done: false });

export const addItem = (items: ChecklistItem[] | undefined, label: string): ChecklistItem[] =>
  label.trim() ? [...(items ?? []), newItem(label)] : items ?? [];

export const renameItem = (items: ChecklistItem[], id: string, label: string): ChecklistItem[] =>
  label.trim() ? items.map((i) => (i.id === id ? { ...i, label: label.trim() } : i)) : items;

export const toggleItem = (items: ChecklistItem[], id: string): ChecklistItem[] =>
  items.map((i) => (i.id === id ? { ...i, done: !i.done } : i));

export const deleteItem = (items: ChecklistItem[], id: string): ChecklistItem[] => items.filter((i) => i.id !== id);

/** Validate untrusted data (localStorage or an imported file) into { courseId: items }. */
export function sanitizeChecklists(raw: unknown): Record<string, ChecklistItem[]> {
  const out: Record<string, ChecklistItem[]> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [courseId, list] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue;
    const items = list
      .filter((x: any) => x && typeof x.id === "string" && typeof x.label === "string" && typeof x.done === "boolean")
      .map((x: any) => ({ id: x.id as string, label: x.label as string, done: x.done as boolean }));
    if (items.length) out[courseId] = items;
  }
  return out;
}