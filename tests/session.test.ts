import { describe, it, expect } from "vitest";
import {
  addSessionToList,
  updateSessionInList,
  deleteSessionFromList,
  Session,
} from "../src/core/study";

const base: Session[] = [
  { courseId: "a", day: "2026-10-12", minutes: 60 },
  { courseId: "b", day: "2026-10-13", minutes: 30 },
];

describe("session list helpers", () => {
  it("adds a session with rounded minutes", () => {
    const out = addSessionToList(base, 45.4, "c", "2026-10-14");
    expect(out).toHaveLength(3);
    expect(out[2]).toEqual({ courseId: "c", day: "2026-10-14", minutes: 45 });
  });
  it("clamps add to at least 1 minute", () => {
    expect(addSessionToList(base, 0, "c", "2026-10-14")[2].minutes).toBe(1);
    expect(addSessionToList(base, -5, "c", "2026-10-14")[2].minutes).toBe(1);
  });
  it("updates a session by index", () => {
    const out = updateSessionInList(base, 1, { minutes: 90 });
    expect(out[1].minutes).toBe(90);
    expect(out[0]).toEqual(base[0]);
  });
  it("clamps update to at least 1 minute", () => {
    expect(updateSessionInList(base, 0, { minutes: 0 })[0].minutes).toBe(1);
  });
  it("deletes a session by index", () => {
    expect(deleteSessionFromList(base, 0)).toEqual([base[1]]);
  });
  it("returns the same list on out-of-range index", () => {
    expect(updateSessionInList(base, 99, { minutes: 5 })).toEqual(base);
    expect(deleteSessionFromList(base, 99)).toEqual(base);
  });
});