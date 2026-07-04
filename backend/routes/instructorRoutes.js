const express = require("express");
const router = express.Router();
const { isAuthenticated, isInstructor } = require("../middleware/authMiddleware");
const { createCourse,
    createSection,
    createSubSection,
    updateCourseStatus,
    getCourses,
    getCourseById,
    deleteCourse

} = require("../controllers/instructorController");

const { validateVideoAndThumbnail } = require("../middleware/videoThumnail");
const upload = require("../middleware/multer");

//get request for courses 
router.get("/course/getCourses", isAuthenticated, isInstructor, getCourses);

// get request use for fetch course to edi and also to fetch particular course also no need different api 
router.get("/course/getCourse/:courseId", isAuthenticated, getCourseById);

// post request for courses
router.post("/course/create", isAuthenticated, isInstructor, upload.single("courseThumbnail"), validateVideoAndThumbnail, createCourse);
router.post("/course/createSubSection", isAuthenticated, isInstructor, upload.single("videoUrl"), validateVideoAndThumbnail, createSubSection);
router.post("/course/createSection", isAuthenticated, isInstructor, createSection);
router.post("/course/coursePublish", isAuthenticated, isInstructor, updateCourseStatus);

// put request for editing the courses

// delete course and there section

router.delete("/course/deleteCourse/:courseId", isAuthenticated, isInstructor, deleteCourse);

module.exports = router;