const express = require("express");
const { isAuthenticated, isStudent } = require("../middleware/authMiddleware");
const { addReview, fetchReviews } = require("../controllers/reviewsController");
const { slidingWindowLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Limit adding reviews: Max 3 requests per 2 minutes per user
const addReviewLimiter = slidingWindowLimiter({
  windowMs: 2 * 60 * 1000,
  max: 3,
  keyPrefix: "add_review",
});

// Limit fetching reviews: Max 60 requests per minute per user/IP
const fetchReviewLimiter = slidingWindowLimiter({
  windowMs: 60 * 1000,
  max: 60,
  keyPrefix: "fetch_review",
});

// isAuthenticated runs first so req.user._id is available for per-user tracking
router.post(
  "/addreview",
  isAuthenticated,
  isStudent,
  addReviewLimiter,
  addReview
);

router.get(
  "/fetchreview",
  isAuthenticated,
  isStudent,
  fetchReviewLimiter,
  fetchReviews
);

module.exports = router;