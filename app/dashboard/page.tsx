"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { AssetGallery, type Asset } from "@/components/dashboard/asset-gallery";
import { AssetDetail } from "@/components/dashboard/asset-detail";
import { CopyrightsView } from "@/components/dashboard/copyrights-view";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { ProfileSettings } from "@/components/dashboard/profile-settings";
import { cn } from "@/lib/utils";

const sampleAssets: Asset[] = [
  {
    id: "1",
    title: "Coastal Serenity",
    src: "/images/art-1.jpg",
    type: "image",
    status: "Protected",
    creator: "Elena Marchetti",
    timestamp: "Jan 15, 2026",
    license: "CC BY-NC 4.0",
    dimensions: "3840 x 2160",
    fileSize: "8.2 MB",
  },
  {
    id: "2",
    title: "Mountain Dawn",
    src: "/images/art-2.jpg",
    type: "image",
    status: "Protected",
    creator: "Elena Marchetti",
    timestamp: "Jan 22, 2026",
    license: "All Rights Reserved",
    dimensions: "4096 x 2730",
    fileSize: "12.1 MB",
  },
  {
    id: "3",
    title: "Portrait Study #7",
    src: "/images/art-3.jpg",
    type: "image",
    status: "Processing",
    creator: "Elena Marchetti",
    timestamp: "Feb 3, 2026",
    license: "CC BY 4.0",
    dimensions: "2400 x 3200",
    fileSize: "5.6 MB",
  },
  {
    id: "4",
    title: "Neon Geometry #4",
    src: "/images/art-4.jpg",
    type: "image",
    status: "Protected",
    creator: "Elena Marchetti",
    timestamp: "Feb 10, 2026",
    license: "CC BY-SA 4.0",
    dimensions: "3000 x 3000",
    fileSize: "4.3 MB",
  },
  {
    id: "5",
    title: "Golden Hour",
    src: "/images/art-5.jpg",
    type: "video",
    status: "Pending",
    creator: "Elena Marchetti",
    timestamp: "Feb 18, 2026",
    license: "All Rights Reserved",
    dimensions: "1920 x 1080",
    fileSize: "142 MB",
  },
  {
    id: "6",
    title: "Botanical Study II",
    src: "/images/art-6.jpg",
    type: "image",
    status: "Protected",
    creator: "Elena Marchetti",
    timestamp: "Feb 24, 2026",
    license: "CC BY-NC 4.0",
    dimensions: "2800 x 4200",
    fileSize: "9.8 MB",
  },
  {
    id: "7",
    title: "Urban Rhythms",
    src: "/images/art-7.jpg",
    type: "image",
    status: "Processing",
    creator: "Elena Marchetti",
    timestamp: "Mar 1, 2026",
    license: "CC BY 4.0",
    dimensions: "3600 x 2400",
    fileSize: "7.1 MB",
  },
  {
    id: "8",
    title: "Dreamscape IV",
    src: "/images/art-8.jpg",
    type: "image",
    status: "Protected",
    creator: "Elena Marchetti",
    timestamp: "Mar 3, 2026",
    license: "All Rights Reserved",
    dimensions: "4000 x 3000",
    fileSize: "11.4 MB",
  },
];

const STORAGE_USED = 45;
const STORAGE_TOTAL = 100;

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("gallery");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const selectedAsset =
    sampleAssets.find((a) => a.id === selectedAssetId) || null;

  const handleSelectAsset = useCallback((id: string) => {
    setSelectedAssetId((prev) => (prev === id ? null : id));
    setActiveView("gallery");
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedAssetId(null);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background lg:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          storageUsed={STORAGE_USED}
          storageTotal={STORAGE_TOTAL}
        />
      </div>

      {/* Mobile Nav */}
      <MobileNav
        activeView={activeView}
        onViewChange={setActiveView}
        storageUsed={STORAGE_USED}
        storageTotal={STORAGE_TOTAL}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Primary View */}
        <div
          className={cn(
            "flex-1 overflow-hidden",
            activeView === "gallery" && selectedAssetId ? "hidden md:block" : ""
          )}
        >
          {activeView === "gallery" && (
            <AssetGallery
              assets={sampleAssets}
              selectedAssetId={selectedAssetId}
              onSelectAsset={handleSelectAsset}
            />
          )}
          {activeView === "copyrights" && (
            <CopyrightsView
              assets={sampleAssets}
              onSelectAsset={handleSelectAsset}
            />
          )}
          {activeView === "analytics" && <AnalyticsView />}
          {activeView === "settings" && <ProfileSettings />}
        </div>

        {/* Detail Panel (Gallery view only) */}
        {activeView === "gallery" && (
          <div
            className={cn(
              "w-full border-l border-border transition-all duration-300 md:w-[380px] lg:w-[400px]",
              selectedAssetId
                ? "block"
                : "hidden md:block"
            )}
          >
            <AssetDetail asset={selectedAsset} onClose={handleCloseDetail} />
          </div>
        )}
      </div>
    </div>
  );
}
