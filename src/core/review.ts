export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const reviewDue = (
  lastReviewAt: string | null,
  now: number = Date.now()
): boolean => {
  if (!lastReviewAt) return false;
  const t = new Date(lastReviewAt).getTime();
  if (!Number.isFinite(t)) return false;
  return now - t >= SEVEN_DAYS_MS;
};