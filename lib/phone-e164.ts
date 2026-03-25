/**
 * US & Canada (NANP, country code +1) phone helpers for Clerk E.164.
 *
 * National format is 10 digits: NXX-NXX-XXXX where the first digit of the area code
 * and of the exchange must be 2–9 (not 0 or 1).
 */

const NANP_NATIONAL_TEN = /^[2-9]\d{2}[2-9]\d{6}$/;

function isValidNanpNationalTen(digits: string): boolean {
  return digits.length === 10 && NANP_NATIONAL_TEN.test(digits);
}

/**
 * Strips non-digits, optional leading country digit `1`, caps at 10 national digits.
 * Use in controlled inputs so users can only contribute numeric characters.
 *
 * @param raw Input while typing or pasting.
 * @returns At most 10 digits (national number only, no +1 in the field).
 */
export function sanitizeUsCanadaPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) {
    return "";
  }
  if (digits.length >= 11 && digits.startsWith("1")) {
    return digits.slice(1, 11);
  }
  return digits.slice(0, 10);
}

/**
 * Builds E.164 `+1`… for Clerk when the value is exactly 10 valid NANP digits (as string).
 *
 * @param raw Ten national digits, or 11 digits starting with 1, or `+1`… with valid NANP.
 * @returns `+1` + 10 digits or null if empty/invalid.
 */
export function toUsCanadaE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  let digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  if (digits.length !== 10 || !isValidNanpNationalTen(digits)) {
    return null;
  }
  return `+1${digits}`;
}

/**
 * @param raw Stored Clerk value or form digits.
 * @returns Canonical `+1`… for equality checks, or "" if empty/invalid for this region.
 */
export function phoneComparable(raw: string | undefined | null): string {
  if (!raw?.trim()) {
    return "";
  }
  return toUsCanadaE164(raw) ?? "";
}

/**
 * @param stored Value from Clerk (`primaryPhoneNumber.phoneNumber`) or props.
 * @returns Up to 10 national digits for the form when the number is valid US/CA; otherwise "".
 */
export function nationalDigitsForForm(stored: string | undefined | null): string {
  const e164 = phoneComparable(stored ?? "");
  if (e164.length !== 12 || !e164.startsWith("+1")) {
    return "";
  }
  return e164.slice(2);
}
