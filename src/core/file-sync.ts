/**
 * File System Access API wrapper.
 * Remembers a FileSystemFileHandle in IndexedDB so the app can write to
 * the same backup file across page loads.
 *
 * Chrome/Edge only. Firefox and Safari don't support this yet.
 */

const DB_NAME = "ossu-file-sync";
const STORE_NAME = "handles";
const HANDLE_KEY = "backup";

let dbPromise: Promise<IDBDatabase> | null = null;
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export type SyncState = "unsupported" | "unlinked" | "needs-permission" | "linked";

export const isSupported = (): boolean =>
  typeof window !== "undefined" && "showSaveFilePicker" in window;

export const getState = async (): Promise<SyncState> => {
  if (!isSupported()) return "unsupported";
  const handle = await idbGet<FileSystemFileHandle>(HANDLE_KEY);
  if (!handle) return "unlinked";
  const perm = await (handle as any).queryPermission({ mode: "readwrite" });
  return perm === "granted" ? "linked" : "needs-permission";
};

/** Opens the picker, stores the handle, returns the file name. */
export const pickFile = async (): Promise<string | null> => {
  if (!isSupported()) return null;
  const handle: FileSystemFileHandle = await (window as any).showSaveFilePicker({
    suggestedName: "tracker.json",
    types: [{ description: "OSSU tracker backup", accept: { "application/json": [".json"] } }],
  });
  await idbPut(HANDLE_KEY, handle);
  return handle.name;
};

/** Asks the browser to re-grant permission for a previously picked file. */
export const reconnect = async (): Promise<boolean> => {
  const handle = await idbGet<FileSystemFileHandle>(HANDLE_KEY);
  if (!handle) return false;
  const perm = await (handle as any).requestPermission({ mode: "readwrite" });
  return perm === "granted";
};

/** Writes the given text to the linked file. Throws if no handle or denied. */
export const writeToFile = async (text: string): Promise<void> => {
  const handle = await idbGet<FileSystemFileHandle>(HANDLE_KEY);
  if (!handle) throw new Error("No linked file");
  const perm = await (handle as any).queryPermission({ mode: "readwrite" });
  if (perm !== "granted") throw new Error("Permission not granted");
  const writable = await (handle as any).createWritable();
  await writable.write(text);
  await writable.close();
};

/** Reads the linked file's contents. */
export const readFromFile = async (): Promise<string | null> => {
  const handle = await idbGet<FileSystemFileHandle>(HANDLE_KEY);
  if (!handle) return null;
  const perm = await (handle as any).queryPermission({ mode: "readwrite" });
  if (perm !== "granted") return null;
  const file = await handle.getFile();
  return await file.text();
};

export const unlink = async (): Promise<void> => {
  await idbDelete(HANDLE_KEY);
};

/** Returns the current file's name, or null. */
export const currentFileName = async (): Promise<string | null> => {
  const handle = await idbGet<FileSystemFileHandle>(HANDLE_KEY);
  return handle ? handle.name : null;
};
