"use client";

import {
  Shield,
  Clock,
  Eye,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total Assets",
    value: "248",
    change: "+12",
    trend: "up",
    icon: BarChart3,
  },
  {
    label: "Protected",
    value: "196",
    change: "+8",
    trend: "up",
    icon: Shield,
  },
  {
    label: "Processing",
    value: "14",
    change: "-3",
    trend: "down",
    icon: Clock,
  },
  {
    label: "Total Views",
    value: "12.4K",
    change: "+1.2K",
    trend: "up",
    icon: Eye,
  },
];

const recentActivity = [
  {
    action: "Copyright registered",
    asset: "Coastal Serenity",
    time: "2 hours ago",
    type: "success",
  },
  {
    action: "New upload",
    asset: "Neon Geometry #4",
    time: "5 hours ago",
    type: "neutral",
  },
  {
    action: "License updated",
    asset: "Mountain Dawn",
    time: "1 day ago",
    type: "info",
  },
  {
    action: "Copyright verified",
    asset: "Urban Rhythms",
    time: "1 day ago",
    type: "success",
  },
  {
    action: "Processing complete",
    asset: "Botanical Study II",
    time: "2 days ago",
    type: "success",
  },
  {
    action: "New upload",
    asset: "Portrait Study #7",
    time: "3 days ago",
    type: "neutral",
  },
];

const monthlyData = [
  { month: "Sep", uploads: 18, protected: 15 },
  { month: "Oct", uploads: 24, protected: 20 },
  { month: "Nov", uploads: 32, protected: 28 },
  { month: "Dec", uploads: 28, protected: 26 },
  { month: "Jan", uploads: 36, protected: 31 },
  { month: "Feb", uploads: 42, protected: 38 },
];

export function AnalyticsView() {
  const maxUploads = Math.max(...monthlyData.map((d) => d.uploads));

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track your asset performance and protection metrics.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Icon
                      className="h-4 w-4 text-muted-foreground"
                      strokeWidth={1.6}
                    />
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-semibold",
                      stat.trend === "up"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    )}
                  >
                    <TrendingUp
                      className={cn(
                        "h-3 w-3",
                        stat.trend === "down" && "rotate-180"
                      )}
                    />
                    {stat.change}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="col-span-1 rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Monthly Activity
            </h3>
            <div className="flex h-48 items-end gap-3">
              {monthlyData.map((d) => (
                <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative flex w-full flex-col items-center gap-0.5">
                    <div
                      className="w-full max-w-[36px] rounded-t-md bg-accent/80"
                      style={{
                        height: `${(d.uploads / maxUploads) * 140}px`,
                      }}
                    />
                    <div
                      className="w-full max-w-[36px] rounded-b-md bg-foreground/15"
                      style={{
                        height: `${((d.uploads - d.protected) / maxUploads) * 140}px`,
                      }}
                    />
                  </div>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-accent/80" />
                <span className="text-xs text-muted-foreground">Protected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-foreground/15" />
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      item.type === "success" && "bg-emerald-500",
                      item.type === "info" && "bg-sky-500",
                      item.type === "neutral" && "bg-slate-400"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{item.action}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.asset} &middot; {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
