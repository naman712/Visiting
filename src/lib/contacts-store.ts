import { createClient } from "@supabase/supabase-js";
import { Contact } from "@/types";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getAllContacts(): Promise<Contact[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToContact);
}

export async function saveContact(contact: Contact): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from("contacts").upsert(contactToRow(contact));
  if (error) throw new Error(error.message);
}

function contactToRow(c: Contact) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    company: c.company,
    phone: c.phone ?? null,
    title: c.title ?? null,
    created_at: c.createdAt,
    email_sent: c.emailSent,
    hubspot_id: c.hubspotId ?? null,
    card_image_url: c.cardImageUrl ?? null,
  };
}

function rowToContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    company: row.company as string,
    phone: row.phone as string | undefined,
    title: row.title as string | undefined,
    createdAt: row.created_at as string,
    emailSent: row.email_sent as boolean,
    hubspotId: row.hubspot_id as string | undefined,
    cardImageUrl: row.card_image_url as string | undefined,
  };
}
