"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Menu, Flame, Star, LogOut, User as UserIcon, Gift, AlertTriangle, CreditCard } from "lucide-react";
import type { PlanStatus } from "@/lib/billing";

type TopbarProps = {
  onMenuClick: () => void;
  userName: string | null;
  streak: number;
  xp: number;
  planStatus: PlanStatus;
};

export function Topbar({ onMenuClick, userName, streak, xp, planStatus }: TopbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 lg:px-6">
      <button
        aria-label="Abrir menú"
        onClick={onMenuClick}
        className="text-muted-foreground hover:text-foreground lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4 text-sm">
        <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-warning-bg px-3 py-1 font-medium text-warning">
          <Flame className="h-4 w-4" />
          {streak} días
        </span>
        <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 font-medium text-foreground">
          <Star className="h-4 w-4 text-primary" />
          {xp} XP
        </span>

        {planStatus.isPaid ? (
          <Link
            href="/pricing"
            className="hidden items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 font-medium text-success sm:flex"
          >
            <CreditCard className="h-4 w-4" />
            {planStatus.tier === "ANNUAL" ? "Anual" : "Mensual"}
          </Link>
        ) : planStatus.isTrialActive ? (
          <Link
            href="/pricing"
            className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary sm:flex"
          >
            <Gift className="h-4 w-4" />
            Prueba: {planStatus.trialDaysLeft}d
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="hidden items-center gap-1.5 rounded-full bg-danger-bg px-3 py-1 font-medium text-danger sm:flex"
          >
            <AlertTriangle className="h-4 w-4" />
            Prueba caducada
          </Link>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full bg-surface-muted p-2 text-muted-foreground hover:text-foreground"
          >
            <UserIcon className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                aria-hidden
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
                <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border truncate">
                  {userName ?? "Cuenta"}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-muted disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Saliendo..." : "Cerrar sesión"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
