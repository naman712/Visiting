import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/gmail";
import { createOrUpdateHubspotContact } from "@/lib/hubspot";
import { getSettings } from "@/lib/settings";
import { saveContact } from "@/lib/contacts-store";
import { Contact, ContactInfo } from "@/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contact: ContactInfo = body.contact;
    const customSettings = body.settings; // optional per-send override

    if (!contact.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const settings = customSettings ?? (await getSettings()).email;

    // Send email
    await sendWelcomeEmail(contact, settings);

    // Create HubSpot contact
    let hubspotId: string | undefined;
    try {
      hubspotId = await createOrUpdateHubspotContact(contact);
    } catch (err) {
      console.error("HubSpot error (non-fatal):", err);
    }

    // Save to Supabase
    const record: Contact = {
      ...contact,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      emailSent: true,
      hubspotId,
    };
    await saveContact(record);

    return NextResponse.json({ success: true, contact: record });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
