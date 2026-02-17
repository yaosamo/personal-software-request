function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const memo = (body?.memo || "").trim();
  const email = (body?.email || "").trim().toLowerCase();

  if (!memo || memo.length > 5000) {
    return res.status(400).json({ error: "Memo is required and must be <= 5000 chars" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: "Missing GOOGLE_APPS_SCRIPT_URL" });
  }

  const payload = {
    memo,
    email,
    submittedAt: new Date().toISOString()
  };

  try {
    const writeResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!writeResponse.ok) {
      return res.status(502).json({ error: "Failed to write to Google" });
    }

    let responseData = null;
    try {
      responseData = await writeResponse.json();
    } catch (error) {
      return res.status(502).json({ error: "Google webhook did not return JSON" });
    }

    if (!responseData?.ok) {
      return res.status(502).json({ error: "Google webhook returned unsuccessful response" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(502).json({ error: "Google write request failed" });
  }
};
