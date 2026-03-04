"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, Server, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const platformHealth = [
  { metric: "API Uptime", value: "99.97%", status: "healthy" },
  { metric: "Avg Response Time", value: "142ms", status: "healthy" },
  { metric: "Error Rate", value: "0.03%", status: "healthy" },
  { metric: "Active Sessions", value: "4,218", status: "healthy" },
];

const revenueByMonth = [
  { month: "Oct", revenue: 42300 },
  { month: "Nov", revenue: 51200 },
  { month: "Dec", revenue: 48900 },
  { month: "Jan", revenue: 56700 },
  { month: "Feb", revenue: 63400 },
  { month: "Mar", revenue: 71200 },
];

interface RevenueTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function RevenueTooltip({ active, payload, label }: RevenueTooltipProps) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function SystemAdminPanel() {
  return (
    <div className="space-y-6">
      {/* Platform Health */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
          <h3 className="text-sm font-semibold text-foreground">
            Organizational Health
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {platformHealth.map((item) => (
            <div
              key={item.metric}
              className="rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    item.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
                <span className="text-xs text-muted-foreground">{item.metric}</span>
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Revenue Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
            <h3 className="text-sm font-semibold text-foreground">
              Platform-Wide Revenue
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">Monthly gross revenue across all institutions</p>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByMonth} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Bar dataKey="revenue" fill="#a47864" radius={[4, 4, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
