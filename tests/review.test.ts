import { describe, it, expect } from "vitest";
import { reviewDue, SEVEN_DAYS_MS } from "../src/core/review";

describe("reviewDue", () => {
  it("returns false when never reviewed", () => {
    expect(reviewDue(null)).toBe(false);
  });
  it("returns false when last review is recent", () => {
    const now = Date.now();
    const recent = new Date(now - 1000).toISOString();
    expect(reviewDue(recent, now)).toBe(false);
  });
  it("returns true when last review is older than 7 days", () => {
    const now = Date.now();
    const old = new Date(now - SEVEN_DAYS_MS - 1000).toISOString();
    expect(reviewDue(old, now)).toBe(true);
  });
  it("returns false for invalid timestamps", () => {
    expect(reviewDue("not-a-date")).toBe(false);
  });
});