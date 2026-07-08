const express = require("express");
const router = express.Router();
const { isAuthenticated, isInstructor } = require("../middleware/authMiddleware");
const { createCourse,
    createSection,
    createSubSection,
    updateCourseStatus,
    getCourses,
    getCourseById,
    deleteCourse,
    editCourse,
    editSection,
    editSubSection,
    deleteSection

} = require("../controllers/instructorController");

const { validateVideoAndThumbnail } = require("../middleware/videoThumnail");
const upload = require("../middleware/multer");

//get request for courses 
router.get("/course/getCourses", isAuthenticated, isInstructor, getCourses);

// get request use for fetch course to edi and also to fetch particular course also no need different api 
router.get("/course/getCourse/:courseId", isAuthenticated, getCourseById);

// post request for courses
router.post("/course/create", isAuthenticated, isInstructor, upload.single("courseThumbnail"), validateVideoAndThumbnail, createCourse);
router.post("/course/:courseId/createSection", isAuthenticated, isInstructor, createSection);
router.post("/course/:sectionId/createSubSection", isAuthenticated, isInstructor, upload.single("videoUrl"), validateVideoAndThumbnail, createSubSection);
router.post("/course/:courseId/coursePublish", isAuthenticated, isInstructor, updateCourseStatus);

// put request for editing the courses
router.put("/course/:courseId/editCourse",isAuthenticated,isInstructor,upload.single("courseThumbnail"),validateVideoAndThumbnail,editCourse);
router.put("/course/:courseId/editSection/:sectionId", isAuthenticated, isInstructor, editSection);
router.put("/course/:courseId/editSubSection/:subSectionId", isAuthenticated, isInstructor, upload.single("videoUrl"), validateVideoAndThumbnail, editSubSection);


// delete course and there section
router.delete("/course/deleteCourse/:courseId", isAuthenticated, isInstructor, deleteCourse);
router.delete("/course/deleteSection/:sectionId", isAuthenticated, isInstructor, deleteSection);

module.exports = router;