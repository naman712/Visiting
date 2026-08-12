"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { AppSettings, EventConfig, EmailTemplate } from "@/types";

const BLANK_TEMPLATE: EmailTemplate = {
  senderName: "Team Neoflo",
  subject: "Great meeting you, {{name}}",
  greeting: "Hi {{name}},",
  body: "",
  calendlyText: "We can scope what this looks like for your setup in 15 minutes:",
  calendlyLink: "",
  websiteLink: "https://neoflo.ai",
  signature: "{{senderName}}\nNeoflo",
};

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400 ml-2">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [openEvent, setOpenEvent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: AppSettings) => {
        setSettings(data);
        setOpenEvent(data.events[0]?.id ?? null);
      })
      .catch(() => toast.error("Failed to load settings"));
  }, []);

  function updateEvent(id: string, patch: Partial<EventConfig>) {
    setSettings((prev) =>
      prev
        ? {
            events: prev.events.map((e) =>
              e.id === id ? { ...e, ...patch } : e
            ),
          }
        : prev
    );
  }

  function updateTemplate(id: string, patch: Partial<EmailTemplate>) {
    setSettings((prev) =>
      prev
        ? {
            events: prev.events.map((e) =>
              e.id === id ? { ...e, template: { ...e.template, ...patch } } : e
            ),
          }
        : prev
    );
  }

  function addEvent() {
    const id = newId();
    setSettings((prev) =>
      prev
        ? {
            events: [
              ...prev.events,
              {
                id,
                name: "New Event",
                dates: [],
                template: { ...BLANK_TEMPLATE },
              },
            ],
          }
        : prev
    );
    setOpenEvent(id);
  }

  function removeEvent(id: string) {
    setSettings((prev) =>
      prev ? { events: prev.events.filter((e) => e.id !== id) } : prev
    );
  }

  function addDate(eventId: string) {
    setSettings((prev) =>
      prev
        ? {
            events: prev.events.map((e) =>
              e.id === eventId
                ? { ...e, dates: [...e.dates, { id: newId(), label: "", date: "" }] }
                : e
            ),
          }
        : prev
    );
  }

  function updateDate(
    eventId: string,
    dateId: string,
    patch: { label?: string; date?: string }
  ) {
    setSettings((prev) =>
      prev
        ? {
            events: prev.events.map((e) =>
              e.id === eventId
                ? {
                    ...e,
                    dates: e.dates.map((d) =>
                      d.id === dateId ? { ...d, ...patch } : d
                    ),
                  }
                : e
            ),
          }
        : prev
    );
  }

  function removeDate(eventId: string, dateId: string) {
    setSettings((prev) =>
      prev
        ? {
            events: prev.events.map((e) =>
              e.id === eventId
                ? { ...e, dates: e.dates.filter((d) => d.id !== dateId) }
                : e
            ),
          }
        : prev
    );
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure events, their dates, and the email sent for each.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save
        </button>
      </div>

      <div className="space-y-3">
        {settings.events.map((event) => {
          const open = openEvent === event.id;
          return (
            <div
              key={event.id}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              {/* Event header row */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50">
                <button
                  onClick={() => setOpenEvent(open ? null : event.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-700"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${open ? "" : "-rotate-90"}`}
                  />
                </button>
                <input
                  value={event.name}
                  onChange={(e) => updateEvent(event.id, { name: e.target.value })}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                  placeholder="Event name"
                />
                <span className="text-xs text-slate-400">
                  {event.dates.length} date{event.dates.length !== 1 ? "s" : ""}
                </span>
                {settings.events.length > 1 && (
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="shrink-0 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {open && (
                <div className="px-4 py-4 space-y-5 border-t border-slate-100">
                  {/* Dates */}
                  <Field label="Dates" hint="optional — leave empty if no dates">
                    <div className="space-y-2">
                      {event.dates.map((d) => (
                        <div key={d.id} className="flex items-center gap-2">
                          <input
                            value={d.label}
                            onChange={(e) =>
                              updateDate(event.id, d.id, { label: e.target.value })
                            }
                            className={inputCls}
                            placeholder="Label (e.g. Day 1)"
                          />
                          <input
                            type="date"
                            value={d.date}
                            onChange={(e) =>
                              updateDate(event.id, d.id, { date: e.target.value })
                            }
                            className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                          />
                          <button
                            onClick={() => removeDate(event.id, d.id)}
                            className="shrink-0 text-slate-300 hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addDate(event.id)}
                        className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
                      >
                        <Plus size={14} /> Add date
                      </button>
                    </div>
                  </Field>

                  <div className="h-px bg-slate-100" />

                  {/* Template */}
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Email Template
                  </p>
                  <p className="text-xs text-slate-400 -mt-3">
                    Use {"{{name}}"} and {"{{company}}"} as placeholders.
                  </p>

                  <Field label="Sender name">
                    <input
                      value={event.template.senderName}
                      onChange={(e) =>
                        updateTemplate(event.id, { senderName: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Subject">
                    <input
                      value={event.template.subject}
                      onChange={(e) =>
                        updateTemplate(event.id, { subject: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Greeting">
                    <input
                      value={event.template.greeting}
                      onChange={(e) =>
                        updateTemplate(event.id, { greeting: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Body">
                    <textarea
                      value={event.template.body}
                      onChange={(e) =>
                        updateTemplate(event.id, { body: e.target.value })
                      }
                      rows={7}
                      className={`${inputCls} resize-y`}
                    />
                  </Field>
                  <Field label="Calendly text" hint="line above the button">
                    <input
                      value={event.template.calendlyText}
                      onChange={(e) =>
                        updateTemplate(event.id, { calendlyText: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Calendly link">
                    <input
                      value={event.template.calendlyLink}
                      onChange={(e) =>
                        updateTemplate(event.id, { calendlyLink: e.target.value })
                      }
                      className={inputCls}
                      placeholder="https://..."
                    />
                  </Field>
                  <Field label="Website link">
                    <input
                      value={event.template.websiteLink}
                      onChange={(e) =>
                        updateTemplate(event.id, { websiteLink: e.target.value })
                      }
                      className={inputCls}
                      placeholder="https://neoflo.ai"
                    />
                  </Field>
                  <Field label="Signature">
                    <textarea
                      value={event.template.signature}
                      onChange={(e) =>
                        updateTemplate(event.id, { signature: e.target.value })
                      }
                      rows={2}
                      className={`${inputCls} resize-y`}
                    />
                  </Field>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addEvent}
        className="mt-4 flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Plus size={15} /> Add event
      </button>
    </div>
  );
}
