# OSSU CS Progress Tracker

A small desktop tracker for the [OSSU Computer Science curriculum](https://github.com/ossu/computer-science).

## Install (one command)

Open PowerShell and run:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    iwr https://raw.githubusercontent.com/madrigho/ossu-tracker/main/install.ps1 | iex

Requires Git and Node.js. The script tells you where to get them if you don't have them.

## Use

The script starts a local server and opens your browser at http://localhost:1420.

- Click a course to expand it.
- Tick items on its checklist as you go.
- The timer at the top logs study minutes.
- "Review now" in the sidebar shows everything you haven't ticked yet.
- Everything saves to your browser automatically.

## Backup

Ctrl+Shift+S downloads a full backup. The app also keeps 5 rolling backups in your browser.

## Optional - auto-tick from course pages

If you use Tampermonkey, install the script in userscript/ossu-auto-complete.user.js.
It adds a "Mark done in OSSU" button to py4e, Coursera, edX, freeCodeCamp, YouTube, and MIT OCW.
One click ticks the next item in your tracker.

## Build with

Vite, React, TypeScript, Zustand. Tests with Vitest.
