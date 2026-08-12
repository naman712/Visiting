import { createClient } from "@supabase/supabase-js";
import { AppSettings, EmailTemplate } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_TEMPLATE: EmailTemplate = {
  senderName: "Team Neoflo",
  subject: "Great meeting you, {{name}}",
  greeting: "Hi {{name}},",
  body: `Good meeting you at Gartner's Tech Leadership Event. Great talk on where AI actually pays off in operations.

Quick recap of what we do at Neoflo: we run finance operations end to end (AP, AR, reconciliation) as a managed service. AI handles 80% of the volume, specialists cover the rest, all SLA-backed.

And we price on outcomes, not headcount or hours - you pay for the work done, which lands about 50% below in-house cost`,
  calendlyText: "We can scope what this looks like for your setup in 15 minutes:",
  calendlyLink: "https://calendly.com/your-link",
  websiteLink: "https://neoflo.ai",
  signature: `{{senderName}}
Neoflo`,
};

const DEFAULT_SETTINGS: AppSettings = {
  events: [
    {
      id: "default",
      name: "Default Event",
      dates: [],
      template: DEFAULT_TEMPLATE,
    },
  ],
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const { data } = await supabase
      .from("settings")
      .select("events, email")
      .eq("id", 1)
      .single();

    if (data?.events && Array.isArray(data.events) && data.events.length > 0) {
      return { events: data.events };
    }

    // Migration path: wrap the old flat email template as the first event
    if (data?.email) {
      return {
        events: [
          {
            id: "default",
            name: "Default Event",
            dates: [],
            template: { ...DEFAULT_TEMPLATE, ...(data.email as EmailTemplate) },
          },
        ],
      };
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await supabase.from("settings").upsert({ id: 1, events: settings.events });
}
