"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SSOCallbackPage() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    (async () => {
      if (!clerk.loaded || hasRun.current || !signIn) {
        return;
      }
      hasRun.current = true;

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: async ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });
        return;
      }

      if (signUp?.isTransferable) {
        await signIn.create({ transfer: true });
        const status = signIn.status as string;
        if (status === "complete") {
          await signIn.finalize({
            navigate: async ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              const url = decorateUrl("/");
              if (url.startsWith("http")) window.location.href = url;
              else router.push(url);
            },
          });
          return;
        }
        router.push("/sign-in");
        return;
      }

      if (
        signIn.status === "needs_first_factor" &&
        !signIn.supportedFirstFactors?.every((f) => f.strategy === "enterprise_sso")
      ) {
        router.push("/sign-in");
        return;
      }

      if (signIn.isTransferable && signUp) {
        await signUp.create({ transfer: true });
        if (signUp.status === "complete") {
          await signUp.finalize({
            navigate: async ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              const url = decorateUrl("/");
              if (url.startsWith("http")) window.location.href = url;
              else router.push(url);
            },
          });
          return;
        }
        router.push("/sign-up");
        return;
      }

      if (signUp?.status === "complete") {
        await signUp.finalize({
          navigate: async ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const url = decorateUrl("/");
            if (url.startsWith("http")) window.location.href = url;
            else router.push(url);
          },
        });
        return;
      }

      if (signIn.status === "needs_second_factor" || signIn.status === "needs_new_password") {
        router.push("/sign-in");
        return;
      }

      const existingSession = signIn.existingSession ?? signUp?.existingSession;
      if (existingSession?.sessionId) {
        await clerk.setActive({
          session: existingSession.sessionId,
          navigate: async ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const url = decorateUrl("/");
            if (url.startsWith("http")) window.location.href = url;
            else router.push(url);
          },
        });
        return;
      }

      router.push("/sign-in");
    })();
  }, [clerk, signIn, signUp, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Completing sign in…</p>
      <div id="clerk-captcha" />
    </div>
  );
}
