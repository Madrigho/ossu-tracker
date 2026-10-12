import { it, expect } from "vitest";
import { minutesForCourse } from "../src/core/study";
it("sums minutes per course", () => {
  const s = [{ courseId: "a", day: "2026-10-12", minutes: 60 }, { courseId: "b", day: "2026-10-12", minutes: 5 }, { courseId: "a", day: "2026-10-13", minutes: 30 }];
  expect(minutesForCourse(s, "a")).toBe(90);
  expect(minutesForCourse(s, "zzz")).toBe(0);
});