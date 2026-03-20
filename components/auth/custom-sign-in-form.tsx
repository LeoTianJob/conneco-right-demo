"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialAuthButtons, type OAuthStrategy } from "./social-auth-buttons";

type LoginType = "personal" | "institution";

const SSO_CALLBACK_URL = "/sso-callback";

export function CustomSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/profile";

  const { signIn, errors, fetchStatus } = useSignIn();

  const [loginType, setLoginType] = useState<LoginType>("personal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isFetching = fetchStatus === "fetching";

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!signIn) return;

    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });

    if (error) {
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            return;
          }
          const url = decorateUrl(redirectUrl);
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
      return;
    }

    if (signIn.status === "needs_second_factor") {
      router.push("/sign-in?needs_mfa=1");
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === "email_code"
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        router.push("/sign-in?verify_code=1");
      }
      return;
    }
  };

  const handleSignInWith = async (strategy: OAuthStrategy) => {
    if (!signIn) return;
    const { error } = await signIn.sso({
      strategy,
      redirectCallbackUrl: SSO_CALLBACK_URL,
      redirectUrl,
    });
    if (error) {
      return;
    }
  };

  const showMfaMessage = searchParams.get("needs_mfa") === "1";
  const showVerifyCode = searchParams.get("verify_code") === "1";

  if (showMfaMessage || showVerifyCode) {
    return (
      <div className="mt-6 w-full space-y-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          {showMfaMessage
            ? "Additional verification is required. Please complete the step sent to your email."
            : "A verification code was sent to your email. Enter it to continue."}
        </p>
        <button
          type="button"
          onClick={() => signIn?.reset()}
          className="text-sm font-medium text-accent hover:underline"
        >
          Start over
        </button>
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
            onClick={() => setLoginType(t)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              loginType === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "personal" ? "Personal" : "Institution (School)"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Clerk errors */}
        {errors && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.fields?.identifier?.message ??
              errors.fields?.password?.message ??
              (errors as { message?: string }).message ??
              "Something went wrong. Please try again."}
          </div>
        )}

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={
              loginType === "institution" ? "School email address" : "Email address"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
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

        <div className="flex items-center justify-end">
          <Link
            href="#"
            className="text-xs font-medium text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Clerk's CAPTCHA widget */}
        <div id="clerk-captcha" />

        <button
          type="submit"
          disabled={isFetching}
          className="h-11 w-full rounded-md border border-primary bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isFetching ? "Signing in…" : "Sign In"}
        </button>
      </form>
      {/* Social login and sign up — only for Personal */}
      {loginType === "personal" && (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <SocialAuthButtons onSignInWith={handleSignInWith} disabled={isFetching} />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/sign-up" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
