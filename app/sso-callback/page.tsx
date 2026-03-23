"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getErrorMessageFromUnknown, navigateToResolvedUrl } from "@/lib/auth-client-utils";

const PROFILE_REDIRECT = "/profile";
const SIGN_IN_REDIRECT = "/sign-in";
const SIGN_UP_REDIRECT = "/sign-up";

/**
 * @description Finalizes a completed auth attempt and routes user to profile when no pending tasks remain.
 * @param finalize Clerk finalization callback for sign-in or sign-up resources.
 * @param router Next.js app router instance.
 * @returns Promise that resolves after finalization flow has run.
 * @throws Can throw Clerk SDK errors for failed finalization calls.
 */
async function finalizeToProfile(
  finalize: (args: {
    navigate: (args: { session?: { currentTask?: unknown }; decorateUrl: (path: string) => string }) => Promise<void>;
  }) => Promise<void>,
  router: ReturnType<typeof useRouter>,
): Promise<void> {
  await finalize({
    navigate: async ({ session, decorateUrl }) => {
      if (session?.currentTask) return;
      const url = decorateUrl(PROFILE_REDIRECT);
      await navigateToResolvedUrl(router, url);
    },
  });
}

/**
 * @description Executes Clerk SSO callback state machine and redirects user to next valid route.
 * @param clerk Clerk root instance used for active-session handoff.
 * @param signIn Clerk sign-in resource from `useSignIn`.
 * @param signUp Clerk sign-up resource from `useSignUp`.
 * @param router Next.js app router instance for local redirects.
 * @returns Promise that resolves when one terminal navigation branch is reached.
 * @throws Can throw Clerk SDK errors for transfer/finalization/session activation operations.
 */
async function runSsoCallbackFlow(
  clerk: ReturnType<typeof useClerk>,
  signIn: NonNullable<ReturnType<typeof useSignIn>["signIn"]>,
  signUp: ReturnType<typeof useSignUp>["signUp"],
  router: ReturnType<typeof useRouter>,
): Promise<void> {
  if (signIn.status === "complete") {
    await finalizeToProfile(signIn.finalize, router);
    return;
  }

  if (signUp?.isTransferable) {
    await signIn.create({ transfer: true });
    if (signIn.status === "complete") {
      await finalizeToProfile(signIn.finalize, router);
      return;
    }
    router.push(SIGN_IN_REDIRECT);
    return;
  }

  if (
    signIn.status === "needs_first_factor" &&
    !signIn.supportedFirstFactors?.every((factor) => factor.strategy === "enterprise_sso")
  ) {
    router.push(SIGN_IN_REDIRECT);
    return;
  }

  if (signIn.isTransferable && signUp) {
    await signUp.create({ transfer: true });
    if (signUp.status === "complete") {
      await finalizeToProfile(signUp.finalize, router);
      return;
    }
    router.push(SIGN_UP_REDIRECT);
    return;
  }

  if (signUp?.status === "complete") {
    await finalizeToProfile(signUp.finalize, router);
    return;
  }

  if (signIn.status === "needs_second_factor" || signIn.status === "needs_new_password") {
    router.push(SIGN_IN_REDIRECT);
    return;
  }

  const existingSession = signIn.existingSession ?? signUp?.existingSession;
  if (existingSession?.sessionId) {
    await clerk.setActive({
      session: existingSession.sessionId,
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) return;
        const url = decorateUrl(PROFILE_REDIRECT);
        await navigateToResolvedUrl(router, url);
      },
    });
    return;
  }

  router.push(SIGN_IN_REDIRECT);
}

/**
 * @description Renders Clerk OAuth callback page and completes transfer/finalization flow after redirect.
 * @param None
 * @returns JSX loading screen while callback processing runs.
 * @throws Never throws in render path; callback errors are caught and redirected.
 */
export default function SSOCallbackPage() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    /**
     * @description Wraps async callback execution inside useEffect to avoid unhandled promise rejections.
     * @param None
     * @returns Promise that resolves after callback flow exits or redirects.
     * @throws Never throws; errors are caught and fallback redirect is applied.
     */
    const handleCallback = async (): Promise<void> => {
      if (!clerk.loaded || hasRun.current || !signIn) {
        return;
      }

      hasRun.current = true;

      try {
        await runSsoCallbackFlow(clerk, signIn, signUp, router);
      } catch (error: unknown) {
        console.error(
          "[sso-callback] Failed to complete callback flow:",
          getErrorMessageFromUnknown(error),
        );
        router.push(SIGN_IN_REDIRECT);
      }
    };

    void handleCallback();
  }, [clerk, signIn, signUp, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Completing sign in…</p>
      <div id="clerk-captcha" />
    </div>
  );
}
