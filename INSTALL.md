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

## 6. Optional: auto-tick from course pages (Tampermonkey)

This is the one part of the setup that **cannot be installed automatically**. Chrome and Edge deliberately prevent any script from silently installing browser extensions or changing extension settings. That's a security feature, and it applies to everyone, not just you.

If you want a "✓ Mark done in OSSU" button to appear on the course pages (py4e, Coursera, edX, freeCodeCamp, YouTube, MIT OCW), you install it manually, once. It takes about 90 seconds. Here's every click:

### 6a. Install the Tampermonkey extension

1. Open Chrome (or Edge).
2. Go to the **Tampermonkey** page in the Chrome Web Store:
   - Chrome: https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - Edge: search the Edge Add-ons store for "Tampermonkey"
3. Click **Add to Chrome** → **Add extension**.
4. The Tampermonkey icon (a small monkey) appears in your toolbar. It may be hidden behind the puzzle-piece menu — click that and pin it.

### 6b. Give Tampermonkey the permissions it needs

Chrome 138+ requires two settings before Tampermonkey can run any userscripts:

1. In the address bar, type `chrome://extensions` and press Enter.
2. Find **Tampermonkey** in the list. Click **Details**.
3. Scroll down. Under **Site access**, change the dropdown from "On click" to **On all sites**.
4. Right below that, find **Allow User Scripts** and turn it **ON**.
5. Close the extensions tab.

### 6c. Install the OSSU userscript

1. In a browser tab, open the script in this repo:
   https://github.com/Madrigho/ossu-tracker/blob/master/userscript/ossu-auto-complete.user.js
2. Click the **Raw** button (top-right of the file view).
3. The browser will show the script as plain text. Select all of it (**Ctrl+A**), then copy (**Ctrl+C**).
4. Click the **Tampermonkey** icon in your toolbar → **Dashboard**.
5. Click the **+** tab (new userscript). A code editor opens with a placeholder script.
6. Click inside the editor, press **Ctrl+A** to select all, then **Delete**.
7. Paste the OSSU script (**Ctrl+V**).
8. Press **Ctrl+S** to save. The tab title should change from "New userscript" to "OSSU Auto-Complete".
9. Close the Tampermonkey tab.

### 6d. Test it

1. Make sure the tracker is running (`OSSU Tracker.bat`).
2. Open https://www.py4e.com/ in a tab.
3. Bottom-right of the page, you should see a green **"✓ Mark done in OSSU"** button.
4. Click it. A small toast appears: **"Sent: python-for-everyone → ..."**
5. Switch to the tracker tab. In the left sidebar, expand **Auto-tick**. A new line should appear, and the next unchecked item on the Python for Everyone card ticks.

If the green button doesn't appear:

- The tracker isn't running → double-click `OSSU Tracker.bat`.
- Tampermonkey isn't installed or is disabled → click its icon in the toolbar.
- Chrome permissions not set → repeat step 6b.
- Still stuck → open the py4e tab, press **F12**, click the **Console** tab, and look for a line starting with `[ossu-auto] loaded`. If it's there, the script is running; if not, Chrome/Tampermonkey is blocking it.

## 7. Troubleshooting

**"The site can't be reached" at localhost:1420** — the PowerShell window was closed. Re-launch with **OSSU Tracker.bat**.

**"Windows protected your PC" when double-clicking the .bat** — click **More info** → **Run anyway**. Only happens once.

**"Reconnect" button appears in the tracker** — Chrome paused permission for the linked backup file. Click **Reconnect**, then **Allow** in the Chrome popup. One click per browser session.

**"running scripts is disabled on this system"** — the PowerShell execution policy is too strict. Run this first, then retry the install:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

**Node.js "not recognized" after install** — close PowerShell completely and open it again. The installer changed your PATH, and existing windows don't see the change until they restart.

**Tampermonkey says "no access to this page"** — the site access setting got reset. Go back to `chrome://extensions` → Tampermonkey → Details → Site access → **On all sites**.

**Green button doesn't appear on a course page** — check Chrome's address bar for a small icon next to the URL; some sites require you to click "allow scripts on this page" once.
