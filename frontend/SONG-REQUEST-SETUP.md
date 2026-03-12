# Song Request Form — Setup Guide

This guide covers two things: setting up EmailJS to receive song request submissions, and automating those emails into per-couple Google Sheets using Google Apps Script (free, no Power Automate needed).

---

## Part 1: EmailJS Setup

You already have EmailJS connected (`service_gg499mn` / public key `LhsrdX3yXhmH9PHk7`). You just need a **new email template** for song requests.

### Step 1 — Create a New Template

1. Log in at [https://dashboard.emailjs.com](https://dashboard.emailjs.com)
2. Go to **Email Templates** → **Create New Template**
3. Name it something like `Song Request`

### Step 2 — Design the Template

Use these template variables (they match what the form sends):

**Subject line:**
```
🎵 Song Request from {{first_name}} {{last_name}} [{{event_password}}]
```

**Body (HTML or plain text):**
```
New song request received!

Name: {{first_name}} {{last_name}}
Event Password: {{event_password}}
Song Request:
{{song_request}}
```

The `{{event_password}}` in the subject line is important — the automation in Part 2 uses it to sort requests into the right spreadsheet.

### Step 3 — Copy the Template ID

After saving the template, copy the **Template ID** (it looks like `template_xxxxxxx`).

### Step 4 — Update the Code

Open `src/components/SongRequest.js` and replace:

```js
const TEMPLATE_ID = "YOUR_SONG_REQUEST_TEMPLATE_ID";
```

with your actual template ID, e.g.:

```js
const TEMPLATE_ID = "template_abc1234";
```

### Step 5 — Test

Run `npm start`, navigate to `/request-a-song`, fill in the form, and check that you receive the email. That's it for EmailJS.

---

## Part 2: Auto-Sort into Google Sheets (Google Apps Script)

This is the recommended approach — it's completely free, runs on Google's servers, and requires no third-party tools. When an email arrives with a song request, a script reads the password from the subject line, finds (or creates) a Google Sheet for that couple, and appends the request.

### How It Works

```
Guest fills form → EmailJS sends you an email → Google Apps Script reads the
email every 5 minutes → Parses name, password, song → Finds or creates a
Google Sheet named after the password → Appends a row
```

### Step 1 — Create the Master Folder

1. In Google Drive, create a folder called `Song Requests`
2. Open the folder and copy the **folder ID** from the URL:
   `https://drive.google.com/drive/folders/THIS_IS_THE_FOLDER_ID`

### Step 2 — Create the Apps Script

1. Go to [https://script.google.com](https://script.google.com)
2. Click **New project**
3. Name it `Song Request Automation`
4. Delete the default code and paste this:

```javascript
// ── Configuration ──────────────────────────────────────────────────
const FOLDER_ID = "YOUR_FOLDER_ID_HERE";       // from Step 1
const LABEL_NAME = "Song Requests";             // Gmail label to apply
const SEARCH_QUERY = "subject:(Song Request) from:(reply@emailjs.com) is:unread";

// ── Main function (runs on a timer) ───────────────────────────────
function processSongRequests() {
  const threads = GmailApp.search(SEARCH_QUERY, 0, 50);
  if (threads.length === 0) return;

  const folder = DriveApp.getFolderById(FOLDER_ID);

  // Ensure the Gmail label exists
  let label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) label = GmailApp.createLabel(LABEL_NAME);

  for (const thread of threads) {
    const messages = thread.getMessages();

    for (const message of messages) {
      if (message.isUnread()) {
        const body = message.getPlainBody();
        const subject = message.getSubject();

        // Parse fields from the email body
        const name = extractField(body, "Name");
        const password = extractField(body, "Event Password");
        const song = extractField(body, "Song Request");

        if (!password || !song) {
          message.markRead();
          continue;
        }

        // Find or create the spreadsheet for this couple/password
        const sheet = getOrCreateSheet(folder, password);

        // Append the row
        sheet.appendRow([
          new Date(),                   // Timestamp
          name || "Unknown",            // Guest name
          password,                     // Event password
          song.trim(),                  // Song request
        ]);

        message.markRead();
      }
    }

    // Apply the label for easy filtering in Gmail
    thread.addLabel(label);
  }
}

// ── Helper: extract a field value from the email body ─────────────
function extractField(body, fieldName) {
  // Matches "Field Name: value" or "Field Name:\nvalue"
  const regex = new RegExp(fieldName + ":\\s*(.+?)(?:\\n\\n|\\n[A-Z]|$)", "s");
  const match = body.match(regex);
  return match ? match[1].trim() : null;
}

// ── Helper: find or create a spreadsheet for a password ───────────
function getOrCreateSheet(folder, password) {
  const sanitized = password.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
  const sheetName = "Song Requests — " + sanitized;

  // Search for existing spreadsheet in the folder
  const files = folder.getFilesByName(sheetName);
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.open(file).getActiveSheet();
  }

  // Create new spreadsheet
  const ss = SpreadsheetApp.create(sheetName);
  const sheet = ss.getActiveSheet();

  // Add headers
  sheet.appendRow(["Timestamp", "Guest Name", "Event Password", "Song Request"]);

  // Bold the header row
  sheet.getRange("1:1").setFontWeight("bold");

  // Auto-resize columns
  sheet.autoResizeColumns(1, 4);

  // Move the file into the Song Requests folder
  const file = DriveApp.getFileById(ss.getId());
  folder.addFile(file);

  // Remove from root "My Drive" so it only lives in the folder
  const root = DriveApp.getRootFolder();
  root.removeFile(file);

  return sheet;
}
```

### Step 3 — Configure

Replace `YOUR_FOLDER_ID_HERE` with the actual folder ID from Step 1.

If your EmailJS sends from a different address than `reply@emailjs.com`, update the `SEARCH_QUERY` to match.

### Step 4 — Set Permissions

1. Click **Run** → select `processSongRequests`
2. Google will ask you to authorize Gmail and Drive access — click through the prompts
3. If you see "This app isn't verified", click **Advanced** → **Go to Song Request Automation (unsafe)** → **Allow**

### Step 5 — Set Up the Timer

1. In the Apps Script editor, click the **clock icon** (Triggers) in the left sidebar
2. Click **+ Add Trigger**
3. Configure:
   - Function: `processSongRequests`
   - Event source: **Time-driven**
   - Type: **Minutes timer**
   - Interval: **Every 5 minutes**
4. Click **Save**

### Step 6 — Test End-to-End

1. Go to your site's `/request-a-song` page
2. Submit a test request with password `test-wedding`
3. Wait up to 5 minutes (or click Run manually in the script editor)
4. Check your Google Drive `Song Requests` folder — you should see a new spreadsheet called `Song Requests — test-wedding` with your entry

---

## How Couples Use It

For each wedding, you give the couple a unique password (e.g., their last names: `smith-jones`). They share it with their guests via their wedding website, invitations, or a table card at the reception. All requests with that password automatically land in one spreadsheet you can review before the event.

---

## Summary of What Was Built

| File | What it does |
|---|---|
| `src/components/SongRequest.js` | The page component with the form |
| `src/components/SongRequest.scss` | All styling (matches site design system) |
| `src/components/Handler.js` | Route added: `/request-a-song` |
| `src/components/Navbar.js` | Nav link added: "Request a Song" |

**To go live:** update the `TEMPLATE_ID` in `SongRequest.js`, deploy the Apps Script, and run `npm run build`.
