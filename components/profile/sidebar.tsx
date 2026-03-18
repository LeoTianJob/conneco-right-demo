"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Images,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardDrive,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  storageUsed: number;
  storageTotal: number;
}

const navItems = [
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "copyrights", label: "Copyrights", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  activeView,
  onViewChange,
  storageUsed,
  storageTotal,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const storagePercent = Math.round((storageUsed / storageTotal) * 100);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center border-b border-border px-5 py-5">
        <Logo height={28} showText={!collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        <span
          className={cn(
            "mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground",
            collapsed && "sr-only"
          )}
        >
          Menu
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Storage Widget */}
      <div className="border-t border-border px-4 py-4">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1" title={`${storageUsed}GB / ${storageTotal}GB`}>
            <HardDrive className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
            <span className="text-[10px] font-medium text-muted-foreground">
              {storagePercent}%
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
                <span className="text-xs font-medium text-foreground">Storage</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {storageUsed}GB / {storageTotal}GB
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {storagePercent}% of your storage used
            </p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-border px-3 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
