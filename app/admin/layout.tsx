import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Conneco Right",
  description:
    "Art School Administrator analytics dashboard. View student metrics, market trends, and financial reports.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
