"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Images,
  Shield,
  BarChart3,
  Settings,
  Hexagon,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
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

export function MobileNav({
  activeView,
  onViewChange,
  storageUsed,
  storageTotal,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const storagePercent = Math.round((storageUsed / storageTotal) * 100);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Hexagon className="h-6 w-6 text-accent" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-foreground">
            Conneco Right
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border bg-card lg:hidden">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
              <Hexagon className="h-7 w-7 text-accent" strokeWidth={1.5} />
              <span className="text-base font-semibold text-foreground">
                Conneco Right
              </span>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-4">
              <span className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Menu
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Storage Widget */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border px-4 py-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive
                      className="h-4 w-4 text-muted-foreground"
                      strokeWidth={1.6}
                    />
                    <span className="text-xs font-medium text-foreground">
                      Storage
                    </span>
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
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
