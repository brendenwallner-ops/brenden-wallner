// Contact endpoint for the portfolio, deployed as a Vercel serverless function.
// Same setup as Jason + Pasiflora: nodemailer over Gmail SMTP.
//
// Required env vars (set in the Vercel project, NOT committed):
//   GMAIL_USER          your Gmail address (also the SMTP login)
//   GMAIL_APP_PASSWORD  a Google "App Password" for that account
// Optional:
//   CONTACT_TO          where inquiries land (defaults to GMAIL_USER)
//
// IMPORTANT: the FROM address must equal GMAIL_USER. Gmail accepts mail sent
// FROM an unrelated address with 250 OK but silently drops external delivery.
// NOTE: sending from an account to itself lands in Sent / All Mail (Gmail's
// self-send dedupe), not the Inbox — set a Gmail filter to label these, or
// point CONTACT_TO at a different mailbox.

const nodemailer = require("nodemailer");

const esc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return transporter;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }
  body = body || {};

  // Honeypot: bots fill hidden fields. Pretend success, send nothing.
  if (body.company) return res.status(200).json({ ok: true });

  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const type = (body.type || "").toString().trim();
  const budget = (body.budget || "").toString().trim();
  const message = (body.message || "").toString().trim();

  if (!name || !email || !type || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const fields = [
    ["Name", name],
    ["Email", email],
    ["Needs", type],
    ["Budget", budget || "Not specified"],
    ["Message", message],
  ];
  const rows = fields
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#8a8475;vertical-align:top;white-space:nowrap">${k}</td>` +
        `<td style="padding:6px 0;color:#1a1a14">${esc(v) || "—"}</td></tr>`
    )
    .join("");

  const ownerHtml = `
    <div style="background:#f4f2eb;padding:28px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
      <h2 style="color:#141310;font-weight:700;margin:0 0 4px">New project inquiry</h2>
      <p style="color:#8a8475;margin:0 0 18px">From ${esc(name)}</p>
      <table style="border-collapse:collapse;font-size:15px">${rows}</table>
    </div>`;

  const clientHtml = `
    <div style="background:#f4f2eb;padding:28px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
      <h2 style="color:#141310;font-weight:700;margin:0 0 12px">Thanks, ${esc(name)} — got your message</h2>
      <p style="color:#56544b;line-height:1.6;margin:0 0 16px">
        I read every inquiry and usually reply within a day. Talk soon.
      </p>
      <p style="color:#8a8475;margin:0 0 6px;font-size:13px">What you sent:</p>
      <table style="border-collapse:collapse;font-size:14px">${rows}</table>
      <p style="color:#8a8475;margin:18px 0 0;font-size:13px">— Brenden Wallner</p>
    </div>`;

  try {
    const tx = getTransporter();
    const user = process.env.GMAIL_USER;
    const to = process.env.CONTACT_TO || user;

    // 1) Notify me. Reply-To is the sender so I can answer them directly.
    await tx.sendMail({
      from: `Brenden Wallner — Portfolio <${user}>`,
      to,
      replyTo: email,
      subject: `[Portfolio] New project inquiry — ${name}`,
      html: ownerHtml,
    });

    // 2) Auto-reply so the visitor knows it went through.
    await tx.sendMail({
      from: `Brenden Wallner <${user}>`,
      to: email,
      subject: "Got your message — Brenden Wallner",
      html: clientHtml,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact send failed:", err);
    return res.status(500).json({ error: "Send failed" });
  }
};
