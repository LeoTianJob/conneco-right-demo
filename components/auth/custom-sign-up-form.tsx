"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialAuthButtons, type OAuthStrategy } from "./social-auth-buttons";

type SignUpType = "personal" | "institution";

const SSO_CALLBACK_URL = "/sso-callback";

function getErrorMessage(
  errors: ReturnType<typeof useSignUp>["errors"]
): string | undefined {
  if (!errors) return undefined;
  const err = errors as unknown as {
    fields?: Record<string, { message?: string }>;
    message?: string;
  };
  return (
    err.fields?.email_address?.message ??
    err.fields?.password?.message ??
    err.message ??
    "Something went wrong. Please try again."
  );
}

export function CustomSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/profile";

  const { signUp, errors, fetchStatus } = useSignUp();

  const [signUpType, setSignUpType] = useState<SignUpType>("personal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");

  const isFetching = fetchStatus === "fetching";
  const errorMessage = getErrorMessage(errors);

  const handleSubmitForm = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!signUp) return;
    if (password !== confirmPassword) return;

    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });

    if (error) return;

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: async () => {
          if (redirectUrl.startsWith("http")) {
            window.location.href = redirectUrl;
          } else {
            router.push(redirectUrl);
          }
        },
      });
      return;
    }

    const unverified = signUp.unverifiedFields as string[] | undefined;
    const needsEmailVerification = unverified?.includes("email_address");
    if (needsEmailVerification) {
      const { error: verifyError } = await signUp.verifications.sendEmailCode();
      if (!verifyError) setStep("verify");
    }
  };

  const handleSubmitVerification = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!signUp || !verificationCode.trim()) return;

    const { error } = await signUp.verifications.verifyEmailCode({
      code: verificationCode.trim(),
    });

    if (error) return;

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: async () => {
          if (redirectUrl.startsWith("http")) {
            window.location.href = redirectUrl;
          } else {
            router.push(redirectUrl);
          }
        },
      });
    }
  };

  const handleSignUpWith = async (strategy: OAuthStrategy) => {
    if (!signUp) return;
    await signUp.sso({
      strategy,
      redirectCallbackUrl: SSO_CALLBACK_URL,
      redirectUrl,
    });
  };

  const inputBase =
    "h-11 w-full rounded-md border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring";

  if (step === "verify") {
    return (
      <div className="mt-6 w-full">
        <p className="text-sm text-muted-foreground">
          We sent a verification code to <strong className="text-foreground">{email}</strong>. Enter it below.
        </p>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmitVerification}>
          {errorMessage && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
            required
            className={cn(inputBase, "pl-4")}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="h-11 flex-1 rounded-md border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isFetching}
              className="h-11 flex-1 rounded-md border border-primary bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isFetching ? "Verifying…" : "Verify"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full">
      {/* Tabs */}
      <div className="flex rounded-lg border border-border bg-muted p-1">
        {(["personal", "institution"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSignUpType(t)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              signUpType === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "personal" ? "Personal" : "Institution (School)"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmitForm}>
        {errorMessage && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="firstName"
              autoComplete="given-name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputBase}
            />
          </div>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="lastName"
              autoComplete="family-name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={
              signUpType === "institution" ? "School email address" : "Email address"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputBase}
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={cn(inputBase, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={inputBase}
          />
        </div>

        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-destructive">Passwords do not match.</p>
        )}

        {/* Clerk's CAPTCHA widget */}
        <div id="clerk-captcha" />
        
        <button
          type="submit"
          disabled={isFetching || (!!password && !!confirmPassword && password !== confirmPassword)}
          className="h-11 w-full rounded-md border border-primary bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isFetching ? "Creating account…" : "Create account"}
        </button>
      </form>

      {signUpType === "personal" && (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <SocialAuthButtons onSignUpWith={handleSignUpWith} disabled={isFetching} />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {"Already have an account? "}
            <Link href="/sign-in" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
