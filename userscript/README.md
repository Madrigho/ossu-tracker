# OSSU Auto-Complete userscript

## Install

1. In Chrome, click the Tampermonkey icon -> "Create a new script".
2. Delete the placeholder content.
3. Paste the entire contents of `ossu-auto-complete.user.js`.
4. Ctrl+S to save. The tab title changes from "Create a new userscript" to the script name.
5. Visit any supported course page (py4e.com, Coursera, edX, freeCodeCamp, YouTube, MIT OCW).
6. You should see a green "✓ Mark done in OSSU" button in the bottom-right corner.

## Use

- Click the green button any time to tick the next unchecked checklist item
  in the matching tracker course.
- On sites with a detectable "Mark as complete" button, the click fires
  automatically - no need to press the green button.
- A small toast confirms what was sent: "Sent: python-for-everyone -> Week 3".

## Requirements

- The tracker must be running: `npm run dev` in the project folder, so
  http://localhost:1420 is live. If it is not, the ping silently fails.
- Open the tracker in one tab and the course in another. The tracker
  updates live via localStorage cross-tab sync.

## Editing the course map

Open the userscript in Tampermonkey and edit `URL_MAP` near the top:
each row is `[url-substring, tracker-course-id]`. The tracker course id is
shown in the Auto-tick dropdown in the sidebar.

If the ping says "No course mapping for this URL", add a row for that URL.
