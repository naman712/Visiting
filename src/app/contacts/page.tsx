"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Contact } from "@/types";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/contacts", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { setContacts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      (c.eventName ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {contacts.length} recorded
          </p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-56 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={26} className="animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">
            {search ? "No matches" : "No contacts yet"}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-2.5 font-medium text-slate-400 text-xs uppercase tracking-wide">Name</th>
                <th className="px-4 py-2.5 font-medium text-slate-400 text-xs uppercase tracking-wide">Company</th>
                <th className="px-4 py-2.5 font-medium text-slate-400 text-xs uppercase tracking-wide">Event</th>
                <th className="px-4 py-2.5 font-medium text-slate-400 text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 font-medium text-slate-400 text-xs uppercase tracking-wide">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{c.name || "—"}</p>
                    <p className="text-slate-400 text-xs">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.company || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.eventName || "—"}
                    {c.eventDateLabel && (
                      <span className="text-slate-400 text-xs block">{c.eventDateLabel}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.emailSent ? "Sent" : "Pending"}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
