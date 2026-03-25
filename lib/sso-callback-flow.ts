import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { navigateToResolvedUrl } from "@/lib/auth-client-utils";

type FinalizeNavigateArgs = {
  session?: { currentTask?: unknown };
  decorateUrl: (path: string) => string;
};

type FinalizeFn = (args: {
  navigate: (args: FinalizeNavigateArgs) => Promise<void>;
}) => Promise<unknown>;

const PROFILE_REDIRECT = "/profile";

export const SSO_SIGN_IN_REDIRECT = "/sign-in";
export const SSO_SIGN_UP_REDIRECT = "/sign-up";

export interface ClerkForSsoCallback {
  setActive: (args: {
    session: string;
    navigate: (args: FinalizeNavigateArgs) => Promise<void>;
  }) => Promise<void>;
}

export interface SignInForSsoCallback {
  status: string;
  finalize: FinalizeFn;
  create: (args: { transfer: boolean }) => Promise<unknown>;
  isTransferable: boolean;
  supportedFirstFactors?: Array<{ strategy: string }>;
  existingSession?: { sessionId?: string };
}

export interface SignUpForSsoCallback {
  status: string;
  finalize: FinalizeFn;
  create: (args: { transfer: boolean }) => Promise<unknown>;
  isTransferable: boolean;
  existingSession?: { sessionId?: string };
}

/**
 * @description Finalizes a completed auth attempt and routes user to profile when no pending tasks remain.
 */
export async function finalizeToProfile(
  finalize: FinalizeFn,
  router: AppRouterInstance,
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
 */
export async function runSsoCallbackFlow(
  clerk: ClerkForSsoCallback,
  signIn: SignInForSsoCallback,
  signUp: SignUpForSsoCallback | null | undefined,
  router: AppRouterInstance,
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
    router.push(SSO_SIGN_IN_REDIRECT);
    return;
  }

  if (
    signIn.status === "needs_first_factor" &&
    !signIn.supportedFirstFactors?.every((factor) => factor.strategy === "enterprise_sso")
  ) {
    router.push(SSO_SIGN_IN_REDIRECT);
    return;
  }

  if (signIn.isTransferable && signUp) {
    await signUp.create({ transfer: true });
    if (signUp.status === "complete") {
      await finalizeToProfile(signUp.finalize, router);
      return;
    }
    router.push(SSO_SIGN_UP_REDIRECT);
    return;
  }

  if (signUp?.status === "complete") {
    await finalizeToProfile(signUp.finalize, router);
    return;
  }

  if (signIn.status === "needs_second_factor" || signIn.status === "needs_new_password") {
    router.push(SSO_SIGN_IN_REDIRECT);
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

  router.push(SSO_SIGN_IN_REDIRECT);
}
