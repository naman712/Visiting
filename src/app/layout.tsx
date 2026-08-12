import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Nav from "@/components/Nav";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Neoflo | Visiting Card Scanner",
  description: "Scan visiting cards, send welcome emails, and log contacts to HubSpot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-white sm:flex">
        <Nav />
        <main className="flex-1 min-w-0 pb-20 sm:pb-0">{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "8px",
              fontFamily: "var(--font-geist-sans)",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
