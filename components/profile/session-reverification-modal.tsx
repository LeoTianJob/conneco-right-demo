"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
} from "react";
import { useSession } from "@clerk/nextjs";
import { Loader2, ShieldCheck, X, AlertCircle } from "lucide-react";
import { getErrorMessageFromUnknown } from "@/lib/auth-client-utils";
import type {
  SessionVerificationLevel,
  SessionVerificationResource,
} from "@clerk/nextjs/types";

interface SessionReverificationModalProps {
  /** When true, starts Clerk session verification for the given level. */
  open: boolean;
  /** Required verification depth from `useReverification` (e.g. first_factor). */
  level: SessionVerificationLevel | undefined;
  /** Bumps when a new reverification is requested so the flow restarts cleanly. */
  nonce: number;
  /** Called after session verification reaches `complete`; should invoke Clerk `complete()` from `useReverification`. May be async (e.g. reload session before retry). */
  onSuccess: () => void | Promise<void>;
  /** User dismissed the modal; should invoke Clerk `cancel()`. */
  onDismiss: () => void;
}

type FirstFactor = NonNullable<
  SessionVerificationResource["supportedFirstFactors"]
>[number];
type SecondFactor = NonNullable<
  SessionVerificationResource["supportedSecondFactors"]
>[number];

function pickFirstFactor(factors: FirstFactor[] | null): FirstFactor | null {
  if (!factors?.length) return null;
  const priority = [
    "email_code",
    "phone_code",
    "password",
    "passkey",
  ] as const;
  for (const s of priority) {
    const found = factors.find((f) => f.strategy === s);
    if (found) return found;
  }
  return factors[0];
}

function pickSecondFactor(
  factors: SecondFactor[] | null,
): SecondFactor | null {
  if (!factors?.length) return null;
  const priority = ["phone_code", "totp", "backup_code"] as const;
  for (const s of priority) {
    const found = factors.find((f) => f.strategy === s);
    if (found) return found;
  }
  return factors[0];
}

type Panel =
  | { kind: "loading" }
  | { kind: "email_code"; mask: string }
  | { kind: "phone_code"; mask: string }
  | { kind: "password" }
  | { kind: "second_phone"; mask: string }
  | { kind: "totp" }
  | { kind: "backup" }
  | { kind: "passkey" }
  | { kind: "unsupported"; message: string };

/**
 * @description Modal UI for Clerk session reverification (`useReverification` custom flow).
 * Runs `session.startVerification` → prepare/attempt first (and if needed second) factors, then calls `onSuccess`
 * so the wrapped action can retry. Without this flow, calling `complete()` alone surfaces errors like
 * “You need to provide additional verification to perform this operation”.
 */
export function SessionReverificationModal({
  open,
  level,
  nonce,
  onSuccess,
  onDismiss,
}: SessionReverificationModalProps): JSX.Element | null {
  const { session, isLoaded } = useSession();
  /** Always call the latest `session` inside async flows; avoid listing `session` in effect deps (reload swaps the reference and retriggers `startVerification` in a loop while the modal stays open). */
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const sessionId = session?.id;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const emailFactorIdRef = useRef<string | null>(null);
  const phoneFactorIdRef = useRef<string | null>(null);
  const phoneChannelRef = useRef<"sms" | "whatsapp">("sms");
  const secondPhoneIdRef = useRef<string | null>(null);

  const [panel, setPanel] = useState<Panel>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setCode("");
    setPassword("");
    setLocalError(null);
    setSubmitting(false);
    setPanel({ kind: "loading" });
    emailFactorIdRef.current = null;
    phoneFactorIdRef.current = null;
    secondPhoneIdRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }
    if (!isLoaded) {
      setPanel({ kind: "loading" });
      return;
    }

    if (!sessionRef.current) {
      setPanel({
        kind: "unsupported",
        message: "No active session. Please sign in again.",
      });
      return;
    }

    let cancelled = false;
    resetForm();
    setPanel({ kind: "loading" });

    const run = async (): Promise<void> => {
      const session = sessionRef.current;
      if (!session) {
        if (!cancelled) {
          setPanel({
            kind: "unsupported",
            message: "No active session. Please sign in again.",
          });
        }
        return;
      }
      try {
        const verificationLevel = level ?? "first_factor";
        const ver = await session.startVerification({ level: verificationLevel });
        if (cancelled) return;

        if (ver.status === "complete") {
          await Promise.resolve(onSuccessRef.current());
          return;
        }

        if (ver.status === "needs_second_factor") {
          const sf = pickSecondFactor(ver.supportedSecondFactors);
          if (!sf) {
            setPanel({
              kind: "unsupported",
              message:
                "A second verification step is required but no supported method was returned.",
            });
            return;
          }
          if (sf.strategy === "phone_code") {
            secondPhoneIdRef.current = sf.phoneNumberId ?? null;
            await session.prepareSecondFactorVerification({
              strategy: "phone_code",
              phoneNumberId: sf.phoneNumberId,
            });
            if (cancelled) return;
            setPanel({ kind: "second_phone", mask: sf.safeIdentifier });
            return;
          }
          if (sf.strategy === "totp") {
            setPanel({ kind: "totp" });
            return;
          }
          if (sf.strategy === "backup_code") {
            setPanel({ kind: "backup" });
            return;
          }
          setPanel({
            kind: "unsupported",
            message: `Second factor “${String(sf.strategy)}” is not supported in this dialog yet.`,
          });
          return;
        }

        if (ver.status === "needs_first_factor") {
          const factor = pickFirstFactor(ver.supportedFirstFactors);
          if (!factor) {
            setPanel({
              kind: "unsupported",
              message: "No supported verification methods were returned for your account.",
            });
            return;
          }

          if (factor.strategy === "email_code") {
            emailFactorIdRef.current = factor.emailAddressId;
            await session.prepareFirstFactorVerification({
              strategy: "email_code",
              emailAddressId: factor.emailAddressId,
            });
            if (cancelled) return;
            setPanel({ kind: "email_code", mask: factor.safeIdentifier });
            return;
          }

          if (factor.strategy === "phone_code") {
            phoneFactorIdRef.current = factor.phoneNumberId;
            phoneChannelRef.current = factor.channel ?? "sms";
            await session.prepareFirstFactorVerification({
              strategy: "phone_code",
              phoneNumberId: factor.phoneNumberId,
              channel: phoneChannelRef.current,
            });
            if (cancelled) return;
            setPanel({ kind: "phone_code", mask: factor.safeIdentifier });
            return;
          }

          if (factor.strategy === "password") {
            setPanel({ kind: "password" });
            return;
          }

          if (factor.strategy === "passkey") {
            setPanel({ kind: "passkey" });
            return;
          }

          setPanel({
            kind: "unsupported",
            message: `Verification strategy “${String(factor.strategy)}” is not supported in this dialog yet.`,
          });
          return;
        }

        setPanel({
          kind: "unsupported",
          message: `Unexpected verification status: ${ver.status}.`,
        });
      } catch (e: unknown) {
        if (!cancelled) {
          setLocalError(getErrorMessageFromUnknown(e));
          setPanel({
            kind: "unsupported",
            message: getErrorMessageFromUnknown(e),
          });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [open, isLoaded, sessionId, level, nonce, resetForm]);

  const finishIfComplete = useCallback(
    async (ver: SessionVerificationResource): Promise<boolean> => {
      if (ver.status === "complete") {
        await Promise.resolve(onSuccessRef.current());
        return true;
      }
      return false;
    },
    [],
  );

  const handleSecondFactorPath = useCallback(
    async (ver: SessionVerificationResource): Promise<void> => {
      if (!session) return;
      if (await finishIfComplete(ver)) return;

      if (ver.status !== "needs_second_factor") {
        setLocalError("Additional verification step could not be started.");
        return;
      }

      const sf = pickSecondFactor(ver.supportedSecondFactors);
      if (!sf) {
        setPanel({
          kind: "unsupported",
          message: "A second verification step is required but no supported method was returned.",
        });
        return;
      }

      if (sf.strategy === "phone_code") {
        secondPhoneIdRef.current = sf.phoneNumberId ?? null;
        await session.prepareSecondFactorVerification({
          strategy: "phone_code",
          phoneNumberId: sf.phoneNumberId,
        });
        setPanel({ kind: "second_phone", mask: sf.safeIdentifier });
        return;
      }

      if (sf.strategy === "totp") {
        setPanel({ kind: "totp" });
        return;
      }

      if (sf.strategy === "backup_code") {
        setPanel({ kind: "backup" });
        return;
      }

      setPanel({
        kind: "unsupported",
        message: `Second factor “${String(sf.strategy)}” is not supported in this dialog yet.`,
      });
    },
    [session, finishIfComplete],
  );

  const handleSubmitCode: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!session) return;
    const trimmed = code.trim();
    if (!trimmed) {
      setLocalError("Enter the verification code.");
      return;
    }

    setSubmitting(true);
    setLocalError(null);

    try {
      if (panel.kind === "email_code") {
        const ver = await session.attemptFirstFactorVerification({
          strategy: "email_code",
          code: trimmed,
        });
        if (await finishIfComplete(ver)) return;
        await handleSecondFactorPath(ver);
        return;
      }

      if (panel.kind === "phone_code") {
        const ver = await session.attemptFirstFactorVerification({
          strategy: "phone_code",
          code: trimmed,
        });
        if (await finishIfComplete(ver)) return;
        await handleSecondFactorPath(ver);
        return;
      }

      if (panel.kind === "second_phone") {
        const ver = await session.attemptSecondFactorVerification({
          strategy: "phone_code",
          code: trimmed,
        });
        if (await finishIfComplete(ver)) return;
        setLocalError("Verification incomplete after SMS code.");
        return;
      }

      if (panel.kind === "totp") {
        const ver = await session.attemptSecondFactorVerification({
          strategy: "totp",
          code: trimmed,
        });
        if (await finishIfComplete(ver)) return;
        setLocalError("Verification incomplete after authenticator code.");
        return;
      }

      if (panel.kind === "backup") {
        const ver = await session.attemptSecondFactorVerification({
          strategy: "backup_code",
          code: trimmed,
        });
        if (await finishIfComplete(ver)) return;
        setLocalError("Verification incomplete after backup code.");
        return;
      }
    } catch (err: unknown) {
      setLocalError(getErrorMessageFromUnknown(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPassword: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!session) return;
    if (!password) {
      setLocalError("Enter your password.");
      return;
    }
    setSubmitting(true);
    setLocalError(null);
    try {
      const ver = await session.attemptFirstFactorVerification({
        strategy: "password",
        password,
      });
      if (await finishIfComplete(ver)) return;
      await handleSecondFactorPath(ver);
    } catch (err: unknown) {
      setLocalError(getErrorMessageFromUnknown(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasskey = async (): Promise<void> => {
    if (!session) return;
    setSubmitting(true);
    setLocalError(null);
    try {
      const ver = await session.verifyWithPasskey();
      if (await finishIfComplete(ver)) return;
      await handleSecondFactorPath(ver);
    } catch (err: unknown) {
      setLocalError(getErrorMessageFromUnknown(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    if (!session) return;
    setLocalError(null);
    try {
      if (panel.kind === "email_code" && emailFactorIdRef.current) {
        await session.prepareFirstFactorVerification({
          strategy: "email_code",
          emailAddressId: emailFactorIdRef.current,
        });
        return;
      }
      if (panel.kind === "phone_code" && phoneFactorIdRef.current) {
        await session.prepareFirstFactorVerification({
          strategy: "phone_code",
          phoneNumberId: phoneFactorIdRef.current,
          channel: phoneChannelRef.current,
        });
        return;
      }
      if (panel.kind === "second_phone" && secondPhoneIdRef.current) {
        await session.prepareSecondFactorVerification({
          strategy: "phone_code",
          phoneNumberId: secondPhoneIdRef.current,
        });
      }
    } catch (err: unknown) {
      setLocalError(getErrorMessageFromUnknown(err));
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onDismiss}
        aria-hidden
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-accent/20 bg-card p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <ShieldCheck className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Confirm it&apos;s you
            </h3>
            <p className="text-sm text-muted-foreground">
              Extra verification is required before saving sensitive profile changes.
            </p>
          </div>
        </div>

        {panel.kind === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Starting verification…</p>
          </div>
        )}

        {(panel.kind === "email_code" ||
          panel.kind === "phone_code" ||
          panel.kind === "second_phone") && (
          <form onSubmit={handleSubmitCode} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {panel.kind === "email_code"
                ? "Enter the code we emailed to "
                : "Enter the SMS code sent to "}
              <span className="font-medium text-foreground">{panel.mask}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              disabled={submitting}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-center text-lg font-semibold tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            {localError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{localError}</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={submitting || code.trim().length < 6}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & continue"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleResend();
                }}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {panel.kind === "password" && (
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your account password to continue.
            </p>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={submitting}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            {localError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{localError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || !password}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify & continue"
              )}
            </button>
          </form>
        )}

        {panel.kind === "totp" && (
          <form onSubmit={handleSubmitCode} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the code from your authenticator app.
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              disabled={submitting}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-center text-lg font-semibold tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            {localError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{localError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || code.trim().length < 6}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify & continue"
              )}
            </button>
          </form>
        )}

        {panel.kind === "backup" && (
          <form onSubmit={handleSubmitCode} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter one of your backup codes.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Backup code"
              disabled={submitting}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            {localError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{localError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify & continue"
              )}
            </button>
          </form>
        )}

        {panel.kind === "passkey" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Continue with your passkey to verify this session.
            </p>
            {localError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{localError}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                void handlePasskey();
              }}
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Use passkey"
              )}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}

        {panel.kind === "unsupported" && (
          <div className="space-y-4">
            <p className="text-sm text-destructive">{panel.message}</p>
            <button
              type="button"
              onClick={onDismiss}
              className="h-11 w-full rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Close
            </button>
          </div>
        )}

        {panel.kind !== "loading" &&
          panel.kind !== "unsupported" &&
          panel.kind !== "passkey" && (
            <button
              type="button"
              onClick={onDismiss}
              className="mt-4 w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          )}
      </div>
    </div>
  );
}
