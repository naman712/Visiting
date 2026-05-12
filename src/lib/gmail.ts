import { google } from "googleapis";
import { EmailSettings, ContactInfo } from "@/types";

function buildOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
  return oauth2Client;
}

function buildEmailHtml(contact: ContactInfo, settings: EmailSettings): string {
  const firstName = (contact.name || "").split(" ")[0] || "there";
  const greeting = settings.greeting.replace("{{name}}", firstName);
  const body = settings.body
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{company\}\}/g, contact.company || "your company");
  const signature = settings.signature.replace("{{senderName}}", settings.senderName);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f0f0f0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; overflow: hidden; }
    .header { background: #000000; padding: 36px 32px 32px; text-align: center; }
    .header img { width: 56px; height: 56px; display: block; margin: 0 auto 14px; }
    .header-title { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.3px; }
    .header-sub { color: #888888; font-size: 13px; margin: 5px 0 0; }
    .divider-header { height: 3px; background: #ffffff; }
    .body { padding: 40px 40px 32px; background: #ffffff; }
    .sender { font-size: 13px; color: #999999; margin-bottom: 6px; }
    .greeting { font-size: 18px; font-weight: 600; color: #000000; margin-bottom: 20px; }
    .text { font-size: 15px; line-height: 1.8; color: #333333; white-space: pre-line; margin-bottom: 0; }
    .cta-stack { margin: 24px 0 28px; }
    .cta-row { display: block; margin-bottom: 10px; text-align: center; }
    .cta-btn { display: inline-block; background: #000000; color: #ffffff !important; text-decoration: none; padding: 12px 32px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
    .cta-outline { background: #ffffff !important; color: #000000 !important; border: 2px solid #000000; }
    .cta-link { display: inline !important; background: transparent !important; color: #000000 !important; border: none; font-weight: 700; padding: 0; text-decoration: underline; font-size: 14px; }
    .divider { border: none; border-top: 1px solid #e5e5e5; margin: 28px 0; }
    .sig { font-size: 14px; color: #333333; line-height: 1.7; white-space: pre-line; font-weight: 500; }
    .footer { background: #000000; padding: 16px 32px; text-align: center; }
    .footer p { font-size: 11px; color: #666666; margin: 0; letter-spacing: 0.3px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="https://framerusercontent.com/images/PiUDXNvChzqEDzi8ImYqtZ4NFE.png" alt="Neoflo" />
      <p class="header-title">Welcome to Neoflo</p>
      <p class="header-sub">Finance operations, end-to-end</p>
    </div>
    <div class="divider-header"></div>
    <div class="body">
      <div class="sender">${settings.senderName}</div>
      <div class="greeting">${greeting}</div>
      <div class="text">${body}</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 28px;">
        ${settings.calendlyLink ? `${settings.calendlyText ? `<tr><td align="center" style="padding-bottom:4px;font-size:14px;color:#333333;line-height:1.6;">${settings.calendlyText}</td></tr>` : ""}<tr><td align="center" style="padding-bottom:10px;"><a href="${settings.calendlyLink}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 32px;font-size:13px;font-weight:700;letter-spacing:0.5px;">Schedule a call &rarr;</a></td></tr>` : ""}
        ${settings.websiteLink ? `<tr><td align="center"><a href="${settings.websiteLink}" style="display:inline;color:#000000;font-weight:700;font-size:14px;text-decoration:underline;">neoflo.ai &rarr;</a></td></tr>` : ""}
      </table>
      <hr class="divider">
      <div class="sig">${signature}</div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Neoflo. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendWelcomeEmail(
  contact: ContactInfo,
  settings: EmailSettings
): Promise<void> {
  const auth = buildOAuthClient();
  const gmail = google.gmail({ version: "v1", auth });

  const html = buildEmailHtml(contact, settings);
  const subject = settings.subject.replace("{{name}}", contact.name || "there");

  const encodedSubject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;

  const message = [
    `From: "${settings.senderName}" <${process.env.GMAIL_SENDER_EMAIL}>`,
    `To: ${contact.email}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });
}
