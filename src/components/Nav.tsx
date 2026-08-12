"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanLine, Users, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Scan", icon: ScanLine },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top nav — desktop */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center">
              <span className="text-white font-semibold text-sm">N</span>
            </div>
            <span className="font-semibold text-slate-900">Neoflo</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Bottom tab bar — mobile only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs font-medium transition-colors ${
                active ? "text-slate-900" : "text-slate-400"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="sm:hidden h-16" />
    </>
  );
}
