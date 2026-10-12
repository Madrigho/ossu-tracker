import { useState } from "react";
import { useStore } from "./store";

export default function AutoTickLog() {
  const { autoTickLog, autoComplete, checklists } = useStore();
  const [picked, setPicked] = useState("");

  const active = Object.entries(checklists).filter(([, items]) =>
    items.some((i) => !i.done)
  );
  const options = active.map(([id]) => id);
  const selected = picked && options.includes(picked) ? picked : options[0] ?? "";
  const recent = autoTickLog.slice(-8).reverse();

  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer">Auto-tick ({autoTickLog.length})</summary>
      <div className="mt-2 space-y-2">
        {options.length > 0 ? (
          <div className="rounded border border-stone-300 p-2 dark:border-stone-700">
            <p className="text-xs opacity-70">Simulate a completion ping:</p>
            <select
              value={selected}
              onChange={(e) => setPicked(e.target.value)}
              className="mt-1 w-full rounded border border-stone-300 bg-transparent px-2 py-1 text-xs dark:border-stone-600"
            >
              {options.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            <button
              className="mt-1 rounded border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
              onClick={() => selected && autoComplete(selected)}
            >
              Simulate ping
            </button>
          </div>
        ) : (
          <p className="text-xs opacity-60">No active checklists to ping.</p>
        )}
        {recent.length === 0 ? (
          <p className="text-xs opacity-60">No auto-ticks yet.</p>
        ) : (
          <ul className="space-y-1 text-xs">
            {recent.map((e, i) => (
              <li key={i} className="truncate">
                {e.status === "ticked" ? <span className="text-emerald-600">tick </span> : null}
                {e.status === "unmatched" ? <span className="text-amber-600">?    </span> : null}
                {e.status === "no-items" ? <span className="opacity-60">-    </span> : null}
                <span className="opacity-60">{e.at.slice(11, 19)}</span>{" "}
                {e.courseId ?? e.courseHint}
                {e.itemLabel ? ` - ${e.itemLabel}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
