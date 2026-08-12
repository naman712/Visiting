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
      {/* Left sidebar — desktop */}
      <aside className="hidden sm:flex flex-col w-56 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 px-3 py-5">
        <Link href="/" className="flex items-center gap-2 px-2 mb-6">
          <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center">
            <span className="text-white font-semibold text-sm">N</span>
          </div>
          <span className="font-semibold text-slate-900">Neoflo</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Top bar — mobile only (brand) */}
      <header className="sm:hidden sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center">
            <span className="text-white font-semibold text-sm">N</span>
          </div>
          <span className="font-semibold text-slate-900">Neoflo</span>
        </Link>
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
    </>
  );
}
