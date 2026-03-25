import type { PhoneNumberResource } from "@clerk/nextjs/types";
import { getErrorMessageFromUnknown } from "@/lib/auth-client-utils";

/**
 * Clerk types expose `PhoneNumberResource.prepareVerification()` as zero-arg only, but the
 * Frontend API accepts strategy + optional SMS/WhatsApp channel. Calling it without a
 * channel can produce strategy errors when the instance expects an explicit channel.
 */
type PreparePhoneVerificationFn = (params?: {
  strategy: "phone_code";
  channel?: "sms" | "whatsapp";
}) => Promise<PhoneNumberResource>;

const PHONE_STRATEGY_SETUP_HINT =
  " In Clerk Dashboard: User & authentication → Phone — enable phone/SMS (or WhatsApp) so phone_code verification is allowed.";

function shouldTryNextAttempt(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("channel") ||
    m.includes("sms") ||
    m.includes("whatsapp") ||
    m.includes("delivery")
  );
}

/**
 * Sends the phone OTP using Clerk-supported strategy/channel combinations, falling back
 * to the SDK default when needed.
 *
 * @param phoneResource Clerk phone number resource (usually right after `createPhoneNumber`).
 * @returns Updated phone resource after the verification hand-off.
 * @throws Error with Clerk message and dashboard hint when `phone_code` is not allowed for the app.
 */
export async function preparePhoneNumberVerification(
  phoneResource: PhoneNumberResource,
): Promise<PhoneNumberResource> {
  const prepare = phoneResource.prepareVerification as unknown as PreparePhoneVerificationFn;

  const attempts: Array<{ strategy: "phone_code"; channel?: "sms" | "whatsapp" } | undefined> = [
    { strategy: "phone_code", channel: "sms" },
    { strategy: "phone_code", channel: "whatsapp" },
    { strategy: "phone_code" },
    undefined,
  ];

  let lastError: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const params = attempts[i];
    try {
      if (params === undefined) {
        return await phoneResource.prepareVerification();
      }
      return await prepare(params);
    } catch (error: unknown) {
      lastError = error;
      const msg = getErrorMessageFromUnknown(error);
      const lower = msg.toLowerCase();
      const strategyBlocked =
        lower.includes("phone_code") && lower.includes("allowed values");

      if (strategyBlocked) {
        throw new Error(`${msg}${PHONE_STRATEGY_SETUP_HINT}`);
      }

      const isLast = i === attempts.length - 1;
      if (isLast) {
        break;
      }
      if (!shouldTryNextAttempt(msg)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(getErrorMessageFromUnknown(lastError));
}
