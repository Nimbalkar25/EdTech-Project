const express = require("express");
const { isAuthenticated, isStudent } = require("../middleware/authMiddleware");
const { addReview, fetchReviews } = require("../controllers/reviewsController");

const router = express.Router();

router.post("/addreview",isAuthenticated,isStudent,addReview);
router.get("/fetchreview",isAuthenticated,isStudent,fetchReviews);

module.exports = router;