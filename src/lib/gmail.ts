import { google } from "googleapis";
import { EmailSettings, ContactInfo } from "@/types";
import { buildEmailHtml } from "./email-template";

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
