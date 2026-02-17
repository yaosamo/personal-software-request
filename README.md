# Personal Software Request

Minimal Vercel site to collect software requests with memo + email and store responses in a Google Doc through Google Apps Script.

## Stack

- Static HTML form (`index.html`)
- Vercel Serverless Function (`api/submit.js`)
- Google Apps Script webhook appending to Google Doc

## Run locally

1. Install Vercel CLI: `npm i -g vercel`
2. Set env var in this project:
   - `vercel env add GOOGLE_APPS_SCRIPT_URL`
3. Start dev server:
   - `npm run dev`

## Google setup (response storage in Google Doc)

1. Create a Google Doc where submissions should be appended.
2. Copy the Google Doc ID from the URL:
   - `https://docs.google.com/document/d/<DOC_ID>/edit`
3. Open https://script.google.com and create a new Apps Script project.
3. Paste script below and save:

```javascript
function doPost(e) {
  const doc = DocumentApp.openById("YOUR_DOC_ID_HERE");
  const body = doc.getBody();
  const data = JSON.parse(e.postData.contents || "{}");

  body.appendParagraph("----");
  body.appendParagraph("submittedAt: " + (data.submittedAt || new Date().toISOString()));
  body.appendParagraph("email: " + (data.email || ""));
  body.appendParagraph("memo: " + (data.memo || ""));
  body.appendParagraph("");
  doc.saveAndClose();

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Replace `YOUR_DOC_ID_HERE` with your real doc ID.
5. Deploy script:
   - **Deploy -> New deployment -> Web app**
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy the web app URL and set it as `GOOGLE_APPS_SCRIPT_URL` in Vercel.

## Deploy to Vercel

1. `vercel`
2. `vercel --prod`

## GitHub repo

After installing GitHub CLI and logging in:

1. `gh auth login`
2. `gh repo create personal-software-request --public --source=. --remote=origin --push`
