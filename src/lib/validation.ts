import { z } from "zod";

/** Pakistani mobile (03XX-XXXXXXX, optional +92) or Lahore landline (042-XXXXXXXX). */
const PK_PHONE = /^(?:(?:\+92|0092|0)3\d{2}[\s-]?\d{7}|(?:\+92|0)42[\s-]?\d{7,8})$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine((value) => PK_PHONE.test(value.replace(/\s+/g, " ")), "Enter a valid Pakistani number, e.g. 0300 1234567");

/** For edits where an empty value keeps the number already on file. */
export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || PK_PHONE.test(value.replace(/\s+/g, " ")), "Enter a valid Pakistani number, e.g. 0300 1234567");

export const optionalEmailSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address");

/** Masks all but the last four digits, matching how phone numbers are shown across the demo. */
export function maskPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^92/, "0").replace(/^0092/, "0");
  return `${digits.slice(0, 4)} ••• ${digits.slice(-4)}`;
}
