import { NextResponse } from "next/server";
import { getAllContacts } from "@/lib/contacts-store";

// Always read live from Firestore — never serve a cached/build-time snapshot.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const contacts = await getAllContacts();
  return NextResponse.json(contacts);
}
