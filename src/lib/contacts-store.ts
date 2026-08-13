import { getDb } from "./firebase";
import { Contact } from "@/types";

const COLLECTION = "contacts";

export async function getAllContacts(): Promise<Contact[]> {
  const db = getDb();
  const snap = await db.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => docToContact(d.data()));
}

export async function saveContact(contact: Contact): Promise<void> {
  const db = getDb();
  await db.collection(COLLECTION).doc(contact.id).set(contactToDoc(contact));
}

function contactToDoc(c: Contact) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    company: c.company,
    phone: c.phone ?? null,
    title: c.title ?? null,
    createdAt: c.createdAt,
    emailSent: c.emailSent,
    hubspotId: c.hubspotId ?? null,
    cardImageUrl: c.cardImageUrl ?? null,
    eventId: c.eventId ?? null,
    eventDateId: c.eventDateId ?? null,
    eventName: c.eventName ?? null,
    eventDateLabel: c.eventDateLabel ?? null,
  };
}

function docToContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    company: row.company as string,
    phone: (row.phone as string) ?? undefined,
    title: (row.title as string) ?? undefined,
    createdAt: row.createdAt as string,
    emailSent: row.emailSent as boolean,
    hubspotId: (row.hubspotId as string) ?? undefined,
    cardImageUrl: (row.cardImageUrl as string) ?? undefined,
    eventId: (row.eventId as string) ?? undefined,
    eventDateId: (row.eventDateId as string) ?? undefined,
    eventName: (row.eventName as string) ?? undefined,
    eventDateLabel: (row.eventDateLabel as string) ?? undefined,
  };
}
