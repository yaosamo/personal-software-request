const { google } = require("googleapis");

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPrivateKey() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64) {
    return Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64, "base64").toString(
      "utf8"
    );
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n");
  }

  return "";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof req.body === "string") {
    try {
      body = JSON.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  const memo = (body?.memo || "").trim();
  const email = (body?.email || "").trim().toLowerCase();

  if (!memo || memo.length > 5000) {
    return res.status(400).json({ error: "Memo is required and must be <= 5000 chars" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const spreadsheetId = (process.env.GOOGLE_SHEETS_ID || "").trim();
  const range = (process.env.GOOGLE_SHEETS_RANGE || "Sheet1!A:C").trim();
  const clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim();
  const privateKey = getPrivateKey();

  if (!spreadsheetId || !clientEmail || !privateKey) {
    return res.status(500).json({
      error:
        "Missing Google API configuration. Required: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and private key env"
    });
  }

  const submittedAt = new Date().toISOString();

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[submittedAt, email, memo]]
      }
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    const googleMessage =
      error?.response?.data?.error?.message || error?.message || "Unknown Google Sheets API error";
    console.error("Google Sheets API write failed:", googleMessage);
    return res.status(502).json({ error: `Google Sheets API write failed: ${googleMessage}` });
  }
};
