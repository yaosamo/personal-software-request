# Personal Software Request

Minimal Vercel site to collect software requests with memo + email and store responses directly in Google Sheets via Google Sheets API.

## Stack

- Static HTML form (`index.html`)
- Vercel Serverless Function (`api/submit.js`)
- Google Sheets API (service account auth)

## Run locally

1. Install Vercel CLI: `npm i -g vercel`
2. Set env vars in this project:
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SHEETS_RANGE` (optional, defaults to `Sheet1!A:C`)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64` (recommended) or `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
3. Start dev server:
   - `npm run dev`

## Google setup (true API, no Apps Script)

1. In Google Cloud, enable **Google Sheets API**.
2. Create a **Service Account** and generate a JSON key.
3. Share your target spreadsheet with the service account email as **Editor**.
4. Add these Vercel environment variables:
   - `GOOGLE_SHEETS_ID`: spreadsheet ID from URL
   - `GOOGLE_SHEETS_RANGE`: for example `Sheet1!A:C`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: value from JSON key `client_email`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64`: base64 of JSON key `private_key`

To generate base64 private key safely:

```bash
printf '%s' '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n' | base64
```

Set env vars with Vercel CLI:

```bash
vercel env add GOOGLE_SHEETS_ID production
vercel env add GOOGLE_SHEETS_RANGE production
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
vercel env add GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64 production
```

## Deploy to Vercel

1. `vercel`
2. `vercel --prod`

## GitHub repo

After installing GitHub CLI and logging in:

1. `gh auth login`
2. `gh repo create personal-software-request --public --source=. --remote=origin --push`
