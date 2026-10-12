# OSSU CS Progress Tracker

Desktop app (Tauri v2 + React 18 + TypeScript + Tailwind + Zustand + SQLite) to track progress through the
[OSSU Computer Science curriculum](https://github.com/ossu/computer-science) and resume where you left off.

## Setup
1. Install Node 18+, Rust (stable) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS.
2. `npm install`
3. Generate icons from any 1024px PNG: `npx tauri icon path/to/icon.png`
4. Dev: `npm run tauri dev` — Build: `npm run tauri build` (run on each target OS; Windows, macOS, Linux).

## Tests
- Frontend logic: `npm test` (parsing, prerequisites, progress, resume order)
- Rust: `cargo test --manifest-path src-tauri/Cargo.toml`

## How it works
- Rust command `fetch_curriculum` downloads the JSON (no CORS). The raw JSON is cached in the SQLite `settings` table
  and parsed on launch, so the app works offline; on failure a banner offers Retry.
- Schema: `src-tauri/migrations/001_init.sql` (`progress`, `settings`, `sync_log`).
- The real OSSU JSON differs from the original spec: courses have no descriptions or IDs, and prerequisites are free
  text. Prerequisites are resolved by matching course names; unmatched text counts as satisfied.

## Not implemented yet
Settings modal (theme toggle, reset progress, last-updated display), GitHub sync, `sections`/`subsections`/`courses`
tables (curriculum is cached as raw JSON instead), shadcn/ui (plain Tailwind used), CI workflow.
