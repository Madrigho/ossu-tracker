import { describe, it, expect } from "vitest";
import { findCourse, pickNextItem } from "../src/core/autotick";

const courses = [
  { id: "python-for-everyone", name: "Python for Everyone" },
  { id: "core-programming", name: "Core Programming" },
];

describe("findCourse", () => {
  it("matches by exact id", () => {
    expect(findCourse(courses, "python-for-everyone")?.id).toBe("python-for-everyone");
  });
  it("matches by name", () => {
    expect(findCourse(courses, "Python for Everyone")?.id).toBe("python-for-everyone");
  });
  it("matches by partial", () => {
    expect(findCourse(courses, "Python for")?.id).toBe("python-for-everyone");
  });
  it("returns undefined for empty hint", () => {
    expect(findCourse(courses, "")).toBeUndefined();
  });
});

describe("pickNextItem", () => {
  const items = [
    { id: "1", label: "Week 1", done: true },
    { id: "2", label: "Week 2", done: false },
    { id: "3", label: "Week 3", done: false },
  ];
  it("picks first unchecked", () => {
    expect(pickNextItem(items)?.id).toBe("2");
  });
  it("respects item hint", () => {
    expect(pickNextItem(items, "Week 3")?.id).toBe("3");
  });
  it("returns undefined when all done", () => {
    expect(pickNextItem(items.map((i) => ({ ...i, done: true })))).toBeUndefined();
  });
});
