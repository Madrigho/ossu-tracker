import { describe, it, expect } from "vitest";
import { addItem, checklistPct, deleteItem, firstUnchecked, renameItem, sanitizeChecklists, seedWeeks, toggleItem, ChecklistItem } from "../src/core/checklist";

const mk = (): ChecklistItem[] => [
  { id: "a", label: "Week 1", done: true },
  { id: "b", label: "Week 2", done: false },
  { id: "c", label: "Week 3", done: false },
];

describe("checklist", () => {
  it("first unchecked lookup", () => {
    expect(firstUnchecked(mk())?.id).toBe("b");
    expect(firstUnchecked(mk().map((i) => ({ ...i, done: true })))).toBeUndefined();
    expect(firstUnchecked(undefined)).toBeUndefined();
  });
  it("percentage math", () => {
    expect(checklistPct(mk())).toBeCloseTo(33.33, 1);
    expect(checklistPct([])).toBe(0);
    expect(checklistPct(undefined)).toBe(0);
    expect(checklistPct(mk().map((i) => ({ ...i, done: true })))).toBe(100);
  });
  it("seedWeeks makes at least one week", () => {
    expect(seedWeeks(3).map((i) => i.label)).toEqual(["Week 1", "Week 2", "Week 3"]);
    expect(seedWeeks(0)).toHaveLength(1);
    expect(new Set(seedWeeks(5).map((i) => i.id)).size).toBe(5);
  });
  it("item CRUD", () => {
    const added = addItem(mk(), "  Final exam ");
    expect(added).toHaveLength(4);
    expect(added[3]).toMatchObject({ label: "Final exam", done: false });
    expect(addItem(mk(), "   ")).toHaveLength(3);
    expect(renameItem(mk(), "b", "Week Two")[1].label).toBe("Week Two");
    expect(renameItem(mk(), "b", "  ")[1].label).toBe("Week 2");
    expect(toggleItem(mk(), "b")[1].done).toBe(true);
    expect(toggleItem(toggleItem(mk(), "b"), "b")[1].done).toBe(false);
    expect(deleteItem(mk(), "a").map((i) => i.id)).toEqual(["b", "c"]);
  });
  it("persistence round-trip and bad data", () => {
    const data = { x: mk() };
    expect(sanitizeChecklists(JSON.parse(JSON.stringify(data)))).toEqual(data);
    expect(sanitizeChecklists(null)).toEqual({});
    expect(sanitizeChecklists([1])).toEqual({});
    expect(sanitizeChecklists({ x: [{ id: 1 }, { id: "z", label: "ok", done: false, extra: 1 }], y: "no", z: [] }))
      .toEqual({ x: [{ id: "z", label: "ok", done: false }] });
  });
});