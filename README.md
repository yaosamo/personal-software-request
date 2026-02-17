# Personal Software Request

Minimal Vercel site to collect software requests with memo + email and store responses in Google Sheets (Google Docs suite) through Google Apps Script.

## Stack

- Static HTML form (`index.html`)
- Vercel Serverless Function (`api/submit.js`)
- Google Apps Script webhook writing to Google Sheet

## Run locally

1. Install Vercel CLI: `npm i -g vercel`
2. Set env var in this project:
   - `vercel env add GOOGLE_APPS_SCRIPT_URL`
3. Start dev server:
   - `npm run dev`

## Google setup (response storage)

1. Create a Google Sheet with headers in row 1:
   - `submittedAt`, `email`, `memo`
2. In that sheet, open **Extensions -> Apps Script**.
3. Paste script below and save:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents || "{}");

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.email || "",
    data.memo || ""
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy script:
   - **Deploy -> New deployment -> Web app**
   - Execute as: `Me`
   - Who has access: `Anyone`
5. Copy the web app URL and set it as `GOOGLE_APPS_SCRIPT_URL` in Vercel.

## Deploy to Vercel

1. `vercel`
2. `vercel --prod`

## GitHub repo

After installing GitHub CLI and logging in:

1. `gh auth login`
2. `gh repo create personal-software-request --public --source=. --remote=origin --push`
