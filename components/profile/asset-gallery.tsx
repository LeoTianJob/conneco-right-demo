"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Shield,
  Clock,
  Play,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Asset {
  id: string;
  title: string;
  src: string;
  type: "image" | "video";
  status: "Protected" | "Processing" | "Pending";
  creator: string;
  timestamp: string;
  license: string;
  dimensions?: string;
  fileSize?: string;
}

interface AssetGalleryProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
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

export function AssetGallery({
  assets,
  selectedAssetId,
  onSelectAsset,
}: AssetGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Split assets into 3 columns for masonry layout
  const columns: Asset[][] = [[], [], []];
  filteredAssets.forEach((asset, i) => {
    columns[i % 3].push(asset);
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-border bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Asset Gallery
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filteredAssets.length} asset{filteredAssets.length !== 1 && "s"} in
            your collection
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-border bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="all">All</option>
              <option value="Protected">Protected</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center overflow-hidden rounded-lg border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-9 w-9 items-center justify-center transition-colors",
                viewMode === "grid"
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex h-9 w-9 items-center justify-center transition-colors",
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === "grid" ? (
          <div className="flex gap-4">
            {columns.map((column, colIdx) => (
              <div key={colIdx} className="flex flex-1 flex-col gap-4">
                {column.map((asset) => (
                  <GalleryCard
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedAssetId === asset.id}
                    onSelect={() => onSelectAsset(asset.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredAssets.map((asset) => (
              <ListRow
                key={asset.id}
                asset={asset}
                isSelected={selectedAssetId === asset.id}
                onSelect={() => onSelectAsset(asset.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryCard({
  asset,
  isSelected,
  onSelect,
}: {
  asset: Asset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const StatusIcon = statusConfig[asset.status].icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border bg-card text-left transition-all duration-200",
        isSelected
          ? "border-accent ring-2 ring-accent/20"
          : "border-border hover:border-accent/40 hover:shadow-lg"
      )}
    >
      <div className="relative">
        <Image
          src={asset.src}
          alt={asset.title}
          width={400}
          height={asset.type === "video" ? 225 : 300}
          className="w-full object-cover"
        />
        {asset.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg">
              <Play className="h-4 w-4 translate-x-0.5" fill="currentColor" />
            </div>
          </div>
        )}
        {/* Status Badge */}
        <div
          className={cn(
            "absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            statusConfig[asset.status].color
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {asset.status}
        </div>
      </div>
      <div className="px-3.5 py-3">
        <h3 className="text-sm font-medium text-foreground truncate">
          {asset.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {asset.creator}
        </p>
      </div>
    </button>
  );
}

function ListRow({
  asset,
  isSelected,
  onSelect,
}: {
  asset: Asset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const StatusIcon = statusConfig[asset.status].icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border bg-card px-4 py-3 text-left transition-all duration-200",
        isSelected
          ? "border-accent ring-2 ring-accent/20"
          : "border-border hover:border-accent/40 hover:shadow-md"
      )}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={asset.src}
          alt={asset.title}
          fill
          className="object-cover"
        />
        {asset.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
            <Play className="h-3 w-3 text-background" fill="currentColor" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate">
          {asset.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{asset.creator}</p>
      </div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shrink-0",
          statusConfig[asset.status].color
        )}
      >
        <StatusIcon className="h-3 w-3" />
        {asset.status}
      </div>
      <span className="hidden text-xs text-muted-foreground sm:block shrink-0">
        {asset.license}
      </span>
    </button>
  );
}
