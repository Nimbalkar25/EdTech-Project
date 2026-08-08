const express = require("express");
const { isAuthenticated, isStudent } = require("../middleware/authMiddleware");
const router = express.Router();

const {enrollCourses, getEnrolledCourseForStudent,removeCourse, updateCourseProgress} = require("../controllers/studentController")

router.post("/enroll",isAuthenticated,isStudent,enrollCourses);
router.get("/getEnrolledCourses",isAuthenticated,isStudent,getEnrolledCourseForStudent);
router.delete("/removeCourse",isAuthenticated,isStudent,removeCourse);
router.put("/course/progress",isAuthenticated,isStudent,updateCourseProgress)

module.exports = router;