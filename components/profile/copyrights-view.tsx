"use client";

import {
  Shield,
  Clock,
  FileText,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset } from "./asset-gallery";

interface CopyrightsViewProps {
  assets: Asset[];
  onSelectAsset: (id: string) => void;
}

export function CopyrightsView({ assets, onSelectAsset }: CopyrightsViewProps) {
  const protectedCount = assets.filter((a) => a.status === "Protected").length;
  const processingCount = assets.filter(
    (a) => a.status === "Processing"
  ).length;
  const pendingCount = assets.filter((a) => a.status === "Pending").length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">
          Copyright Management
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Monitor and manage copyright protections for your assets.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Shield}
            label="Protected"
            count={protectedCount}
            color="text-emerald-600 bg-emerald-50"
          />
          <SummaryCard
            icon={Clock}
            label="Processing"
            count={processingCount}
            color="text-amber-600 bg-amber-50"
          />
          <SummaryCard
            icon={AlertCircle}
            label="Pending Review"
            count={pendingCount}
            color="text-slate-600 bg-slate-100"
          />
        </div>

        {/* Copyright Table */}
        <div className="mt-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">
              All Registrations
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-8 rounded-lg border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Asset
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:table-cell">
                    License
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground md:table-cell">
                    Registered
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                  >
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => onSelectAsset(asset.id)}
                        className="flex items-center gap-3 text-left"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <FileText
                            className="h-3.5 w-3.5 text-muted-foreground"
                            strokeWidth={1.6}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {asset.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {asset.creator}
                          </p>
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          asset.status === "Protected" &&
                            "border-emerald-200 bg-emerald-50 text-emerald-700",
                          asset.status === "Processing" &&
                            "border-amber-200 bg-amber-50 text-amber-700",
                          asset.status === "Pending" &&
                            "border-slate-200 bg-slate-100 text-slate-600"
                        )}
                      >
                        {asset.status === "Protected" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {asset.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3.5 text-sm text-muted-foreground sm:table-cell">
                      {asset.license}
                    </td>
                    <td className="hidden px-5 py-3.5 text-sm text-muted-foreground md:table-cell">
                      {asset.timestamp}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                        View
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: typeof Shield;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          color
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.6} />
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{count}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
