import { ChecklistItem } from "./checklist";

export type AutoTickEntry = {
  at: string;
  courseHint: string;
  courseId?: string;
  itemHint?: string;
  itemId?: string;
  itemLabel?: string;
  status: "ticked" | "unmatched" | "no-items";
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const findCourse = <T extends { id: string; name: string }>(
  courses: T[],
  hint: string
): T | undefined => {
  if (!hint) return undefined;
  const h = norm(hint);
  return (
    courses.find((c) => c.id === hint) ??
    courses.find((c) => norm(c.name) === h) ??
    courses.find((c) => norm(c.name).includes(h) || h.includes(norm(c.name)))
  );
};

export const pickNextItem = (
  items: ChecklistItem[] | undefined,
  itemHint?: string
): ChecklistItem | undefined => {
  const unchecked = (items ?? []).filter((i) => !i.done);
  if (unchecked.length === 0) return undefined;
  if (itemHint) {
    const h = itemHint.toLowerCase();
    const match = unchecked.find((i) => i.label.toLowerCase().includes(h));
    if (match) return match;
  }
  return unchecked[0];
};
