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
    body: `Good meeting you at Gartner's Tech Leadership Event. Great talk on where AI actually pays off in operations.

Quick recap of what we do at Neoflo: we run finance operations end to end (AP, AR, reconciliation) as a managed service. AI handles 80% of the volume, specialists cover the rest, all SLA-backed.

And we price on outcomes, not headcount or hours - you pay for the work done, which lands about 50% below in-house cost`,
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
