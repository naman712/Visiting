import { EmailTemplate, ContactInfo } from "@/types";

/**
 * Builds the welcome email HTML. Pure string builder with no server-only
 * dependencies, so it is safe to import in both the Gmail sender (server)
 * and the Settings preview (client).
 */
export function buildEmailHtml(contact: ContactInfo, template: EmailTemplate): string {
  const firstName = (contact.name || "").split(" ")[0] || "there";
  const greeting = template.greeting.replace(/\{\{name\}\}/g, firstName);
  const body = template.body
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{company\}\}/g, contact.company || "your company");
  const signature = template.signature.replace(/\{\{senderName\}\}/g, template.senderName);
  const year = new Date().getFullYear();

  // If the user uploaded a custom HTML template, use it verbatim with
  // placeholders substituted, instead of the built-in layout.
  if (template.customHtml && template.customHtml.trim()) {
    // Inside HTML, newlines must become <br> to render as line breaks.
    const br = (s: string) => s.replace(/\n/g, "<br>");
    return template.customHtml
      .replace(/\{\{name\}\}/g, firstName)
      .replace(/\{\{fullName\}\}/g, contact.name || firstName)
      .replace(/\{\{company\}\}/g, contact.company || "your company")
      .replace(/\{\{email\}\}/g, contact.email || "")
      .replace(/\{\{title\}\}/g, contact.title || "")
      .replace(/\{\{phone\}\}/g, contact.phone || "")
      .replace(/\{\{senderName\}\}/g, template.senderName)
      .replace(/\{\{subject\}\}/g, template.subject.replace(/\{\{name\}\}/g, firstName))
      .replace(/\{\{greeting\}\}/g, br(greeting))
      .replace(/\{\{body\}\}/g, br(body))
      .replace(/\{\{signature\}\}/g, br(signature))
      .replace(/\{\{calendlyText\}\}/g, template.calendlyText || "")
      .replace(/\{\{calendlyLink\}\}/g, template.calendlyLink || "")
      .replace(/\{\{websiteLink\}\}/g, template.websiteLink || "")
      .replace(/\{\{year\}\}/g, String(year));
  }

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
      <div class="sender">${template.senderName}</div>
      <div class="greeting">${greeting}</div>
      <div class="text">${body}</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 28px;">
        ${template.calendlyLink ? `${template.calendlyText ? `<tr><td align="center" style="padding-bottom:4px;font-size:14px;color:#333333;line-height:1.6;">${template.calendlyText}</td></tr>` : ""}<tr><td align="center" style="padding-bottom:10px;"><a href="${template.calendlyLink}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 32px;font-size:13px;font-weight:700;letter-spacing:0.5px;">Schedule a call &rarr;</a></td></tr>` : ""}
        ${template.websiteLink ? `<tr><td align="center"><a href="${template.websiteLink}" style="display:inline;color:#000000;font-weight:700;font-size:14px;text-decoration:underline;">neoflo.ai &rarr;</a></td></tr>` : ""}
      </table>
      <hr class="divider">
      <div class="sig">${signature}</div>
    </div>
    <div class="footer">
      <p>&copy; ${year} Neoflo. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
