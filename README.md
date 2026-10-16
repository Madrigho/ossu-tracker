# OSSU CS Progress Tracker

A small desktop tracker for the [OSSU Computer Science curriculum](https://github.com/ossu/computer-science).

## Quick start

Open PowerShell and run:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    iwr https://raw.githubusercontent.com/Madrigho/ossu-tracker/master/install.ps1 | iex

Requires Git and Node.js. When it finishes, a launcher named **OSSU Tracker.bat** is on your Desktop.

## Full guide

See **[INSTALL.md](INSTALL.md)** for:
- Work-laptop notes (no admin rights)
- Daily usage of the tracker
- Backups and cloud sync
- The Tampermonkey userscript for auto-ticking
- Troubleshooting

## Build with

Vite, React, TypeScript, Zustand. Tests with Vitest.
