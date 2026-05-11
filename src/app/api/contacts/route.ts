import { NextResponse } from "next/server";
import { getAllContacts } from "@/lib/contacts-store";

export async function GET() {
  const contacts = await getAllContacts();
  return NextResponse.json(contacts);
}
