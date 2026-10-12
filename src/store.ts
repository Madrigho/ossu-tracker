import { create } from "zustand";
import { Curriculum, ProgressMap, Status, parseCurriculum } from "./core/curriculum";
import { Session, localDay, addSessionToList, updateSessionInList, deleteSessionFromList } from "./core/study";
import { ChecklistItem, sanitizeChecklists } from "./core/checklist";
import { download, snapshot } from "./core/persist";

const URL = "https://raw.githubusercontent.com/ossu/computer-science/JSON/curriculum.json";
const K = { progress: "ossu.progress", notes: "ossu.notes", json: "ossu.curriculum", at: "ossu.updatedAt", last: "ossu.lastAccessed", sub: "ossu.activeSub", sessions: "ossu.sessions", timer: "ossu.timer", stopped: "ossu.stoppedAt", checklists: "ossu.checklists" };
const STATUSES = ["not_started", "in_progress", "completed", "skipped"];

const read = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full or blocked */ } };

interface State {
  curriculum: Curriculum | null; progress: ProgressMap; notes: Record<string, string>;
  lastAccessed: Record<string, string>; activeSub: string | null;
  updatedAt: string | null; banner: string | null; fatal: string | null;
  init: () => Promise<void>; refresh: () => Promise<void>;
  setStatus: (id: string, s: Status) => Promise<void>; setNotes: (id: string, n: string) => Promise<void>;
  touch: (id: string) => void; setActiveSub: (id: string) => void;
  sessions: Session[]; timer: { courseId: string; startedAt: string } | null;
  stoppedAt: Record<string, string>; setStoppedAt: (id: string, text: string) => void;
  checklists: Record<string, ChecklistItem[]>; setChecklist: (courseId: string, items: ChecklistItem[]) => void;
  rehydrate: () => void;
  backupNow: () => void;
  addSession: (minutes: number, courseId: string, day?: string) => void;
  updateSession: (index: number, patch: Partial<Session>) => void;
  deleteSession: (index: number) => void;
  startTimer: (id: string) => void; stopTimer: () => void; cancelTimer: () => void;
  exportJson: () => string; importJson: (text: string) => void;
}

export const useStore = create<State>((set, get) => ({
  curriculum: null, progress: {}, notes: {}, lastAccessed: {}, activeSub: null, sessions: [], timer: null, stoppedAt: {}, checklists: {}, updatedAt: null, banner: null, fatal: null,
  async init() {
    set({
      progress: read<ProgressMap>(K.progress, {}), notes: read<Record<string, string>>(K.notes, {}),
      lastAccessed: read<Record<string, string>>(K.last, {}), activeSub: localStorage.getItem(K.sub),
      stoppedAt: read<Record<string, string>>(K.stopped, {}), checklists: sanitizeChecklists(read<unknown>(K.checklists, {})), sessions: read<Session[]>(K.sessions, []), timer: read<{ courseId: string; startedAt: string } | null>(K.timer, null),
    });
    const cached = localStorage.getItem(K.json);
    if (cached) {
      try { set({ curriculum: parseCurriculum(JSON.parse(cached)), updatedAt: localStorage.getItem(K.at) }); } catch { /* refetch below */ }
    }
    await get().refresh();
  },
  async refresh() {
    try {
      const res = await fetch(URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const raw = await res.text();
      const curriculum = parseCurriculum(JSON.parse(raw)); // throws before a good cache is overwritten
      const now = new Date().toISOString();
      try { localStorage.setItem(K.json, raw); localStorage.setItem(K.at, now); } catch { /* ignore */ }
      set({ curriculum, updatedAt: now, banner: null, fatal: null });
    } catch (e) {
      if (get().curriculum) set({ banner: "Offline or curriculum unavailable. Showing the saved copy." });
      else set({ fatal: String(e) });
    }
  },
  async setStatus(id, s) {
    const progress = { ...get().progress, [id]: s };
    const lastAccessed = { ...get().lastAccessed, [id]: new Date().toISOString() };
    set({ progress, lastAccessed }); write(K.progress, progress); write(K.last, lastAccessed);
  },
  async setNotes(id, n) {
    const notes = { ...get().notes, [id]: n };
    set({ notes }); write(K.notes, notes);
  },
  touch(id) {
    const lastAccessed = { ...get().lastAccessed, [id]: new Date().toISOString() };
    set({ lastAccessed }); write(K.last, lastAccessed);
  },
  setActiveSub(id) {
    set({ activeSub: id });
    try { localStorage.setItem(K.sub, id); } catch { /* ignore */ }
  },
  setChecklist(courseId, items) {
    const checklists = { ...get().checklists, [courseId]: items };
    set({ checklists }); write(K.checklists, checklists);
    get().touch(courseId);
  },
  rehydrate() {
    const cur = get();
    set({
      progress: read(K.progress, cur.progress),
      notes: read(K.notes, cur.notes),
      lastAccessed: read(K.last, cur.lastAccessed),
      sessions: read(K.sessions, cur.sessions),
      stoppedAt: read(K.stopped, cur.stoppedAt),
      checklists: sanitizeChecklists(read(K.checklists, cur.checklists)),
    });
  },
  backupNow() {
    const { progress, notes, lastAccessed, sessions, stoppedAt, checklists } = get();
    snapshot({ progress, notes, lastAccessed, sessions, stoppedAt, checklists });
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
    download(`ossu-backup-${stamp}.json`, JSON.stringify(
      { version: 1, exportedAt: new Date().toISOString(), progress, notes, lastAccessed, sessions, stoppedAt, checklists },
      null, 2));
  },
  addSession(minutes, courseId, day) {
    const sessions = addSessionToList(get().sessions, minutes, courseId, day ?? localDay(new Date()));
    set({ sessions }); write(K.sessions, sessions);
    get().touch(courseId);
  },
  updateSession(index, patch) {
    const sessions = updateSessionInList(get().sessions, index, patch);
    set({ sessions }); write(K.sessions, sessions);
  },
  deleteSession(index) {
    const sessions = deleteSessionFromList(get().sessions, index);
    set({ sessions }); write(K.sessions, sessions);
  },
  setStoppedAt(id, text) {
    const stoppedAt = { ...get().stoppedAt, [id]: text };
    set({ stoppedAt }); write(K.stopped, stoppedAt);
  },
  startTimer(id) {
    if (get().timer) get().stopTimer();
    const timer = { courseId: id, startedAt: new Date().toISOString() };
    set({ timer }); write(K.timer, timer);
    if ((get().progress[id] ?? "not_started") === "not_started") void get().setStatus(id, "in_progress");
    else get().touch(id);
  },
  stopTimer() {
    const t = get().timer; if (!t) return;
    const minutes = Math.round((Date.now() - new Date(t.startedAt).getTime()) / 60000);
    const sessions = minutes >= 1 ? [...get().sessions, { courseId: t.courseId, day: localDay(new Date()), minutes }] : get().sessions;
    set({ sessions, timer: null }); write(K.sessions, sessions);
    try { localStorage.removeItem(K.timer); } catch { /* ignore */ }
    get().touch(t.courseId);
  },
  cancelTimer() {
    set({ timer: null });
    try { localStorage.removeItem(K.timer); } catch { /* ignore */ }
  },
  exportJson() {
    const { progress, notes, lastAccessed, sessions, stoppedAt, checklists } = get();
    snapshot({ progress, notes, lastAccessed, sessions, stoppedAt, checklists });
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), progress, notes, lastAccessed, sessions, stoppedAt, checklists }, null, 2);
  },
  importJson(text) {
    const d = JSON.parse(text);
    if (!d || typeof d.progress !== "object" || d.progress === null) throw new Error("Not a progress export");
    for (const v of Object.values(d.progress)) if (!STATUSES.includes(v as string)) throw new Error("Unknown status");
    const notes = d.notes && typeof d.notes === "object" ? d.notes : {};
    const lastAccessed = d.lastAccessed && typeof d.lastAccessed === "object" ? d.lastAccessed : {};
    const sessions: Session[] = Array.isArray(d.sessions)
      ? d.sessions.filter((x: any) => x && typeof x.courseId === "string" && typeof x.day === "string" && typeof x.minutes === "number")
      : get().sessions;
    const stoppedAt: Record<string, string> = d.stoppedAt && typeof d.stoppedAt === "object" ? d.stoppedAt : get().stoppedAt;
    const checklists = d.checklists === undefined ? get().checklists : sanitizeChecklists(d.checklists);
    if (!window.confirm("Replace all current progress with the imported file?\n\nA backup of the current state will be saved to your Downloads folder first.")) return;
    const cur0 = get();
    const stamp0 = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
    download(`ossu-pre-import-${stamp0}.json`, JSON.stringify(
      { version: 1, exportedAt: new Date().toISOString(), progress: cur0.progress, notes: cur0.notes, lastAccessed: cur0.lastAccessed, sessions: cur0.sessions, stoppedAt: cur0.stoppedAt, checklists: cur0.checklists },
      null, 2));
    snapshot({ progress: cur0.progress, notes: cur0.notes, lastAccessed: cur0.lastAccessed, sessions: cur0.sessions, stoppedAt: cur0.stoppedAt, checklists: cur0.checklists });
    set({ progress: d.progress, notes, lastAccessed, sessions, stoppedAt, checklists });
    write(K.progress, d.progress); write(K.notes, notes); write(K.last, lastAccessed); write(K.sessions, sessions); write(K.stopped, stoppedAt); write(K.checklists, checklists);
  },
}));
// ossu/cross-tab: keep multiple tabs in sync via the storage event.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith("ossu.")) return;
    try { useStore.getState().rehydrate(); } catch { /* ignore */ }
  });
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      try { useStore.getState().backupNow(); } catch { /* ignore */ }
    }
  });
}