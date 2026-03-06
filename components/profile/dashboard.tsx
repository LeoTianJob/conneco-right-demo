"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/profile/sidebar";
import { MobileNav } from "@/components/profile/mobile-nav";
import { AssetGallery } from "@/components/profile/asset-gallery";
import { AssetDetail } from "@/components/profile/asset-detail";
import { CopyrightsView } from "@/components/profile/copyrights-view";
import { AnalyticsView } from "@/components/profile/analytics-view";
import { Settings } from "@/components/profile/settings";
import { cn } from "@/lib/utils";
import { type Asset, type UserProfile } from "./types";



interface DashboardClientProps {
    assets: Asset[];
    storageUsed: number;
    storageTotal: number;
    user: UserProfile | null | undefined;
}

export function Dashboard({
    assets,
    storageUsed,
    storageTotal,
    user
}: DashboardClientProps) {
    const [activeView, setActiveView] = useState("gallery");
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

    const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;

    const handleSelectAsset = useCallback((id: string) => {
        setSelectedAssetId((prev) => (prev === id ? null : id));
        setActiveView("gallery");
    }, []);

    const handleCloseDetail = useCallback(() => {
        setSelectedAssetId(null);
    }, []);

    return (
        <div className="flex h-screen flex-col bg-background lg:flex-row">
            <div className="hidden lg:block">
                <Sidebar
                    activeView={activeView}
                    onViewChange={setActiveView}
                    storageUsed={storageUsed}
                    storageTotal={storageTotal}
                />
            </div>

            <MobileNav
                activeView={activeView}
                onViewChange={setActiveView}
                storageUsed={storageUsed}
                storageTotal={storageTotal}
            />

            <div className="flex flex-1 overflow-hidden">
                <div
                    className={cn(
                        "flex-1 overflow-hidden",
                        activeView === "gallery" && selectedAssetId ? "hidden md:block" : ""
                    )}
                >
                    {activeView === "gallery" && (
                        <AssetGallery
                            assets={assets}
                            selectedAssetId={selectedAssetId}
                            onSelectAsset={handleSelectAsset}
                        />
                    )}
                    {activeView === "copyrights" && (
                        <CopyrightsView
                            assets={assets}
                            onSelectAsset={handleSelectAsset}
                        />
                    )}
                    {activeView === "analytics" && <AnalyticsView />}
                    {activeView === "settings" && <Settings user={user} />}
                </div>

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
