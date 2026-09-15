const express = require("express");
const { isAuthenticated, isStudent } = require("../middleware/authMiddleware");
const { slidingWindowLimiter } = require("../middleware/rateLimiter");

const {
  enrollCourses,
  getEnrolledCourseForStudent,
  removeCourse,
  updateCourseProgress,
} = require("../controllers/studentController");

const router = express.Router();

// 1. Enrollment: Strict limit to avoid race conditions or double purchase triggers
const enrollLimiter = slidingWindowLimiter({
  windowMs: 60 * 1000,
  max: 3,
  keyPrefix: "student_enroll",
});

// 2. Remove course: Destructive action protection
const removeCourseLimiter = slidingWindowLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyPrefix: "student_remove_course",
});

// 3. Progress tracker: Generous limit for video tracking and auto-sync
const progressLimiter = slidingWindowLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyPrefix: "student_progress",
});

// 4. Dashboard course fetch: Standard read limit
const getCoursesLimiter = slidingWindowLimiter({
  windowMs: 60 * 1000,
  max: 60,
  keyPrefix: "student_get_courses",
});

// --- Routes Definition ---
router.post("/enroll", isAuthenticated, isStudent, enrollLimiter, enrollCourses);
router.get("/getEnrolledCourses", isAuthenticated, isStudent, getCoursesLimiter, getEnrolledCourseForStudent);
router.delete("/removeCourse", isAuthenticated, isStudent, removeCourseLimiter, removeCourse);
router.put("/course/progress", isAuthenticated, isStudent, progressLimiter, updateCourseProgress);

module.exports = router;