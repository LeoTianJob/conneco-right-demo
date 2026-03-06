"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Eye, EyeOff, Save, Loader2, LogOut } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { type UserProfile } from "./types";

interface ProfileData {
  imageUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ProfileSettingsProps {
  user: UserProfile | null | undefined;
}

export function Settings({ user: initialUser }: ProfileSettingsProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [profile, setProfile] = useState<ProfileData>({
    imageUrl: initialUser?.imageUrl || "/images/art-1.jpg",
    firstName: initialUser?.firstName ?? "",
    lastName: initialUser?.lastName ?? "",
    email: initialUser?.email ?? "",
    phone: initialUser?.phone ?? "",
  });



  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const updates: string[] = [];

      // 1. Update Names
      if (
        profile.firstName !== initialUser?.firstName ||
        profile.lastName !== initialUser?.lastName
      ) {
        await user.update({
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
        updates.push("Name");
      }

      if (updates.length > 0) {
        setSaved(true);
        setStatusMessage(`Successfully updated: ${updates.join(", ")}`);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setStatusMessage("No changes detected.");
      }
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      if (err instanceof Error) {
        const clerkError = (err as {
          errors?: Array<{ message: string }>;
        }).errors?.[0]?.message;
        setError(clerkError || err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Profile Settings
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Avatar Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Avatar
            </h2>
            <div className="flex items-center gap-5">
              <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-border">
                <Image
                  src={profile.imageUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/40">
                  <Camera className="h-5 w-5 text-background opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
              <div>
                <p>{profile.firstName} {profile.lastName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  JPG, PNG, or GIF. Max 2MB.
                </p>
                <button className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                  Upload New Photo
                </button>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <FormField
                    label="First Name"
                    value={profile.firstName ?? ""}
                    onChange={(val) =>
                      setProfile((p) => ({ ...p, firstName: val }))
                    }
                    placeholder="First Name"
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    label="Last Name"
                    value={profile.lastName ?? ""}
                    onChange={(val) =>
                      setProfile((p) => ({ ...p, lastName: val }))
                    }
                    placeholder="Last Name"
                  />
                </div>
              </div>
              <FormField
                label="Email Address"
                value={profile.email}
                onChange={() => { }}
                type="email"
                placeholder="your@email.com"
                disabled
              />
              <FormField
                label="Phone Number"
                value={profile.phone}
                onChange={() => { }}
                type="tel"
                placeholder="+1 (555) 000-0000"
                disabled
              />
            </div>
          </div>



          {/* Status Messages */}
          {(error || statusMessage) && (
            <div
              className={cn(
                "rounded-lg p-4 text-sm font-medium",
                error
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              )}
            >
              <div className="flex flex-col gap-3">
                <p>{error || statusMessage}</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <button className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-foreground text-background hover:opacity-90",
                saving && "opacity-70"
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40",
          disabled && "opacity-60 cursor-not-allowed bg-muted/30"
        )}
      />
    </div>
  );
}
