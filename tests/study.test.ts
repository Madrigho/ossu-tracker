import { describe, it, expect } from "vitest";
import { dailyTargetMinutes, weekMinutes, minutesOnDay, midpoint, effortHours, estimateFinish, WEEKLY_TARGET_MIN } from "../src/core/study";

describe("study", () => {
  it("targets: 3h weekdays, 5h weekends, 25h/week", () => {
    expect(dailyTargetMinutes(new Date(2026, 9, 12))).toBe(180); // Mon
    expect(dailyTargetMinutes(new Date(2026, 9, 17))).toBe(300); // Sat
    expect(dailyTargetMinutes(new Date(2026, 9, 18))).toBe(300); // Sun
    expect(WEEKLY_TARGET_MIN).toBe(1500);
  });
  it("day and Monday-Sunday week sums", () => {
    const s = [{ courseId: "a", day: "2026-10-12", minutes: 60 }, { courseId: "a", day: "2026-10-18", minutes: 30 }, { courseId: "a", day: "2026-10-19", minutes: 99 }];
    expect(minutesOnDay(s, new Date(2026, 9, 12))).toBe(60);
    expect(weekMinutes(s, new Date(2026, 9, 14))).toBe(90);
    expect(weekMinutes(s, new Date(2026, 9, 18))).toBe(90);
  });
  it("parses ranges and effort hours", () => {
    expect(midpoint("4–12 hours/week")).toBe(8);
    expect(effortHours("6 hours/week", "10 weeks")).toBe(60);
    expect(effortHours("4-8 hours/week", "6 months")).toBeCloseTo(6 * 4.345 * 6, 1);
    expect(effortHours("58 hours", null)).toBe(58);
    expect(effortHours(null, "4 weeks")).toBeNull();
    expect(effortHours("6 hours/week", null)).toBeNull();
  });
  it("estimates finish by simulating daily targets", () => {
    const d = estimateFinish(20, new Date(2026, 9, 12));
    expect(d && [d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 17]);
    expect(estimateFinish(0, new Date())).toBeNull();
  });
});