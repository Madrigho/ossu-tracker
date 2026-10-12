/** Safe localStorage helpers + rolling backups + download. */
const NS = "ossu.";
const BACKUP_PREFIX = `${NS}backup.`;
const MAX_BACKUPS = 5;

export const safeWrite = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    window.dispatchEvent(new CustomEvent("ossu:storage-error", { detail: msg }));
    return false;
  }
};

export const safeRead = <T>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

/** Save a rolling snapshot of the whole app state. Keeps last N. */
export const snapshot = (payload: unknown) => {
  try {
    localStorage.setItem(`${BACKUP_PREFIX}${Date.now()}`, JSON.stringify(payload));
    pruneBackups();
  } catch { /* storage full - skip silently; real writes will trigger the banner */ }
};

const pruneBackups = () => {
  try {
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith(BACKUP_PREFIX))
      .sort();
    while (keys.length > MAX_BACKUPS) localStorage.removeItem(keys.shift()!);
  } catch { /* ignore */ }
};

export const listBackups = (): { key: string; ts: number }[] => {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(BACKUP_PREFIX))
      .map((k) => ({ key: k, ts: Number(k.slice(BACKUP_PREFIX.length)) }))
      .filter((x) => Number.isFinite(x.ts))
      .sort((a, b) => b.ts - a.ts);
  } catch { return []; }
};

export const readBackup = (key: string): unknown => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};

export const download = (filename: string, text: string) => {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};