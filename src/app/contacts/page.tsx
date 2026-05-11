"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Building2, Phone, CheckCircle2, Clock, Loader2, ExternalLink } from "lucide-react";
import { Contact } from "@/types";

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        ok ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {ok ? <CheckCircle2 size={11} /> : <Clock size={11} />}
      {ok ? "Email sent" : "Pending"}
    </span>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) => { setContacts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Contacts</h1>
            <p className="text-slate-500 text-sm">{contacts.length} contact{contacts.length !== 1 ? "s" : ""} recorded</p>
          </div>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or company…"
          className="w-64 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-slate-500 font-medium">
            {search ? "No contacts match your search" : "No contacts yet"}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {!search && "Scan your first visiting card to get started."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Contact</th>
                <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Company</th>
                <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Phone</th>
                <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wide">HubSpot</th>
                <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
                        <span className="text-indigo-700 font-semibold text-sm">
                          {c.name ? c.name[0].toUpperCase() : "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{c.name || "—"}</p>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                          <Mail size={11} /> {c.email}
                        </p>
                        {c.title && <p className="text-slate-400 text-xs">{c.title}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {c.company ? (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Building2 size={14} className="text-slate-300" />
                        {c.company}
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {c.phone ? (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={14} className="text-slate-300" />
                        {c.phone}
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge ok={c.emailSent} />
                  </td>
                  <td className="px-5 py-4">
                    {c.hubspotId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                        <ExternalLink size={11} />
                        Synced
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">
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
