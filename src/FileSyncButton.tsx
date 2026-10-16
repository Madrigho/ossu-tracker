import { useEffect, useState } from "react";
import { Link2, RefreshCw } from "lucide-react";
import {
  currentFileName,
  getState,
  pickFile,
  reconnect,
  isSupported,
  SyncState,
} from "./core/file-sync";

export default function FileSyncButton() {
  const [state, setState] = useState<SyncState>("unlinked");
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!isSupported()) { setState("unsupported"); return; }
    const s = await getState();
    setState(s);
    setFileName(await currentFileName());
  };

  useEffect(() => {
    void refresh();
    const t = setInterval(() => { void refresh(); }, 4000);
    return () => clearInterval(t);
  }, []);

  if (state === "unsupported") return null;

  const onLink = async () => {
    setBusy(true);
    try {
      const name = await pickFile();
      if (name) { setFileName(name); await refresh(); }
    } catch { /* user cancelled */ }
    setBusy(false);
  };

  const onReconnect = async () => {
    setBusy(true);
    const ok = await reconnect();
    setBusy(false);
    if (ok) await refresh();
  };

  if (state === "linked") {
    return (
      <span className="flex items-center gap-1 text-xs opacity-70" title={`Linked to ${fileName ?? "file"}`}>
        <Link2 size={14} /> {fileName ?? "linked"}
      </span>
    );
  }

  if (state === "needs-permission") {
    return (
      <button
        onClick={onReconnect}
        disabled={busy}
        className="flex items-center gap-1 rounded border border-amber-500 bg-amber-50 px-2 py-1 text-xs text-amber-900 disabled:opacity-50 dark:bg-amber-950 dark:text-amber-100"
        title="Chrome paused file permission after the browser restarted. Click to reconnect."
      >
        <RefreshCw size={14} /> Reconnect
      </button>
    );
  }

  return (
    <button
      onClick={onLink}
      disabled={busy}
      className="flex items-center gap-1 rounded border border-stone-300 px-2 py-1 text-xs disabled:opacity-50 dark:border-stone-600"
      title="Pick a JSON file (e.g. in OneDrive) to keep in sync"
    >
      <Link2 size={14} /> Link backup file
    </button>
  );
}
