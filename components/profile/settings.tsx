"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Save, Loader2, LogOut, Eye, EyeOff } from "lucide-react";
import { useClerk, useReverification, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { type UserProfile } from "./types";
import { EmailAddressResource, SessionVerificationLevel } from "@clerk/nextjs/types";
import { EmailVerificationForm } from "./email-verification-form";

// --- Types ---

interface ProfileData {
  imageUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface VerificationState {
  complete: () => void;
  cancel: () => void;
  level: SessionVerificationLevel | undefined;
  inProgress: boolean;
}

interface ProfileSettingsProps {
  user: UserProfile | null | undefined;
}

// --- Sub-components ---

function SettingsHeader({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profile Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>
      <button
        onClick={onSignOut}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function AvatarSection({ profile }: { profile: ProfileData }) {
  return (
    <Section title="Avatar">
      <div className="flex items-center gap-5">
        <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-border">
          <Image src={profile.imageUrl} alt="Avatar" fill className="object-cover" />
          <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/40">
            <Camera className="h-5 w-5 text-background opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
        <div>
          <p className="font-medium text-foreground">{profile.firstName} {profile.lastName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, or GIF. Max 2MB.</p>
          <button className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
            Upload New Photo
          </button>
        </div>
      </div>
    </Section>
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
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
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

function ActionButtons({
  onSave,
  onCancel,
  saving,
  saved,
}: {
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pb-6">
      <button
        onClick={onCancel}
        className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className={cn(
          "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
          saved ? "bg-emerald-600 text-white" : "bg-foreground text-background hover:opacity-90",
          saving && "opacity-70"
        )}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

// --- Main Component ---

export function Settings({ user: initialUser }: ProfileSettingsProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  // State
  const [profile, setProfile] = useState<ProfileData>({
    imageUrl: initialUser?.imageUrl || "/images/art-1.jpg",
    firstName: initialUser?.firstName ?? "",
    lastName: initialUser?.lastName ?? "",
    email: initialUser?.email ?? "",
    phone: initialUser?.phone ?? "",
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifyingLoading, setIsVerifyingLoading] = useState(false);
  const [newEmail, setNewEmail] = useState<EmailAddressResource | undefined>();
  const [verificationState, setVerificationState] = useState<VerificationState | undefined>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Handlers
  const handleSave = useReverification(
    async () => {
      if (!user) return;
      setSaving(true);
      setError(null);
      setStatusMessage(null);

      try {
        const updates: string[] = [];

        // Update Names
        if (profile.firstName !== initialUser?.firstName || profile.lastName !== initialUser?.lastName) {
          await user.update({ firstName: profile.firstName, lastName: profile.lastName });
          updates.push("Name");
        }

        // Update Email (Triggers Verification)
        if (profile.email !== initialUser?.email) {
          const res = await user.createEmailAddress({ email: profile.email });
          setNewEmail(res);
          await res.prepareVerification({ strategy: "email_code" });
          setIsVerifying(true);
          setSaving(false);
          setStatusMessage("Please verify your new email address.");
          return;
        }

        if (updates.length > 0) {
          setSaved(true);
          setStatusMessage(`Successfully updated: ${updates.join(", ")}`);
          setTimeout(() => setSaved(false), 3000);
        } else {
          setStatusMessage("No changes detected.");
        }
      } catch (err: any) {
        console.error("Update error:", err);
        setError(err.errors?.[0]?.message || "An unexpected error occurred.");
      } finally {
        setSaving(false);
      }
    },
    {
      onNeedsReverification: ({ complete, cancel, level }) => {
        setVerificationState({ level, inProgress: true, complete, cancel });
        setSaving(false);
        setError("Security verification required for sensitive changes.");
      },
    }
  );

  const handleVerifyEmail = async (code: string) => {
    if (!newEmail || !user) return;
    setIsVerifyingLoading(true);
    setError(null);

    try {
      const attempt = await newEmail.attemptVerification({ code });
      if (attempt.verification.status === "verified") {
        await user.update({ primaryEmailAddressId: newEmail.id });
        setIsVerifying(false);
        setNewEmail(undefined);
        setIsVerifyingLoading(false);
        setSaved(true);
        setStatusMessage("Email updated and verified successfully.");
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Verification failed.");
        setIsVerifyingLoading(false);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid code.");
      setIsVerifyingLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!newEmail) return;
    try {
      await newEmail.prepareVerification({ strategy: "email_code" });
      setStatusMessage("Verification code resent.");
    } catch {
      setError("Failed to resend code.");
    }
  };

  const handleCancelVerification = () => {
    setIsVerifying(false);
    setError(null);
    setProfile((p) => ({ ...p, email: initialUser?.email ?? "" }));
  };

  return (
    <div className="flex h-full flex-col">
      <SettingsHeader onSignOut={() => signOut({ redirectUrl: "/" })} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <AvatarSection profile={profile} />

          <Section title="Personal Information">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <FormField
                    label="First Name"
                    value={profile.firstName}
                    onChange={(val) => setProfile((p) => ({ ...p, firstName: val }))}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    label="Last Name"
                    value={profile.lastName}
                    onChange={(val) => setProfile((p) => ({ ...p, lastName: val }))}
                  />
                </div>
              </div>
              <FormField
                label="Email Address"
                value={profile.email}
                onChange={(val) => setProfile((p) => ({ ...p, email: val }))}
                type="email"
                disabled={isVerifying}
              />
              <FormField label="Phone Number" value={profile.phone} onChange={() => { }} disabled />
            </div>
          </Section>

          <Section title="Change Password">
            <div className="space-y-4">
              <div className="relative">
                <FormField
                  label="New Password"
                  value={password}
                  onChange={setPassword}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <FormField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </Section>

          {isVerifying && (
            <EmailVerificationForm
              email={profile.email}
              onVerify={handleVerifyEmail}
              onResend={handleResendCode}
              onCancel={handleCancelVerification}
              isLoading={isVerifyingLoading}
              error={error}
            />
          )}

          {(error || statusMessage) && (
            <div className={cn(
              "rounded-lg border p-4 text-sm font-medium",
              error ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            )}>
              <div className="flex flex-col gap-3">
                <p>{error || statusMessage}</p>
                {verificationState?.inProgress && (
                  <button
                    onClick={verificationState.complete}
                    className="w-fit rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold uppercase text-white hover:bg-destructive/90"
                  >
                    Confirm & Save Changes
                  </button>
                )}
              </div>
            </div>
          )}

          <ActionButtons
            onSave={handleSave}
            onCancel={() => {
              setProfile({
                imageUrl: initialUser?.imageUrl || "/images/art-1.jpg",
                firstName: initialUser?.firstName ?? "",
                lastName: initialUser?.lastName ?? "",
                email: initialUser?.email ?? "",
                phone: initialUser?.phone ?? "",
              });
              setPassword("");
              setConfirmPassword("");
            }}
            saving={saving}
            saved={saved}
          />
        </div>
      </div>
    </div>
  );
}
