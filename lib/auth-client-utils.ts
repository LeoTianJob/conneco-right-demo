import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

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
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }

    const maybeErrors = (error as { errors?: Array<{ message?: unknown }> }).errors;
    if (Array.isArray(maybeErrors)) {
      const firstMessage = maybeErrors[0]?.message;
      if (typeof firstMessage === "string" && firstMessage.trim().length > 0) {
        return firstMessage;
      }
    }
  }

  return "Something went wrong. Please try again.";
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
