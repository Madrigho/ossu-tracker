# Install and Use — OSSU CS Progress Tracker

This file is for anyone who wants to run the tracker on their own machine. If you're just here to read the code, the [README](README.md) has the summary.

## 1. What you need

Two free programs:

- **Git** — https://git-scm.com/download/win
- **Node.js** — https://nodejs.org/ (click the **LTS** button)

Install both with all default options. If you already have them, skip to step 2.

**Note for work laptops**: If your IT department blocks admin installs, download the **portable** Node.js from https://nodejs.org/en/download (choose the "zip" version), extract it somewhere in your user folder, and add that folder to your PATH. Ask if you need help with this step.

## 2. One-time install

Open **PowerShell** (Start menu → search "PowerShell" → open the blue one). Paste these two lines and press Enter:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    iwr https://raw.githubusercontent.com/Madrigho/ossu-tracker/master/install.ps1 | iex

What happens next:

1. It checks for Git and Node.js. If either is missing, it tells you exactly which one and where to download it.
2. It downloads the tracker to `%USERPROFILE%\dev\ossu-tracker`.
3. It installs dependencies. This takes about a minute the first time.
4. It drops a file called **OSSU Tracker.bat** on your Desktop.
5. Your browser opens to the tracker.

## 3. Every time after that

Double-click **OSSU Tracker.bat** on your Desktop. A black PowerShell window opens, and a browser tab opens at `http://localhost:1420`. That's the tracker.

**Leave the black window open while you use the tracker.** Closing it stops the app.

To stop, close both the browser tab and the PowerShell window. Next time, double-click the Desktop file again.

## 4. Using the tracker

- **Left sidebar**: courses and sections. Click any subsection to show its courses.
- **Next up (green banner)**: the one course you should focus on next. Click **Resume** to start studying it.
- **Timer**: press **Start timer** on the Study panel, study, then **Stop and save**. Your minutes are logged to that course.
- **Checklist**: expand a course card, click **Add weeks**, and tick items as you complete them.
- **Review now** (bottom of the sidebar): shows every item you haven't ticked yet, so you can catch up once a week.
- **Session history** (bottom of the sidebar): your logged study sessions. Click a number to edit it, or the trash icon to delete.

Everything saves automatically to your browser. No "save" button.

## 5. Backups (recommended)

The tracker has a **Link backup file** button in the header. Click it, pick a JSON file somewhere sensible (for example a folder in OneDrive or Dropbox), and from then on every change syncs to that file.

If your laptop ever dies, install the tracker on a new machine, click **Link backup file**, and pick the same file. Everything is back.

## 6. Optional: auto-tick from course pages

If you use [Tampermonkey](https://www.tampermonkey.net/) in Chrome or Edge, you can install a userscript that adds a **"✓ Mark done in OSSU"** button to every course page (py4e, Coursera, edX, freeCodeCamp, YouTube, MIT OCW).

- The script lives at `userscript/ossu-auto-complete.user.js` in this repo.
- Open it in a browser, copy its contents, and paste into a new Tampermonkey script.
- One click on a course page ticks the next unchecked item in the tracker.

See `userscript/README.md` for detailed install steps.

## 7. Troubleshooting

**"The site can't be reached" at localhost:1420** — the PowerShell window was closed. Re-launch with **OSSU Tracker.bat**.

**"Windows protected your PC" when double-clicking the .bat** — click **More info** → **Run anyway**. Only happens once.

**"Reconnect" button appears in the tracker** — Chrome paused permission for the linked backup file. Click **Reconnect**, then **Allow** in the Chrome popup. One click per browser session.

**"running scripts is disabled on this system"** — the PowerShell execution policy is too strict. Run this first, then retry the install:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

**Node.js "not recognized" after install** — close PowerShell completely and open it again. The installer changed your PATH, and existing windows don't see the change until they restart.
