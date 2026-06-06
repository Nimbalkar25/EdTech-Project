const express = require("express");
const { registerUser } = require("../controllers/userControllers");
const { loginUser } = require("../controllers/userControllers");
const { verifyEmail } = require("../controllers/userControllers");
const { resendOTP } = require("../controllers/userControllers");
const router = express.Router();


router.post("/signup",registerUser);
router.post("/login",loginUser);
router.post("/verify-otp",verifyEmail);
router.post("/resend-otp", resendOTP);

module.exports = router;