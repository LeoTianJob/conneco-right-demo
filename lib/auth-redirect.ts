/**
 * @description Resolves a safe in-app path for post-auth redirects. Rejects protocol-relative and external URLs.
 * @param raw Value from `redirect_url` search param (or undefined).
 * @param fallback Path used when `raw` is missing or unsafe (must start with `/`).
 * @returns A path suitable for `router.push` or Clerk `redirectUrl`.
 * @throws Never throws.
 */
export function resolveAuthRedirectUrl(
  raw: string | undefined,
  fallback: string,
): string {
  if (!raw || typeof raw !== "string") {
    return fallback;
  }
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("\\") || trimmed.includes("@")) {
    return fallback;
  }
  return trimmed;
}
