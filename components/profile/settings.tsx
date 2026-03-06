"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Eye, EyeOff, Save, Loader2, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
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

export function Settings({ user }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<ProfileData>({
    imageUrl: user?.imageUrl || "/images/art-1.jpg",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  }

  const { signOut } = useClerk();

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
                <p className="text-sm font-medium text-foreground">
                  {/* {profile.username} */}
                </p>
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
                onChange={(val) =>
                  setProfile((p) => ({ ...p, email: val }))
                }
                type="email"
                placeholder="your@email.com"
              />
              <FormField
                label="Phone Number"
                value={profile.phone}
                onChange={(val) =>
                  setProfile((p) => ({ ...p, phone: val }))
                }
                type="tel"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Password */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

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
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
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
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </div>
  );
}
