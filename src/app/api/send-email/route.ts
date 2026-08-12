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
    const eventId: string | undefined = body.eventId;
    const eventDateId: string | undefined = body.eventDateId;

    if (!contact?.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const settings = await getSettings();
    const event =
      settings.events.find((e) => e.id === eventId) ?? settings.events[0];

    if (!event) {
      return NextResponse.json({ error: "No event configured" }, { status: 400 });
    }

    const eventDate = event.dates.find((d) => d.id === eventDateId);

    // Send email using the event's template
    await sendWelcomeEmail(contact, event.template);

    // Create HubSpot contact (non-fatal)
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
      eventId: event.id,
      eventDateId: eventDate?.id,
      eventName: event.name,
      eventDateLabel: eventDate?.label,
    };
    await saveContact(record);

    return NextResponse.json({ success: true, contact: record });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
