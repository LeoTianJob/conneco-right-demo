"use client";

import { Users, UserCheck, DollarSign, Gift, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function StatCard({ label, value, change, trend, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} strokeWidth={1.6} />
        </div>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            trend === "up"
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-amber-500/10 text-amber-600"
          )}
        >
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

const stats: StatCardProps[] = [
  {
    label: "Total Students",
    value: "2,847",
    change: "+124",
    trend: "up",
    icon: Users,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-500/10",
  },
  {
    label: "Active Accounts",
    value: "1,923",
    change: "+67",
    trend: "up",
    icon: UserCheck,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
  },
  {
    label: "Student Revenue Share",
    value: "$48,290",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
  },
  {
    label: "Total Rebates Earned",
    value: "$6,430",
    change: "-2.1%",
    trend: "down",
    icon: Gift,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
  },
];

interface StatsCardsProps {
  isAdminMode?: boolean;
}

const adminStats: StatCardProps[] = [
  {
    label: "Platform-Wide Students",
    value: "18,492",
    change: "+1,203",
    trend: "up",
    icon: Users,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-500/10",
  },
  {
    label: "Active Institutions",
    value: "142",
    change: "+9",
    trend: "up",
    icon: UserCheck,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
  },
  {
    label: "Platform Revenue",
    value: "$324,870",
    change: "+12.4%",
    trend: "up",
    icon: DollarSign,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
  },
  {
    label: "Total Rebates Paid",
    value: "$41,290",
    change: "+5.6%",
    trend: "up",
    icon: Gift,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
  },
];

export function StatsCards({ isAdminMode = false }: StatsCardsProps) {
  const data = isAdminMode ? adminStats : stats;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
