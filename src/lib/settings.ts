import { createClient } from "@supabase/supabase-js";
import { AppSettings } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_SETTINGS: AppSettings = {
  email: {
    senderName: "Team Neoflo",
    subject: "Welcome to Neoflo, {{name}}",
    greeting: "Hi {{name}},",
    body: `Thanks for connecting with the Neoflo team tonight. Hope the panel on AI, headcount, and the trade-offs ahead gave you something to work with.

Quick recap on us: Neoflo runs finance operations end-to-end as a managed service. AP, reconciliation, month-end close. AI handles volume, specialists handle exceptions. SLA-backed, live in 4 weeks.`,
    calendlyText: "We can scope what this looks like for your setup in 15 minutes:",
    calendlyLink: "https://calendly.com/your-link",
    websiteLink: "https://neoflo.ai",
    signature: `{{senderName}}\nNeoflo`,
  },
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const { data } = await supabase
      .from("settings")
      .select("email")
      .eq("id", 1)
      .single();
    if (data?.email) return { email: data.email };
  } catch {
    // fall through to defaults
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await supabase.from("settings").upsert({ id: 1, email: settings.email });
}
