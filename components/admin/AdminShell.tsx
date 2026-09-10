"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Car,
  Users,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Settings,
  ClipboardCheck,
  Contact,
  Megaphone,
  Tag,
  Menu,
  X,
  Receipt,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { USER_ROLE_LABELS } from "@/lib/types";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; roles: UserRole[] }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["SALES", "MANAGER", "ADMIN"] },
  { href: "/admin/documentacao", label: "Documentação", icon: ClipboardCheck, roles: ["SALES", "MANAGER", "ADMIN"] },
  { href: "/admin/veiculos", label: "Estoque", icon: Car, roles: ["MANAGER", "ADMIN"] },
  { href: "/admin/precificacao", label: "Precificação", icon: Tag, roles: ["MANAGER", "ADMIN"] },
  { href: "/admin/leads", label: "Leads", icon: Users, roles: ["MANAGER", "ADMIN"] },
  { href: "/admin/vendedores", label: "Vendedores", icon: Contact, roles: ["MANAGER", "ADMIN"] },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone, roles: ["MANAGER", "ADMIN"] },
  { href: "/admin/notas-fiscais", label: "Notas Fiscais", icon: Receipt, roles: ["SALES", "MANAGER", "ADMIN"] },
  { href: "/admin/usuarios", label: "Usuários", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, roles: ["ADMIN"] },
];

export function AdminShell({
  name,
  email,
  role,
  children,
}: {
  name: string;
  email: string;
  role: UserRole;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = NAV.filter((item) => item.roles.includes(role));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh bg-ink-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-black p-4 lg:flex">
        <Link href="/admin" className="mb-6 flex items-center px-2">
          <Image
            src="/logo.png"
            alt="Auto2000 Veículos"
            width={896}
            height={444}
            className="h-9 w-auto rounded-md"
          />
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-accent-500 text-black" : "text-white/60 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white"
          >
            <ExternalLink className="h-4.5 w-4.5" />
            Ver site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/8 hover:text-white lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={mobileNavOpen}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm text-white/50">
            <span className="hidden sm:inline">{name}</span>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-accent-400">
              {USER_ROLE_LABELS[role]}
            </span>
            <span className="hidden text-white/30 md:inline">{email}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-black p-4">
            <div className="mb-6 flex items-center justify-between px-2">
              <Image src="/logo.png" alt="Auto2000 Veículos" width={896} height={444} className="h-9 w-auto rounded-md" />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/8 hover:text-white"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {nav.map(({ href, label, icon: Icon }) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-accent-500 text-black" : "text-white/60 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white"
              >
                <ExternalLink className="h-4.5 w-4.5" />
                Ver site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
