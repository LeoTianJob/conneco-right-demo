"use client";

import Image from "next/image";
import {
  Shield,
  Clock,
  User,
  Calendar,
  FileText,
  X,
  Download,
  Share2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset } from "./asset-gallery";

interface AssetDetailProps {
  asset: Asset | null;
  onClose: () => void;
}

const statusConfig = {
  Protected: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Shield,
  },
  Processing: {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  Pending: {
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Clock,
  },
};

export function AssetDetail({ asset, onClose }: AssetDetailProps) {
  if (!asset) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-card px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-7 w-7 text-muted-foreground" strokeWidth={1.4} />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">
          No asset selected
        </h3>
        <p className="mt-1.5 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
          Click on an asset from the gallery to view its details and copyright
          metadata.
        </p>
      </div>
    );
  }

  const StatusIcon = statusConfig[asset.status].icon;

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Asset Details</h2>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close detail panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Preview */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={asset.src}
            alt={asset.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Info Section */}
        <div className="space-y-5 p-5">
          {/* Title and Status */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground leading-tight">
                {asset.title}
              </h3>
              <div
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                  statusConfig[asset.status].color
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {asset.status}
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {asset.type === "video" ? "Video" : "Image"}{" "}
              {asset.dimensions && `\u00B7 ${asset.dimensions}`}{" "}
              {asset.fileSize && `\u00B7 ${asset.fileSize}`}
            </p>
          </div>

          {/* Copyright Metadata */}
          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Copyright Metadata
            </h4>
            <div className="space-y-3">
              <MetadataRow
                icon={User}
                label="Creator"
                value={asset.creator}
              />
              <MetadataRow
                icon={Calendar}
                label="Timestamp"
                value={asset.timestamp}
              />
              <MetadataRow
                icon={FileText}
                label="License"
                value={asset.license}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
              <Shield className="h-4 w-4" />
              Update Copyright
            </button>
            <div className="flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            </div>
          </div>

          {/* Asset Hash */}
          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Asset Hash
            </h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                0x7f3a9b2c...d4e8f1a6
              </code>
              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Copy hash"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="View on blockchain"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetadataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
