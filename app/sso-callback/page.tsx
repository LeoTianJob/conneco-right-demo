"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getErrorMessageFromUnknown } from "@/lib/auth-client-utils";
import {
  runSsoCallbackFlow,
  SSO_SIGN_IN_REDIRECT,
} from "@/lib/sso-callback-flow";

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
        router.push(SSO_SIGN_IN_REDIRECT);
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
