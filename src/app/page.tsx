"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Upload, User, Mail, Building2, Phone, Briefcase, Send, Loader2, CheckCircle2, X, ScanLine } from "lucide-react";
import { ContactInfo, EmailSettings } from "@/types";

const EMPTY_CONTACT: ContactInfo = { name: "", email: "", company: "", phone: "", title: "" };

type Mode = "idle" | "ocr" | "sending" | "done";

export default function ScanPage() {
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [tab, setTab] = useState<"upload" | "manual">("upload");
  const [settings, setSettings] = useState<EmailSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data.email))
      .catch(() => {});
  }, []);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
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
      toast.success("Card scanned successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "OCR failed");
    } finally {
      setMode("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  async function handleSend() {
    if (!contact.email) return toast.error("Email address is required");
    setMode("sending");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMode("done");
      toast.success("Welcome email sent & contact saved to HubSpot!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
      setMode("idle");
    }
  }

  function handleReset() {
    setContact(EMPTY_CONTACT);
    setPreview(null);
    setMode("idle");
  }

  const field = (
    label: string,
    key: keyof ContactInfo,
    Icon: React.ElementType,
    type = "text",
    required = false
  ) => (
    <div key={key}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          value={contact[key] ?? ""}
          onChange={(e) => setContact((c) => ({ ...c, [key]: e.target.value }))}
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={mode === "ocr" || mode === "sending"}
        />
      </div>
    </div>
  );

  if (mode === "done") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">All done!</h2>
          <p className="text-slate-500 mb-6">
            Welcome email sent to <strong>{contact.email}</strong>
            <br />Contact recorded in HubSpot.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Scan Another Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <ScanLine size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Scan a Visiting Card</h1>
        </div>
        <p className="text-slate-500 ml-13">Upload a card image or enter details manually — we&apos;ll send a personalised welcome email.</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-8">
        {(["upload", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {t === "upload" ? "📷 Upload / Scan" : "✏️ Manual Entry"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: upload or manual */}
        <div className="space-y-6">
          {tab === "upload" && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Card preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setContact(EMPTY_CONTACT); }}
                    className="absolute top-0 right-0 bg-white rounded-full p-0.5 shadow"
                  >
                    <X size={14} className="text-slate-600" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={36} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-600 font-medium">Drop a card image here</p>
                  <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                  <p className="text-slate-300 text-xs mt-3">JPG, PNG, WEBP supported</p>
                </>
              )}
              {mode === "ocr" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Extracting details with Gemini AI…</span>
                </div>
              )}
            </div>
          )}

          {/* Contact form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
              {tab === "upload" ? "Extracted Details" : "Contact Details"}
            </h3>
            {field("Full Name", "name", User)}
            {field("Email", "email", Mail, "email", true)}
            {field("Company", "company", Building2)}
            {field("Phone", "phone", Phone, "tel")}
            {field("Job Title", "title", Briefcase)}
          </div>
        </div>

        {/* Right: email preview + send */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide mb-4">Email Preview</h3>
            {settings ? (
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 space-y-3">
                <div>
                  <span className="text-xs font-medium text-slate-400 uppercase">To</span>
                  <p className="font-medium text-slate-700">{contact.email || "recipient@example.com"}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400 uppercase">Subject</span>
                  <p className="font-medium text-slate-700">
                    {settings.subject.replace("{{name}}", contact.name || "there")}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400 uppercase">Greeting</span>
                  <p>{settings.greeting.replace("{{name}}", contact.name || "there")}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400 uppercase">Body excerpt</span>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-500">
                    {settings.body
                      .replace(/\{\{name\}\}/g, contact.name || "there")
                      .replace(/\{\{company\}\}/g, contact.company || "your company")
                      .substring(0, 200)}…
                  </p>
                </div>
                {settings.calendlyLink && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
                    <span className="text-indigo-700 text-xs font-medium">📅 Calendly button will appear here</span>
                    <p className="text-indigo-400 text-xs mt-0.5 truncate">{settings.calendlyLink}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Loading email template…</p>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!contact.email || mode === "ocr" || mode === "sending"}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
          >
            {mode === "sending" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send size={18} />
                Send Welcome Email & Save to HubSpot
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
