import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

/**
 * @description Minimal shape for a browser event that supports preventDefault.
 * @param None
 * @returns A structural event type used by form handlers.
 * @throws Never throws.
 */
export interface PreventDefaultEvent {
  preventDefault: () => void;
}

/**
 * @description Extracts a user-facing message from unknown Clerk-like errors.
 * @param error Unknown error payload returned by SDKs or runtime failures.
 * @returns A safe message string for UI surfaces.
 * @throws Never throws. Fallback text is returned on unknown structures.
 */
export function getErrorMessageFromUnknown(error: unknown): string {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    // ClerkAPIResponseError often sets a generic top-level `message`; prefer API `long_message` first.
    if (isClerkAPIResponseError(error)) {
      for (const e of error.errors) {
        if (typeof e.longMessage === "string" && e.longMessage.trim().length > 0) {
          return e.longMessage;
        }
      }
      for (const e of error.errors) {
        if (typeof e.message === "string" && e.message.trim().length > 0) {
          return e.message;
        }
      }
    }

    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }

    const maybeErrors = (error as {
      errors?: Array<{ message?: unknown; longMessage?: unknown }>;
    }).errors;
    if (Array.isArray(maybeErrors)) {
      const first = maybeErrors[0];
      const longMessage = first?.longMessage;
      if (typeof longMessage === "string" && longMessage.trim().length > 0) {
        return longMessage;
      }
      const firstMessage = first?.message;
      if (typeof firstMessage === "string" && firstMessage.trim().length > 0) {
        return firstMessage;
      }
    }
  }

  return "Something went wrong. Please try again.";
}

/**
 * @description True when Clerk indicates the session must be reverified before the operation. `useReverification` only
 * reacts to code `session_reverification_required`; FAPI often returns the same situation with a different code but the
 * “additional verification” message — this helper covers both for a client fallback modal + retry.
 */
function haystackLooksLikeRateLimit(haystack: string): boolean {
  return (
    haystack.includes("too many requests") ||
    haystack.includes("too_many_requests") ||
    haystack.includes("rate limit") ||
    haystack.includes("quota")
  );
}

/** Substrings Clerk FAPI may use when step-up is required but code is not `session_reverification_required`. */
function haystackSuggestsSessionReverification(haystack: string): boolean {
  const hints = [
    "reverification",
    "session reverification",
    "additional verification",
    "verify your identity",
    "confirm your identity",
    "step-up",
    "step up",
    "sensitive action",
    "recently verified",
    "within the past 10",
    "within the last 10",
    "credentials within",
    "must verify",
    "need to verify",
    "session verification",
    "factor verification",
  ];
  return hints.some((h) => haystack.includes(h));
}

function clerkApiErrorsSuggestReverification(error: {
  errors: Array<{ code?: string | undefined }>;
}): boolean {
  return error.errors.some((e) => {
    const code = String(e.code ?? "").toLowerCase();
    return (
      code === "session_reverification_required" ||
      code.includes("reverification") ||
      code.includes("session_verification") ||
      code === "verification_required"
    );
  });
}

export function clerkErrorIndicatesSessionReverification(error: unknown): boolean {
  const fromMessage = getErrorMessageFromUnknown(error).toLowerCase();
  if (
    fromMessage.includes("too many requests") ||
    fromMessage.includes("rate limit") ||
    fromMessage.includes("quota")
  ) {
    return false;
  }
  if (haystackSuggestsSessionReverification(fromMessage)) {
    return true;
  }

  if (!isClerkAPIResponseError(error)) {
    return false;
  }

  const haystack = [
    error.message,
    String(error.status ?? ""),
    ...error.errors.map((e) =>
      [e.code, e.message, e.longMessage].filter(Boolean).join(" "),
    ),
  ]
    .join(" ")
    .toLowerCase();

  if (haystackLooksLikeRateLimit(haystack)) {
    return false;
  }

  if (clerkApiErrorsSuggestReverification(error)) {
    return true;
  }

  if (haystackSuggestsSessionReverification(haystack)) {
    return true;
  }

  if (haystack.includes("additional verification") || haystack.includes("session reverification")) {
    return true;
  }

  // Some FAPI versions respond with 403 + `forbidden` and little copy; treat as step-up for User `/me` mutations.
  if (
    error.status === 403 &&
    error.errors.length > 0 &&
    error.errors.every((e) => String(e.code ?? "").toLowerCase() === "forbidden")
  ) {
    return true;
  }

  return false;
}

/**
 * @description Navigates to a resolved URL using browser redirect for absolute URLs and Next Router for relative URLs.
 * @param router Next.js app router instance for client-side navigation.
 * @param url Resolved destination URL from Clerk decorators.
 * @returns Promise that resolves when navigation side effect is triggered.
 * @throws Never throws by design; navigation APIs are invoked best-effort.
 */
export async function navigateToResolvedUrl(
  router: AppRouterInstance,
  url: string,
): Promise<void> {
  if (url.startsWith("http")) {
    window.location.href = url;
    return;
  }

  router.push(url);
}
