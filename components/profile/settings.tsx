"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Camera, Loader2, LogOut, Eye, EyeOff } from "lucide-react";
import { useClerk, useReverification, useSession, useUser } from "@clerk/nextjs";
import {
  isClerkRuntimeError,
  isReverificationCancelledError,
} from "@clerk/nextjs/errors";
import { cn } from "@/lib/utils";
import {
  clerkErrorIndicatesSessionReverification,
  getErrorMessageFromUnknown,
} from "@/lib/auth-client-utils";
import { type UserProfile } from "./types";
import {
  EmailAddressResource,
  PhoneNumberResource,
  SessionVerificationLevel,
} from "@clerk/nextjs/types";
import { EmailVerificationForm } from "./email-verification-form";
import { SessionReverificationModal } from "./session-reverification-modal";
import { preparePhoneNumberVerification } from "@/lib/clerk-phone-verification";
import {
  nationalDigitsForForm,
  phoneComparable,
  sanitizeUsCanadaPhoneInput,
} from "@/lib/phone-e164";
import { deleteUserAccount } from "@/app/profile/actions";

/**
 * Reverification — **Phase 1 (baseline)**. No runtime behavior change yet; documents scope for Phases 2–3.
 *
 * **Product scope (sensitive vs Clerk):** add/remove email, set primary email, add/remove phone, set primary phone
 * align with Clerk’s “sensitive actions” (strongest factor, ~10m window). See
 * {@link https://clerk.com/docs/guides/secure/reverification | Add reverification for sensitive actions}.
 *
 * **UX:** Custom `SessionReverificationModal` via `useReverification`’s `onNeedsReverification` (not Clerk’s default modal).
 *
 * **Manual (Clerk Dashboard):** Confirm session/reverification settings; first factors for step-up (e.g. email code, SMS, password)
 * are available so users can complete reverification after idle.
 *
 * **Phase 2:** Sensitive `User` mutations use `useReverification` + `SessionReverificationModal` for `onNeedsReverification`.
 * Fetchers must not swallow Clerk errors (no inner catch) so the hook can see rejections. `invokeSensitiveAction` + message/code
 * matching in `clerkErrorIndicatesSessionReverification` covers FAPI errors that omit `session_reverification_required`.
 */

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

interface SettingsHeaderProps {
  onSignOut: () => void;
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

interface AvatarSectionProps {
  profile: ProfileData;
}

interface SettingsFieldRowProps {
  label: string;
  labelId?: string;
  children: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

function isReverificationUserCancelled(error: unknown): boolean {
  return isClerkRuntimeError(error) && isReverificationCancelledError(error);
}

function profileFromUserSnapshot(u: UserProfile | null | undefined): ProfileData {
  return {
    imageUrl: u?.imageUrl || "/images/art-1.jpg",
    firstName: u?.firstName ?? "",
    lastName: u?.lastName ?? "",
    email: u?.email ?? "",
    phone: nationalDigitsForForm(u?.phone),
  };
}

// --- Sub-components ---

/**
 * @description Renders the settings page top header with sign-out action.
 */
function SettingsHeader({ onSignOut }: SettingsHeaderProps): JSX.Element {
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

function Section({ title, children }: SectionProps): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function AvatarSection({ profile }: AvatarSectionProps): JSX.Element {
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
          <p className="font-medium text-foreground">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, or GIF. Max 2MB.</p>
          <button
            type="button"
            className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Upload New Photo
          </button>
        </div>
      </div>
    </Section>
  );
}

/**
 * @description Label + field(s) on the left, optional action button aligned to the input row on wide screens.
 */
function SettingsFieldRow({
  label,
  labelId,
  children,
  action,
  footer,
}: SettingsFieldRowProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label
            className="block text-sm font-medium text-foreground"
            htmlFor={labelId}
          >
            {label}
          </label>
          {children}
        </div>
        {action ? (
          <div className="flex shrink-0 xl:pt-0 xl:pb-0.5">{action}</div>
        ) : null}
      </div>
      {footer}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  id,
  className,
}: FormFieldProps): JSX.Element {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40",
          disabled && "cursor-not-allowed bg-muted/30 opacity-60"
        )}
      />
    </div>
  );
}

function inlineActionButton(disabled: boolean, onClick: () => void, label: string, pending: boolean): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className={cn(
        "flex h-11 w-48 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-2 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors",
        disabled || pending ? "cursor-not-allowed opacity-60" : "hover:bg-muted"
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

function CancelEditsFooter({ onCancel }: { onCancel: () => void }): JSX.Element {
  return (
    <div className="flex justify-end border-t border-border pt-6 pb-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Cancel
      </button>
    </div>
  );
}

// --- Main Component ---

/**
 * @description Profile settings: per-field updates, shared OTP for new email/phone, and Clerk reverification for sensitive User API calls.
 *
 * @remarks **Phase 2:** reverification on sensitive flows + cancellation handling (see module comment). **Phase 3:** optional
 * server `auth().has({ reverification: 'strict' })` for Server Actions.
 */
export function Settings({ user: initialUser }: ProfileSettingsProps): JSX.Element {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const { signOut } = useClerk();

  const sessionRef = useRef(session);
  const userRef = useRef(user);
  sessionRef.current = session;
  userRef.current = user;

  const reloadClerkSessionContext = useCallback(async (): Promise<void> => {
    try {
      await sessionRef.current?.reload();
    } catch {
      /* session may be unavailable during transitions */
    }
    try {
      await userRef.current?.reload();
    } catch {
      /* ignore */
    }
  }, []);

  const hasLinkedOAuthProviders = (user?.externalAccounts?.length ?? 0) > 0;
  const isEmailManagedBySocialProvider = hasLinkedOAuthProviders;
  const showPasswordSection =
    isLoaded && user?.passwordEnabled === true && !hasLinkedOAuthProviders;

  const [committedBaseline, setCommittedBaseline] = useState<ProfileData>(() =>
    profileFromUserSnapshot(initialUser)
  );
  const [profile, setProfile] = useState<ProfileData>(() =>
    profileFromUserSnapshot(initialUser)
  );

  useEffect(() => {
    const next = profileFromUserSnapshot(initialUser);
    setCommittedBaseline(next);
    setProfile(next);
  }, [initialUser?.id]);

  const profileRef = useRef(profile);
  const baselineRef = useRef(committedBaseline);
  profileRef.current = profile;
  baselineRef.current = committedBaseline;

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifyingLoading, setIsVerifyingLoading] = useState(false);
  const [newEmail, setNewEmail] = useState<EmailAddressResource | undefined>();
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingPhoneLoading, setIsVerifyingPhoneLoading] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<PhoneNumberResource | undefined>();
  const [verificationState, setVerificationState] = useState<VerificationState | undefined>();
  const [reverificationNonce, setReverificationNonce] = useState(0);
  const reverificationHandlersRef = useRef<{
    complete: () => void;
    cancel: () => void;
  } | null>(null);
  const fallbackRevResolveRef = useRef<((ok: boolean) => void) | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [namesPending, setNamesPending] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [phonePending, setPhonePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [sessionRevPending, setSessionRevPending] = useState(false);
  const [fallbackRevModalOpen, setFallbackRevModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [deactivatePending, setDeactivatePending] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  type NeedsRev = {
    complete: () => void;
    cancel: () => void;
    level: SessionVerificationLevel | undefined;
  };

  const handleNeedsReverification = useCallback((params: NeedsRev) => {
    reverificationHandlersRef.current = { complete: params.complete, cancel: params.cancel };
    setReverificationNonce((n) => n + 1);
    setVerificationState({
      level: params.level,
      inProgress: true,
      complete: params.complete,
      cancel: params.cancel,
    });
    setNamesPending(false);
    setEmailPending(false);
    setPhonePending(false);
    setPasswordPending(false);
    setError(null);
    setStatusMessage(
      "For your security, confirm your identity in the dialog to finish this change."
    );
  }, []);

  /**
   * Runs a `useReverification`-wrapped action. If Clerk requires reverification but the hook did not intercept
   * (wrong error code) or the inner fetcher swallowed errors, rejection still reaches here — then we show
   * `SessionReverificationModal` once and retry.
   */
  const invokeSensitiveAction = useCallback(async (action: () => Promise<unknown>): Promise<boolean> => {
    const runOnce = async (): Promise<void> => {
      await action();
    };
    try {
      await runOnce();
      return true;
    } catch (e: unknown) {
      if (isReverificationUserCancelled(e)) {
        setError(null);
        setStatusMessage("Identity verification was cancelled.");
        return false;
      }
      if (!clerkErrorIndicatesSessionReverification(e)) {
        setError(getErrorMessageFromUnknown(e));
        return false;
      }
      setError(null);
      setSessionRevPending(true);
      setStatusMessage(
        "For your security, please verify your identity again to change your email or phone."
      );
      const ok = await new Promise<boolean>((resolve) => {
        fallbackRevResolveRef.current = resolve;
        setFallbackRevModalOpen(true);
        setReverificationNonce((n) => n + 1);
      });
      setSessionRevPending(false);
      if (!ok) {
        setStatusMessage("Identity verification was cancelled.");
        return false;
      }
      setStatusMessage(null);
      try {
        await reloadClerkSessionContext();
        await runOnce();
        return true;
      } catch (e2: unknown) {
        if (isReverificationUserCancelled(e2)) {
          setStatusMessage("Identity verification was cancelled.");
          return false;
        }
        setError(getErrorMessageFromUnknown(e2));
        return false;
      }
    }
  }, [reloadClerkSessionContext]);

  const reverificationOpts = useMemo(
    () => ({ onNeedsReverification: handleNeedsReverification }),
    [handleNeedsReverification]
  );

  const runUpdateNames = useReverification(
    async () => {
      if (!user) return;
      setNamesPending(true);
      setError(null);
      setStatusMessage(null);
      try {
        const { firstName, lastName } = profileRef.current;
        const b = baselineRef.current;
        if (firstName === b.firstName && lastName === b.lastName) {
          setStatusMessage("No changes to your name.");
          return;
        }
        await user.update({ firstName, lastName });
        setCommittedBaseline((prev) => ({ ...prev, firstName, lastName }));
        setStatusMessage("Name updated successfully.");
      } finally {
        setNamesPending(false);
      }
    },
    reverificationOpts
  );

  const runCommitPrimaryEmail = useReverification(
    async (emailAddressId: string) => {
      if (!user) return;
      await user.update({ primaryEmailAddressId: emailAddressId });
      await user.reload();
    },
    reverificationOpts
  );

  const runCommitPrimaryPhone = useReverification(
    async (phoneNumberId: string) => {
      if (!user) return;
      await user.update({ primaryPhoneNumberId: phoneNumberId });
      await user.reload();
    },
    reverificationOpts
  );

  const runDestroyPhoneById = useReverification(
    async (phoneNumberId: string) => {
      if (!user) return;
      const resource = user.phoneNumbers.find((p) => p.id === phoneNumberId);
      if (resource) {
        await resource.destroy();
        await user.reload();
      }
    },
    reverificationOpts
  );

  const runUpdateEmail = useReverification(
    async () => {
      if (!user) return;
      setEmailPending(true);
      setError(null);
      setStatusMessage(null);
      try {
        const emailVal = profileRef.current.email.trim();
        if (emailVal === baselineRef.current.email) {
          setStatusMessage("Email is unchanged.");
          return;
        }
        const res = await user.createEmailAddress({ email: emailVal });
        setNewEmail(res);
        await res.prepareVerification({ strategy: "email_code" });
        setIsVerifying(true);
        setStatusMessage("Please verify your new email address.");
      } finally {
        setEmailPending(false);
      }
    },
    reverificationOpts
  );

  const runUpdatePhone = useReverification(
    async () => {
      if (!user) return;
      setPhonePending(true);
      setError(null);
      setStatusMessage(null);
      try {
        const initialPhoneComparable = phoneComparable(baselineRef.current.phone);
        const trimmedPhone = profileRef.current.phone.trim();
        const currentPhoneComparable =
          trimmedPhone === "" ? "" : phoneComparable(trimmedPhone);

        if (trimmedPhone !== "" && currentPhoneComparable === "") {
          setError(
            "Enter a valid 10-digit US or Canada number (digits only; area code and exchange cannot start with 0 or 1)."
          );
          return;
        }

        if (initialPhoneComparable && currentPhoneComparable === "") {
          const primary = user.primaryPhoneNumber;
          if (primary) {
            await primary.destroy();
            await user.reload();
          }
          const nextPhone = nationalDigitsForForm(user.primaryPhoneNumber?.phoneNumber);
          setCommittedBaseline((prev) => ({ ...prev, phone: nextPhone }));
          setProfile((p) => ({ ...p, phone: nextPhone }));
          setStatusMessage("Phone number removed.");
          return;
        }

        if (
          currentPhoneComparable &&
          currentPhoneComparable !== initialPhoneComparable
        ) {
          const created = await user.createPhoneNumber({
            phoneNumber: currentPhoneComparable,
          });
          await user.reload();
          const phoneResource = user.phoneNumbers.find((p) => p.id === created.id);
          if (!phoneResource) {
            throw new Error("Phone number not found after creation.");
          }
          await preparePhoneNumberVerification(phoneResource);
          setPendingPhone(phoneResource);
          setIsVerifyingPhone(true);
          setStatusMessage("Please verify your new phone number.");
          return;
        }

        setStatusMessage("Phone number is unchanged.");
      } finally {
        setPhonePending(false);
      }
    },
    reverificationOpts
  );

  const runUpdatePassword = useReverification(
    async () => {
      if (!user) return;
      setPasswordPending(true);
      setError(null);
      setStatusMessage(null);
      try {
        const pw = password;
        const confirm = confirmPassword;
        if (pw.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        if (pw !== confirm) {
          setError("Passwords do not match.");
          return;
        }
        await user.updatePassword({ newPassword: pw });
        setPassword("");
        setConfirmPassword("");
        setStatusMessage("Password updated successfully.");
      } finally {
        setPasswordPending(false);
      }
    },
    reverificationOpts
  );

  const handleVerifyEmail = async (code: string): Promise<void> => {
    if (!newEmail || !user) return;
    setIsVerifyingLoading(true);
    setError(null);

    try {
      const attempt = await newEmail.attemptVerification({ code });
      if (attempt.verification.status === "verified") {
        const committed = await invokeSensitiveAction(() =>
          runCommitPrimaryEmail(newEmail.id),
        );
        if (!committed) {
          setIsVerifyingLoading(false);
          return;
        }
        const addr = newEmail.emailAddress.trim();
        setCommittedBaseline((prev) => ({ ...prev, email: addr }));
        setProfile((p) => ({ ...p, email: addr }));
        setIsVerifying(false);
        setNewEmail(undefined);
        setIsVerifyingLoading(false);
        setStatusMessage("Email updated and verified successfully.");
        try {
          await userRef.current?.reload();
        } catch {
          /* ignore */
        }
      } else {
        setError("Verification failed.");
        setIsVerifyingLoading(false);
      }
    } catch (err: unknown) {
      setError(getErrorMessageFromUnknown(err));
      setIsVerifyingLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (!newEmail) return;
    const ok = await invokeSensitiveAction(async () => {
      await newEmail.prepareVerification({ strategy: "email_code" });
    });
    if (ok) {
      setStatusMessage("Verification code resent.");
    }
  };

  const handleCancelVerification = (): void => {
    setIsVerifying(false);
    setError(null);
    setProfile((p) => ({ ...p, email: baselineRef.current.email }));
  };

  const handleVerifyPhone = async (code: string): Promise<void> => {
    if (!pendingPhone || !user) return;
    setIsVerifyingPhoneLoading(true);
    setError(null);

    try {
      const attempt = await pendingPhone.attemptVerification({ code });
      if (attempt.verification.status === "verified") {
        const previousPrimaryId = user.primaryPhoneNumber?.id;
        const committed = await invokeSensitiveAction(() =>
          runCommitPrimaryPhone(pendingPhone.id),
        );
        if (!committed) {
          setIsVerifyingPhoneLoading(false);
          return;
        }
        if (previousPrimaryId && previousPrimaryId !== pendingPhone.id) {
          const removed = await invokeSensitiveAction(() =>
            runDestroyPhoneById(previousPrimaryId),
          );
          if (!removed) {
            setIsVerifyingPhoneLoading(false);
            return;
          }
        }
        const nextPhone = nationalDigitsForForm(pendingPhone.phoneNumber);
        setCommittedBaseline((prev) => ({ ...prev, phone: nextPhone }));
        setProfile((p) => ({ ...p, phone: nextPhone }));
        setIsVerifyingPhone(false);
        setPendingPhone(undefined);
        setIsVerifyingPhoneLoading(false);
        setStatusMessage("Phone number updated and verified successfully.");
        try {
          await userRef.current?.reload();
        } catch {
          /* ignore */
        }
      } else {
        setError("Verification failed.");
        setIsVerifyingPhoneLoading(false);
      }
    } catch (err: unknown) {
      setError(getErrorMessageFromUnknown(err));
      setIsVerifyingPhoneLoading(false);
    }
  };

  const handleResendPhoneCode = async (): Promise<void> => {
    if (!pendingPhone) return;
    const ok = await invokeSensitiveAction(async () => {
      await preparePhoneNumberVerification(pendingPhone);
    });
    if (ok) {
      setStatusMessage("Verification code resent.");
    }
  };

  const handleCancelPhoneVerification = async (): Promise<void> => {
    if (pendingPhone) {
      try {
        await pendingPhone.destroy();
      } catch {
        /* ignore */
      }
    }
    setPendingPhone(undefined);
    setIsVerifyingPhone(false);
    setIsVerifyingPhoneLoading(false);
    setError(null);
    setProfile((p) => ({ ...p, phone: baselineRef.current.phone }));
  };

  const initialPhoneComparable = phoneComparable(committedBaseline.phone);
  const trimmedProfilePhone = profile.phone.trim();
  const currentPhoneComparable =
    trimmedProfilePhone === "" ? "" : phoneComparable(trimmedProfilePhone);
  const phoneInputInvalid =
    trimmedProfilePhone !== "" && currentPhoneComparable === "";
  const phoneUnchanged = currentPhoneComparable === initialPhoneComparable;

  const namesUnchanged =
    profile.firstName === committedBaseline.firstName &&
    profile.lastName === committedBaseline.lastName;

  const emailUnchanged = profile.email.trim() === committedBaseline.email;

  const passwordMismatchOrEmpty =
    !password || password !== confirmPassword || password.length < 8;

  const showOtpDialog = isVerifying || (isVerifyingPhone && Boolean(pendingPhone));

  const handleCancelAllLocalEdits = (): void => {
    const finishFallback = fallbackRevResolveRef.current;
    if (finishFallback) {
      fallbackRevResolveRef.current = null;
      finishFallback(false);
    }
    setFallbackRevModalOpen(false);
    setSessionRevPending(false);
    setDeactivateConfirmOpen(false);
    setDeactivateError(null);

    const phoneToCleanup = pendingPhone;
    if (phoneToCleanup) {
      void phoneToCleanup.destroy().catch(() => {
        /* ignore */
      });
    }
    setPendingPhone(undefined);
    setIsVerifyingPhone(false);
    setIsVerifyingPhoneLoading(false);
    setIsVerifying(false);
    setNewEmail(undefined);
    setProfile({ ...committedBaseline });
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setStatusMessage(null);
  };

  const handleDeactivateAccount = async (): Promise<void> => {
    if (!user?.id) return;
    setDeactivateError(null);
    setDeactivatePending(true);
    try {
      const res = await deleteUserAccount(user.id);
      if (!res.success) {
        setDeactivateError(res.error ?? "Could not deactivate account.");
        return;
      }
      await signOut({ redirectUrl: "/" });
    } finally {
      setDeactivatePending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SettingsHeader onSignOut={() => signOut({ redirectUrl: "/" })} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <AvatarSection profile={profile} />

          <Section title="Personal Information">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:gap-4">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    id="profile-first-name"
                    label="First Name"
                    value={profile.firstName}
                    onChange={(val) => setProfile((p) => ({ ...p, firstName: val }))}
                  />
                  <FormField
                    id="profile-last-name"
                    label="Last Name"
                    value={profile.lastName}
                    onChange={(val) => setProfile((p) => ({ ...p, lastName: val }))}
                  />
                </div>
                <div className="flex shrink-0 xl:pb-0.5">
                  {inlineActionButton(
                    namesUnchanged ||
                      isVerifying ||
                      isVerifyingPhone ||
                      sessionRevPending,
                    () => {
                      void invokeSensitiveAction(() => runUpdateNames());
                    },
                    "Update names",
                    namesPending
                  )}
                </div>
              </div>

              <SettingsFieldRow
                label="Email Address"
                labelId="profile-email"
                action={
                  !isEmailManagedBySocialProvider
                    ? inlineActionButton(
                        emailUnchanged ||
                          isVerifying ||
                          isVerifyingPhone ||
                          sessionRevPending,
                        () => {
                          void invokeSensitiveAction(() => runUpdateEmail());
                        },
                        "Update email",
                        emailPending
                      )
                    : undefined
                }
                footer={
                  isEmailManagedBySocialProvider ? (
                    <p className="text-xs text-muted-foreground">
                      Email is managed by your social provider and cannot be changed here.
                    </p>
                  ) : undefined
                }
              >
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  disabled={isVerifying || isEmailManagedBySocialProvider}
                  className={cn(
                    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40",
                    (isVerifying || isEmailManagedBySocialProvider) &&
                      "cursor-not-allowed bg-muted/30 opacity-60"
                  )}
                />
              </SettingsFieldRow>

              <SettingsFieldRow
                label="Phone number (US & Canada)"
                labelId="profile-phone-national"
                action={inlineActionButton(
                  isVerifying ||
                    isVerifyingPhone ||
                    sessionRevPending ||
                    phoneInputInvalid ||
                    phoneUnchanged,
                  () => {
                    void invokeSensitiveAction(() => runUpdatePhone());
                  },
                  "Update phone",
                  phonePending
                )}
                footer={
                  <p className="text-xs text-muted-foreground">
                    Optional. Enter{" "}
                    <span className="font-medium text-foreground">10 digits</span> only. US and
                    Canada share +1; area code and exchange cannot start with 0 or 1.
                  </p>
                }
              >
                <div className="flex items-stretch gap-2">
                  <span
                    className={cn(
                      "flex h-11 shrink-0 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm font-medium text-muted-foreground",
                      (isVerifying || isVerifyingPhone) && "opacity-60"
                    )}
                    aria-hidden
                  >
                    +1
                  </span>
                  <input
                    id="profile-phone-national"
                    type="text"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="4155552671"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        phone: sanitizeUsCanadaPhoneInput(e.target.value),
                      }))
                    }
                    disabled={isVerifying || isVerifyingPhone}
                    className={cn(
                      "h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40",
                      (isVerifying || isVerifyingPhone) &&
                        "cursor-not-allowed bg-muted/30 opacity-60"
                    )}
                  />
                </div>
              </SettingsFieldRow>
            </div>
          </Section>

          {showPasswordSection && (
            <Section title="Change Password">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:gap-4">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <FormField
                      id="profile-new-password"
                      label="New Password"
                      value={password}
                      onChange={setPassword}
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <FormField
                      id="profile-confirm-password"
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
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex shrink-0 xl:pb-0.5">
                  {inlineActionButton(
                    passwordMismatchOrEmpty ||
                      isVerifying ||
                      isVerifyingPhone ||
                      sessionRevPending,
                    () => {
                      void invokeSensitiveAction(() => runUpdatePassword());
                    },
                    "Update password",
                    passwordPending
                  )}
                </div>
              </div>
            </Section>
          )}

          {showOtpDialog && (
            <EmailVerificationForm
              email={
                isVerifyingPhone && pendingPhone
                  ? pendingPhone.phoneNumber
                  : profile.email
              }
              verificationChannel={isVerifyingPhone ? "phone" : "email"}
              onVerify={
                isVerifyingPhone && pendingPhone ? handleVerifyPhone : handleVerifyEmail
              }
              onResend={
                isVerifyingPhone && pendingPhone ? handleResendPhoneCode : handleResendCode
              }
              onCancel={() => {
                if (isVerifyingPhone && pendingPhone) {
                  void handleCancelPhoneVerification();
                } else {
                  handleCancelVerification();
                }
              }}
              isLoading={
                isVerifyingPhone ? isVerifyingPhoneLoading : isVerifyingLoading
              }
              error={error}
            />
          )}

          {(error || statusMessage) && !showOtpDialog && (
            <div
              className={cn(
                "rounded-lg border p-4 text-sm font-medium",
                error
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              )}
            >
              <p>{error || statusMessage}</p>
            </div>
          )}

          <SessionReverificationModal
            open={Boolean(verificationState?.inProgress || fallbackRevModalOpen)}
            level={verificationState?.level ?? "first_factor"}
            nonce={reverificationNonce}
            onSuccess={async () => {
              const finishFallback = fallbackRevResolveRef.current;
              if (finishFallback) {
                fallbackRevResolveRef.current = null;
                setFallbackRevModalOpen(false);
                setSessionRevPending(false);
                setStatusMessage(null);
                finishFallback(true);
                return;
              }
              const complete = reverificationHandlersRef.current?.complete;
              reverificationHandlersRef.current = null;
              setVerificationState(undefined);
              setStatusMessage(null);
              complete?.();
              await reloadClerkSessionContext();
            }}
            onDismiss={() => {
              const finishFallback = fallbackRevResolveRef.current;
              if (finishFallback) {
                fallbackRevResolveRef.current = null;
                setFallbackRevModalOpen(false);
                setSessionRevPending(false);
                setStatusMessage(null);
                finishFallback(false);
                return;
              }
              reverificationHandlersRef.current?.cancel();
              reverificationHandlersRef.current = null;
              setVerificationState(undefined);
              setStatusMessage(null);
            }}
          />

          <CancelEditsFooter onCancel={handleCancelAllLocalEdits} />

          <div className="rounded-xl border border-destructive/25 bg-card p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="min-w-0 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-destructive">
                  Deactivate account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your profile will be marked deactivated, your email will be masked in our records so
                  you can register again with the same address, and your sign-in will be removed. To
                  recover a deactivated account later, use the{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-accent underline-offset-4 hover:underline"
                  >
                    Contact
                  </Link>{" "}
                  page — self-service restore is not available yet.
                </p>
                {deactivateError ? (
                  <p className="text-sm font-medium text-destructive">{deactivateError}</p>
                ) : null}
                {!deactivateConfirmOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeactivateConfirmOpen(true);
                      setDeactivateError(null);
                    }}
                    disabled={
                      deactivatePending ||
                      isVerifying ||
                      isVerifyingPhone ||
                      sessionRevPending ||
                      !user?.id
                    }
                    className={cn(
                      "h-11 rounded-md border border-destructive bg-card px-4 text-sm font-semibold text-destructive transition-colors",
                      "hover:bg-destructive/10",
                      "disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    Deactivate account
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => void handleDeactivateAccount()}
                      disabled={deactivatePending}
                      className={cn(
                        "flex h-11 min-w-[12rem] items-center justify-center rounded-md border border-destructive bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition-colors",
                        "hover:bg-destructive/90",
                        "disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    >
                      {deactivatePending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deactivating…
                        </span>
                      ) : (
                        "Yes, deactivate my account"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeactivateConfirmOpen(false);
                        setDeactivateError(null);
                      }}
                      disabled={deactivatePending}
                      className="h-11 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
