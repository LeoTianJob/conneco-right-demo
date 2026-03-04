"use client";

import { ShieldAlert } from "lucide-react";

export function PrivacyDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={1.6} />
      <div>
        <p className="text-sm font-semibold text-foreground">
          Content Access Restriction
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Institution has no permissions to view or edit student creative content.
          All data displayed is aggregated and anonymized. Student portfolios, uploads, and personal
          creative works remain private and are only accessible by the individual account holder.
        </p>
      </div>
    </div>
  );
}
