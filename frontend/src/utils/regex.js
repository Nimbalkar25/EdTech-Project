// utils/regex.js

export const REGEX = {
  // Letters and spaces only (min 2, max 50 chars)
  NAME: /^[a-zA-Z\s]{2,50}$/,

  // Standard 10-digit mobile number (Indian standard: starts with 6-9)
  PHONE_NUMBER: /^[6-9]\d{9}$/,


  // Standard email validation
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Numbers only (any length)
  NUMBERS_ONLY: /^\d+$/,

  // Country calling codes (e.g., +91, +1, +44)
  COUNTRY_CODE: /^\+\d{1,4}$/,

  // 6-digit numeric OTP / PIN code
  OTP_OR_PINCODE: /^\d{6}$/,
};

// Optional helper functions for quick boolean checks
export const isValidName = (name) => REGEX.NAME.test(name?.trim());
export const isValidPhone = (phone) => REGEX.PHONE_NUMBER.test(phone?.trim());
export const isValidEmail = (email) => REGEX.EMAIL.test(email?.trim());
export const isValidOtp = (otp) => REGEX.OTP_OR_PINCODE.test(otp?.trim());