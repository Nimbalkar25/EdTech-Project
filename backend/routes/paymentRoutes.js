const express = require("express");

const router = express.Router();

const { isAuthenticated, isStudent } = require("../middleware/authMiddleware");
const {
  proceedPayment,
  verifyPayment,
} = require("../controllers/stripeController"); // adjust path to where you saved the controller

// Stripe Endpoints
router.post("/proceed-payment", isAuthenticated, isStudent, proceedPayment);
router.post("/verify-payment", isAuthenticated, isStudent, verifyPayment);

module.exports = router;