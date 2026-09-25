const BASE_URL = import.meta.env.VITE_BASE_URL;

export const endpoints = {
    LOGIN_API : `${BASE_URL}/login`,
    SIGNUP_API : `${BASE_URL}/signup`,
    VERIFY_EMAIL_API : `${BASE_URL}/verify-otp`,
    RESEND_OTP_API : `${BASE_URL}/resend-otp`,
    RESET_PASSWORD_LINK_API : `${BASE_URL}/reset-passwordLink`,
    RESETPASSWORD_API : `${BASE_URL}/reset-password`,
}