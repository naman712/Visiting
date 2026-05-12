import fs from "fs";
import path from "path";
import { AppSettings } from "@/types";

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json");

const DEFAULT_SETTINGS: AppSettings = {
  email: {
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
  },
};

export function getSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // Return defaults on error
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}
