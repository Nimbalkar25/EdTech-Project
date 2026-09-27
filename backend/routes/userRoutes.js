const express = require("express");
const {
  registerUser,
  getUserById,
  loginUser,
  verifyEmail,
  resendOTP,
  getUsers,
  editAvatar,
  editProfile,
  deleteAccount,
} = require("../controllers/userControllers");

const { resetPasswordLink, resetPassword } = require("../controllers/resetPasswordController");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const { slidingWindowLimiter } = require("../middleware/rateLimiter");
const { contactUs } = require("../controllers/contactUsController");

// 1. Import slidingWindowLimiter

const router = express.Router();

// ================= Configure Rate Limiters ================= //

// Strict: Prevent SMS / Email spam (Max 3 attempts per 60 seconds)
const otpLimiter = slidingWindowLimiter({
  windowMs: 60 * 1000,
  max: 3,
  keyPrefix: "otp",
});

// Sensitive Auth: Prevent Brute-Force Password attacks (Max 5 attempts per 2 minutes)
const loginLimiter = slidingWindowLimiter({
  windowMs: 2 * 60 * 1000,
  max: 5,
  keyPrefix: "login",
});

// Registration: Prevent Bot signups (Max 4 accounts per 5 minutes per IP)
const signupLimiter = slidingWindowLimiter({
  windowMs: 5 * 60 * 1000,
  max: 4,
  keyPrefix: "signup",
});

// Password Reset Link: Prevent email flood attacks (Max 3 requests per 10 minutes)
const resetLinkLimiter = slidingWindowLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyPrefix: "reset_link",
});

// Profile Upload: Limit heavy multipart/avatar uploads (Max 5 uploads per minute)
const avatarLimiter = slidingWindowLimiter({
  windowMs: 60 * 1000,
  max: 3,
  keyPrefix: "avatar_upload",
});

// ================= Routes Definition ================= //

// Public Auth routes (Protected by IP)
router.post("/signup", signupLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/verify-otp", otpLimiter, verifyEmail);
router.post("/resend-otp", otpLimiter, resendOTP);
router.post("/reset-passwordlink", resetLinkLimiter, resetPasswordLink);
router.post("/reset-password/:token", loginLimiter, resetPassword);
router.post("/contact", contactUs,isAuthenticated,contactUs);

// Authenticated Routes (Protected by req.user._id)
router.get("/profile/users", isAuthenticated, isAdmin, getUsers);
router.get("/profile/me", isAuthenticated, getUserById);

// Rate limiter placed after isAuthenticated so req.user._id is used instead of IP
router.put(
  "/edit/avatar",
  isAuthenticated,
  avatarLimiter,
  upload.single("avatar"),
  editAvatar
);

router.put("/edit/profile", isAuthenticated, editProfile);
router.delete("/delete", isAuthenticated, deleteAccount);

module.exports = router;