# OSSU CS Progress Tracker

A small desktop tracker for the [OSSU Computer Science curriculum](https://github.com/ossu/computer-science).

## Install (one command)

Open PowerShell and run:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    iwr https://raw.githubusercontent.com/Madrigho/ossu-tracker/master/install.ps1 | iex

Requires Git and Node.js. The installer tells you where to get them if they're missing.

When it finishes, a launcher named **OSSU Tracker.bat** is on your Desktop.

## Use

Double-click **OSSU Tracker.bat** on your Desktop. A browser opens at http://localhost:1420.
Leave the black PowerShell window open while you use the tracker. Close it to stop.

- Click a course to expand it.
- Tick items on its checklist as you go.
- The timer at the top logs study minutes.
- "Review now" in the sidebar shows everything you haven't ticked yet.
- Everything saves to your browser automatically.

## Backup

Ctrl+Shift+S downloads a full backup. The header also has a "Link backup file" button
that syncs your data to a JSON file on disk (e.g. in OneDrive) on every change.

## Optional - auto-tick from course pages

If you use Tampermonkey, install the script in userscript/ossu-auto-complete.user.js.
It adds a "Mark done in OSSU" button to py4e, Coursera, edX, freeCodeCamp, YouTube, and MIT OCW.
One click ticks the next item in your tracker.

## Build with

Vite, React, TypeScript, Zustand. Tests with Vitest.
