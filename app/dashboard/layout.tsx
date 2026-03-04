import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Conneco Right",
  description:
    "Manage your creative assets, copyrights, and profile settings.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}
