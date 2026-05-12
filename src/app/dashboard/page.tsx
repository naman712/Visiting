"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, LayoutDashboard, Loader2, Eye, EyeOff } from "lucide-react";
import { EmailSettings } from "@/types";

const DEFAULT: EmailSettings = {
  senderName: "Naman",
  subject: "Great connecting tonight, {{name}}",
  greeting: "Hi {{name}},",
  body: `Thanks for connecting with the Neoflo team tonight. Hope the panel on AI, headcount, and the trade-offs ahead gave you something to work with.

Quick recap on us: Neoflo runs finance operations end-to-end as a managed service. AP, reconciliation, month-end close. AI handles volume, specialists handle exceptions. SLA-backed, live in 4 weeks.`,
  calendlyText: "We can scope what this looks like for your setup in 15 minutes:",
  calendlyLink: "https://calendly.com/your-link",
  websiteLink: "https://neoflo.ai",
  signature: `{{senderName}}
Neoflo`,
};

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-medium text-slate-700">{children}</label>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [settings, setSettings] = useState<EmailSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data.email ?? DEFAULT); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: settings }),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const set = (key: keyof EmailSettings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setSettings((s) => ({ ...s, [key]: e.target.value }));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm">Customise your email template and Calendly link</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {preview ? <EyeOff size={16} /> : <Eye size={16} />}
            {preview ? "Hide Preview" : "Email Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className={`grid gap-8 ${preview ? "grid-cols-2" : "grid-cols-1 max-w-2xl"}`}>
        {/* Settings form */}
        <div className="space-y-6">
          {/* Sender */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">Sender Info</h2>
            <div>
              <Label hint="Displayed as the &quot;From&quot; name in email clients">Sender Name</Label>
              <input
                value={settings.senderName}
                onChange={set("senderName")}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Naman from Neoflo"
              />
            </div>
          </div>

          {/* Email content */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">Email Content</h2>
            <p className="text-xs text-slate-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Use <code className="font-mono bg-amber-100 px-1 rounded">{"{{name}}"}</code> and{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">{"{{company}}"}</code> as dynamic placeholders.
            </p>
            <div>
              <Label hint="Email subject line">Subject</Label>
              <input
                value={settings.subject}
                onChange={set("subject")}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label hint="Opening line of the email">Greeting</Label>
              <input
                value={settings.greeting}
                onChange={set("greeting")}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label hint="Main email body (supports line breaks)">Body</Label>
              <textarea
                value={settings.body}
                onChange={set("body")}
                rows={8}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>
            <div>
              <Label hint="Sign-off text at the bottom of the email">Signature</Label>
              <textarea
                value={settings.signature}
                onChange={set("signature")}
                rows={4}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">Call-to-Action Links</h2>
            <div>
              <Label hint='Text shown above the "Schedule a call" button'>Calendly Text</Label>
              <input
                value={settings.calendlyText ?? ""}
                onChange={set("calendlyText")}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="We can scope what this looks like for your setup in 15 minutes:"
              />
            </div>
            <div>
              <Label hint='"Schedule a call" solid black button'>Calendly Link</Label>
              <input
                value={settings.calendlyLink}
                onChange={set("calendlyLink")}
                type="url"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://calendly.com/your-link"
              />
            </div>
            <div>
              <Label hint='"neoflo.ai" underlined text link'>Website Link</Label>
              <input
                value={settings.websiteLink ?? ""}
                onChange={set("websiteLink")}
                type="url"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://neoflo.ai"
              />
            </div>
          </div>
        </div>

        {/* Live preview */}
        {preview && (
          <div className="sticky top-24 self-start">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Email Preview</span>
                <span className="text-xs text-slate-400">Live rendering</span>
              </div>
              <div className="p-4 max-h-[75vh] overflow-y-auto">
                <iframe
                  srcDoc={buildPreviewHtml(settings)}
                  className="w-full border-0 rounded"
                  style={{ height: "600px" }}
                  title="Email preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildPreviewHtml(settings: EmailSettings): string {
  const greeting = settings.greeting.replace("{{name}}", "John");
  const body = settings.body
    .replace(/\{\{name\}\}/g, "John")
    .replace(/\{\{company\}\}/g, "Acme Inc.");
  const subject = settings.subject.replace("{{name}}", "John");
  const signature = settings.signature.replace("{{senderName}}", settings.senderName);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f0f0f0; font-size: 14px; }
    .wrapper { max-width: 560px; margin: 16px auto; background: #fff; overflow: hidden; }
    .header { background: #000000; padding: 28px 28px 28px; text-align: center; }
    .header img { width: 52px; height: 52px; display: block; margin: 0 auto 12px; }
    .header-title { color: #ffffff; font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -0.3px; }
    .header-sub { color: #888888; font-size: 12px; margin: 4px 0 0; }
    .divider-top { height: 3px; background: #ffffff; }
    .subject-bar { background: #f5f5f5; padding: 10px 16px; font-size: 12px; color: #666; border-bottom: 1px solid #e5e5e5; }
    .subject-bar strong { color: #000; }
    .body { padding: 32px 32px 24px; background: #ffffff; }
    .sender { font-size: 12px; color: #999999; margin-bottom: 4px; }
    .greeting { font-size: 17px; font-weight: 600; color: #000000; margin-bottom: 16px; }
    .text { font-size: 14px; line-height: 1.8; color: #333333; white-space: pre-line; margin-bottom: 0; }
    .cta-stack { margin: 20px 0 24px; }
    .cta-row { display: block; margin-bottom: 10px; }
    .cta-btn { display: block; background: #000000; color: #ffffff !important; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; }
    .cta-outline { background: #ffffff !important; color: #000000 !important; border: 2px solid #000000; }
    .cta-text { display: inline !important; background: transparent !important; color: #000000 !important; border: none; font-weight: 700; padding: 0; text-decoration: underline; font-size: 13px; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 20px 0; }
    .sig { font-size: 13px; color: #333333; white-space: pre-line; line-height: 1.7; font-weight: 500; }
    .footer { background: #000000; padding: 14px 28px; text-align: center; font-size: 11px; color: #666666; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="subject-bar">Subject: <strong>${subject}</strong></div>
  <div class="header">
    <img src="https://framerusercontent.com/images/PiUDXNvChzqEDzi8ImYqtZ4NFE.png" alt="Neoflo" />
    <p class="header-title">Welcome to Neoflo</p>
    <p class="header-sub">Finance operations, end-to-end</p>
  </div>
  <div class="divider-top"></div>
  <div class="body">
    <div class="sender">${settings.senderName}</div>
    <div class="greeting">${greeting}</div>
    <div class="text">${body}</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 24px;">
      ${settings.calendlyLink ? `${settings.calendlyText ? `<tr><td align="center" style="padding-bottom:4px;font-size:13px;color:#333333;line-height:1.6;">${settings.calendlyText}</td></tr>` : ""}<tr><td align="center" style="padding-bottom:10px;"><a href="${settings.calendlyLink}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;font-size:13px;font-weight:700;">Schedule a call &rarr;</a></td></tr>` : ""}
      ${settings.websiteLink ? `<tr><td align="center"><a href="${settings.websiteLink}" style="display:inline;color:#000000;font-weight:700;font-size:13px;text-decoration:underline;">neoflo.ai &rarr;</a></td></tr>` : ""}
    </table>
    <hr>
    <div class="sig">${signature}</div>
  </div>
  <div class="footer">&copy; ${new Date().getFullYear()} Neoflo. All rights reserved.</div>
</div>
</body>
</html>`;
}
