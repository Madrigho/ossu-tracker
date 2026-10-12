import { describe, it, expect } from "vitest";
import { parseCurriculum, progressPercent, nextCourse, prerequisitesSatisfied, CurriculumParseError } from "../src/core/curriculum";

const mock = { Curriculum: [
  { "Section Name": "A", Explanation: "", Subsections: [
    { Name: "S1", Explanation: "", Courses: [
      { Name: "Intro", URL: "https://x/1", Effort: "5 hours", Prerequisites: "none" },
      { Name: "Intro", URL: "https://x/dup", Prerequisites: "" },
      { Name: "Next", URL: "https://x/2", Prerequisites: "Intro" } ] },
    { Name: "S2", Explanation: "", Courses: [{ Name: "Odd", Prerequisites: "some unknown prose" }] } ] },
  { "Section Name": "B", Explanation: "", Subsections: [{ Name: "S1", Explanation: "", Courses: [] }] } ] };

describe("curriculum", () => {
  const c = parseCurriculum(mock);
  it("dedupes, scopes subsection ids, slugs", () => {
    expect(c.courses.map((x) => x.id)).toEqual(["intro", "next", "odd"]);
    expect(c.subsections.map((s) => s.id)).toEqual(["a/s1", "a/s2", "b/s1"]);
  });
  it("resolves prerequisites; unknown = none; missing url = null", () => {
    expect(c.courses[1].prerequisites).toEqual(["intro"]);
    expect(c.courses[2].prerequisites).toEqual([]);
    expect(c.courses[2].url).toBeNull();
  });
  it("prerequisite satisfaction", () => {
    expect(prerequisitesSatisfied(c.courses[1], {})).toBe(false);
    expect(prerequisitesSatisfied(c.courses[1], { intro: "skipped" })).toBe(true);
  });
  it("progress excludes skipped", () => {
    expect(progressPercent(c.courses, { intro: "completed", odd: "skipped" })).toBe(50);
    expect(progressPercent(c.courses, { intro: "skipped", next: "skipped", odd: "skipped" })).toBe(0);
  });
  it("resume order", () => {
    expect(nextCourse(c.courses, { next: "in_progress" })?.id).toBe("next");
    expect(nextCourse(c.courses, {})?.id).toBe("intro");
    expect(nextCourse(c.courses, { intro: "in_progress" })?.id).toBe("intro");
    expect(nextCourse(c.courses, { intro: "completed", next: "completed", odd: "skipped" })).toBeNull();
  });
  it("rejects bad shape", () => expect(() => parseCurriculum({})).toThrow(CurriculumParseError));
});

describe("resume recency", () => {
  const c = parseCurriculum(mock);
  it("prefers the most recently touched in-progress course", () => {
    const p = { intro: "in_progress", next: "in_progress" } as const;
    expect(nextCourse(c.courses, p, { intro: "2026-01-01", next: "2026-02-01" })?.id).toBe("next");
    expect(nextCourse(c.courses, p, {})?.id).toBe("intro");
  });
});
