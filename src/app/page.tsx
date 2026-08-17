"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Upload, Send, Loader2, CheckCircle2, X, Camera, Image as ImageIcon } from "lucide-react";
import { ContactInfo, EventConfig } from "@/types";
import { buildEmailHtml } from "@/lib/email-template";

const EMPTY_CONTACT: ContactInfo = { name: "", email: "", company: "", phone: "", title: "" };

type Mode = "idle" | "ocr" | "sending" | "done";

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900";

export default function ScanPage() {
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [tab, setTab] = useState<"scan" | "manual">("scan");

  const [events, setEvents] = useState<EventConfig[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedDateId, setSelectedDateId] = useState("");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const evts: EventConfig[] = data.events ?? [];
        setEvents(evts);
        if (evts[0]) setSelectedEventId(evts[0].id);
      })
      .catch(() => {});
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const template = selectedEvent?.template;

  const processFile = useCallback(async (file: File) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setMode("ocr");
    setContact(EMPTY_CONTACT);

    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContact(data.contact);
      toast.success("Card scanned");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setMode("idle");
    }
  }, []);

  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) processFile(files[0]);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  async function handleSend() {
    if (!contact.email) return toast.error("Email is required");
    if (!selectedEventId) return toast.error("Select an event");
    setMode("sending");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact,
          eventId: selectedEventId,
          eventDateId: selectedDateId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMode("done");
      toast.success("Email sent");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
      setMode("idle");
    }
  }

  function handleReset() {
    setContact(EMPTY_CONTACT);
    setPreview(null);
    setSelectedDateId("");
    setMode("idle");
  }

  const field = (label: string, key: keyof ContactInfo, type = "text", required = false) => (
    <div key={key}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-slate-400">*</span>}
      </label>
      <input
        type={type}
        value={contact[key] ?? ""}
        onChange={(e) => setContact((c) => ({ ...c, [key]: e.target.value }))}
        className={inputCls}
        placeholder={label}
        disabled={mode === "ocr" || mode === "sending"}
      />
    </div>
  );

  if (mode === "done") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 size={48} className="text-slate-900 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Email sent</h2>
          <p className="text-slate-500 text-sm mb-6">
            Sent to <span className="text-slate-900">{contact.email}</span>
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800"
          >
            Scan another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Scan a card</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Capture details, pick the event, and send the welcome email.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-md mb-6">
        {(["scan", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t === "scan" ? "Scan card" : "Manual entry"}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {tab === "scan" && (
          <>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

            {/* Mobile capture buttons */}
            <div className="sm:hidden grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={mode === "ocr"}
                className="flex flex-col items-center gap-2 py-5 border border-slate-200 rounded-lg text-slate-700 text-sm font-medium active:bg-slate-50 disabled:opacity-40"
              >
                <Camera size={24} strokeWidth={1.6} /> Take photo
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={mode === "ocr"}
                className="flex flex-col items-center gap-2 py-5 border border-slate-200 rounded-lg text-slate-700 text-sm font-medium active:bg-slate-50 disabled:opacity-40"
              >
                <ImageIcon size={24} strokeWidth={1.6} /> Gallery
              </button>
            </div>

            {/* Mobile preview */}
            {preview && (
              <div className="sm:hidden relative border border-slate-200 rounded-lg p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Card" className="max-h-44 mx-auto rounded object-contain block" />
                <button
                  onClick={() => { setPreview(null); setContact(EMPTY_CONTACT); }}
                  className="absolute top-2 right-2 bg-white border border-slate-200 rounded-full p-1"
                >
                  <X size={14} className="text-slate-600" />
                </button>
              </div>
            )}

            {/* Desktop dropzone */}
            <div
              {...getRootProps()}
              className={`hidden sm:block border border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-slate-900 bg-slate-50" : "border-slate-300 hover:border-slate-400"
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Card" className="max-h-44 mx-auto rounded object-contain" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setContact(EMPTY_CONTACT); }}
                    className="absolute top-0 right-0 bg-white border border-slate-200 rounded-full p-0.5"
                  >
                    <X size={14} className="text-slate-600" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mx-auto text-slate-300 mb-2" strokeWidth={1.5} />
                  <p className="text-slate-600 text-sm font-medium">Drop a card image or click to browse</p>
                  <p className="text-slate-400 text-xs mt-1">JPG, PNG, WEBP</p>
                </>
              )}
            </div>

            {mode === "ocr" && (
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <Loader2 size={15} className="animate-spin" /> Reading card…
              </div>
            )}
          </>
        )}

        {/* Contact fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Name", "name")}
          {field("Email", "email", "email", true)}
          {field("Company", "company")}
          {field("Phone", "phone", "tel")}
          <div className="sm:col-span-2">{field("Job title", "title")}</div>
        </div>

        {/* Event + date selectors */}
        <div className="border-t border-slate-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => { setSelectedEventId(e.target.value); setSelectedDateId(""); }}
              className={inputCls}
            >
              {events.length === 0 && <option value="">No events configured</option>}
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>

          {selectedEvent && selectedEvent.dates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <select
                value={selectedDateId}
                onChange={(e) => setSelectedDateId(e.target.value)}
                className={inputCls}
              >
                <option value="">Select a date</option>
                {selectedEvent.dates.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label || d.date}{d.label && d.date ? ` — ${d.date}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Email preview */}
        {template && (
          <div className="border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email preview</p>
              <p className="text-xs text-slate-400 truncate ml-3">
                Subject: {template.subject.replace(/\{\{name\}\}/g, contact.name || "there")}
              </p>
            </div>
            {template.customHtml ? (
              <iframe
                title="Email preview"
                className="w-full border-0 bg-white"
                style={{ height: "360px" }}
                srcDoc={buildEmailHtml(
                  { ...contact, name: contact.name || "there" },
                  template
                )}
              />
            ) : (
              <div className="space-y-2 text-sm px-4 pb-4">
                <p className="text-slate-700">{template.greeting.replace(/\{\{name\}\}/g, contact.name || "there")}</p>
                <p className="text-slate-500 text-xs whitespace-pre-line leading-relaxed">
                  {template.body
                    .replace(/\{\{name\}\}/g, contact.name || "there")
                    .replace(/\{\{company\}\}/g, contact.company || "your company")
                    .slice(0, 240)}
                  {template.body.length > 240 ? "…" : ""}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!contact.email || !selectedEventId || mode === "ocr" || mode === "sending"}
          className="w-full py-3 bg-slate-900 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {mode === "sending" ? (
            <><Loader2 size={16} className="animate-spin" /> Sending…</>
          ) : (
            <><Send size={16} /> Send welcome email</>
          )}
        </button>
      </div>
    </div>
  );
}
