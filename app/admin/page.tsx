"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShieldCheck,
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { StatsCards } from "@/components/admin/stats-cards";
import { StudentActivityChart } from "@/components/admin/student-activity-chart";
import { MarketTrendsChart } from "@/components/admin/market-trends-chart";
import { FinancialTable } from "@/components/admin/financial-table";
import { PrivacyDisclaimer } from "@/components/admin/privacy-disclaimer";
import { SystemAdminPanel } from "@/components/admin/system-admin-panel";

export default function AdminDashboard() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <Logo height={28} showText className="[&>span]:hidden [&>span]:sm:inline" />
            <div className="mx-3 hidden h-6 w-px bg-border sm:block" />
            <div className="hidden items-center gap-1.5 sm:flex">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
              <span className="text-sm font-medium text-foreground">Admin Dashboard</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden max-w-md flex-1 px-8 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students, reports..."
                className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Admin Mode Toggle */}
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                isAdminMode
                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">
                {isAdminMode ? "System Admin" : "School Admin"}
              </span>
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  isAdminMode ? "bg-accent-foreground/80" : "bg-muted-foreground/40"
                )}
              />
            </button>

            {/* Notifications */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" strokeWidth={1.6} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                3
              </span>
            </button>

            {/* User Menu */}
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                AD
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium text-foreground">Admin User</p>
                <p className="text-[10px] text-muted-foreground">Art School of Design</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          </div>
        </div>
      </header>

      {/* Mode Indicator Banner */}
      {isAdminMode && (
        <div className="border-b border-accent/30 bg-accent/5 px-6 py-2">
          <div className="mx-auto flex max-w-[1400px] items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.6} />
            <p className="text-xs font-medium text-accent">
              System Admin Mode — Viewing platform-wide data and organizational health metrics
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6">
        <div className="space-y-6">
          {/* Privacy Disclaimer */}
          <PrivacyDisclaimer />

          {/* Stats Bar */}
          <StatsCards isAdminMode={isAdminMode} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Student Activity (wider) */}
            <div className="lg:col-span-2">
              <StudentActivityChart />
            </div>
            {/* Pie Chart */}
            <div className="lg:col-span-1">
              <MarketTrendsChart />
            </div>
          </div>

          {/* System Admin Panel (only in admin mode) */}
          {isAdminMode && <SystemAdminPanel />}

          {/* Financial Table */}
          <FinancialTable isAdminMode={isAdminMode} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-6 py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Conneco Right Admin Dashboard — Art School of Design
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: Mar 4, 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
