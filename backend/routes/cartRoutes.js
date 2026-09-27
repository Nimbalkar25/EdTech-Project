const express = require("express");
const router = express.Router();

const {
  addToCart,
  removeFromCart,
  getUserCart,
} = require("../controllers/cartController");

const { isAuthenticated, isStudent } = require("../middleware/authMiddleware");
const { slidingWindowLimiter } = require("../middleware/rateLimiter");

// Rate limit: Max 20 cart modifications per minute per authenticated user
const cartLimiter = slidingWindowLimiter({
  windowMs: 60 * 1000,
  max: 20,
  keyPrefix: "cart_action",
});

// Authenticated Student Routes
// Limiters placed after isAuthenticated so tracking keys use req.user._id
router.get("/get-cart", isAuthenticated, isStudent, getUserCart);
router.post("/add-to-cart", isAuthenticated, isStudent, cartLimiter, addToCart);
router.post("/remove-from-cart", isAuthenticated, isStudent, cartLimiter, removeFromCart);

module.exports = router;