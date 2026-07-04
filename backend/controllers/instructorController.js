const Course = require("../models/courseModel");
const SECTION = require("../models/sectionModel");
const SUBSECTION = require("../models/subSectionModel");
const RATINGANDREVIEW = require("../models/ratingAndReviewsModel");
const cloudinary = require("cloudinary").v2


const { uploadToCloudinary } = require("../utils/uploadToCloudinary");


exports.createCourse = async (req, res) => {
    try {

        const {
            courseTitle,
            courseShortDescription,
            price,
            category,
            tags,
            benefitsOfCourse,
            requirements,

        } = req.body;

        const instructorId = await req.user.id;

        const existingCourse = await Course.findOne({
            courseTitle
        });

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: "Course is already present with same Title."
            })
        }


        const uploadedThumbnail =
            await uploadToCloudinary(
                req.file,
                `${process.env.FOLDER_NAME}/${process.env.COURSE_THUMBNAIL_FOLDER}`
            );


        const course = await Course.create({
            courseTitle,
            courseShortDescription,
            price,
            category,
            tags,
            benefitsOfCourse,
            requirements,
            instructor: instructorId,
            courseThumbnail: {
                url: uploadedThumbnail.secure_url,
                public_id: uploadedThumbnail.public_id
            }
        })

        return res.status(200).json({
            success: true,
            message: `Course created Succesfully.`,
            data: course
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while creating course.."
        })
    }
}


// get Course 

exports.getCourses = async (req, res) => {
    try {

        const courses = await Course.find().populate("courseSection");

        if (!courses) {
            return res.status(404).json({
                success: false,
                message: `Not able to Fetch Courses`
            })
        }

        if (courses.length === 0) {
            return res.status(400).json({
                success: false,
                message: `No Courses Available`
            })
        }

        return res.status(200).json({
            success: true,
            message: `Fetched courses successfully`,
            data: courses
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching courses.`
        })
    }
}

// get Course by Id

exports.getCourseById = async (req, res) => {
    try {

        const { courseId } = req.params;

        const course = await Course.find({ courseId }).populate("courseSection");

        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Not able to Fetch Course`
            })
        }

        return res.status(200).json({
            success: true,
            message: `Fetched course successfully`,
            data: course
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching course.`
        })
    }
}


// create section
exports.createSection = async (req, res) => {
    try {

        const { courseId, sectionName } = req.body;
        const course = await Course.findById(courseId).populate("courseSection");

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const existingSection = await course.courseSection.find(
            sec => sec.sectionName === sectionName
        );


        if (existingSection) {
            return res.status(400).json({
                success: true,
                error: `Section already present.`
            })
        }

        const createdSection = await SECTION.create({ sectionName });

        await Course.findByIdAndUpdate(courseId, {
            $push: {
                courseSection: createdSection._id
            }
        })


        return res.status(200).json({
            success: true,
            data: createdSection
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while creating section.."
        })
    }
}

// subsection
exports.createSubSection = async (req, res) => {
    try {

        const { sectionId, title, description, timeDuration } = req.body;

        const exisitingSection = await SECTION.findById(sectionId).populate("subSections");

        if (!exisitingSection) {
            return res.status(404).json({
                success: false,
                message: `Section Not Found`
            })
        }


        const existingsubSection = await exisitingSection.subSections.find(
            sec => sec.title === title
        );


        if (existingsubSection) {
            return res.status(400).json({
                success: true,
                error: `subSection already present with the same title.`
            })
        }

        const uploadedThumbnail =
            await uploadToCloudinary(
                req.file,
                `${process.env.FOLDER_NAME}/${process.env.VIDEOS_FOLDER}`
            );

        const createdsubSection = await SUBSECTION.create({
            title, description, timeDuration,
             videoUrl: {
                url: uploadedThumbnail.secure_url,
                public_id: uploadedThumbnail.public_id

            }
        })


        await SECTION.findByIdAndUpdate(sectionId, {
            $push: {
                subSections: createdsubSection._id
            }
        })


        return res.status(200).json({
            success: true,
            message: `SubSection created Successfully..`,
            data: createdsubSection
        })





    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while creating subSection.."
        })
    }
}

// publish course
exports.updateCourseStatus = async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: `Please enter CourseId`
            })
        }

        const existingCourse = await Course.findById(courseId);

        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: "Course Not Found."
            })
        };

        if (existingCourse.status = "Published") {
            return res.status(400).json({
                success: false,
                message: `Course is already Published.`

            })
        }

        existingCourse.status = "Published";

        return res.status(200).json({
            success: true,
            message: `Course Published Successfully`,
            data: existingCourse
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while while publishing.."
        });
    }
}


// edit Course

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "Please provide Course ID"
            })
        }

        // Find Course with Sections and SubSections
        const course = await Course.findById(courseId)
            .populate({
                path: "courseSection",
                populate: {
                    path: "subSections"
                }
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Course Not Found.`
            })

        }

        // --------------------------------------------------
        // Delete Course Thumbnail from Cloudinary (Optional)
        // --------------------------------------------------
        await cloudinary.uploader.destroy(course.courseThumbnail.public_id);

        // --------------------------------------------------
        // Delete all SubSections
        // --------------------------------------------------
        for (const section of course.courseSection) {

            // Delete Videos from Cloudinary (Optional)
            for (const lecture of section.subSections) {
                await cloudinary.uploader.destroy(lecture.videoUrl.public_id);
            }

            await SUBSECTION.deleteMany({
                _id: {
                    $in: section.subSections
                }
            });

        }

        // --------------------------------------------------
        // Delete all Sections
        // --------------------------------------------------
        await SECTION.deleteMany({
            _id: {
                $in: course.courseSection
            }
        });

        // --------------------------------------------------
        // Delete all Ratings & Reviews
        // --------------------------------------------------
        await RATINGANDREVIEW.deleteMany({
            _id: {
                $in: course.ratingAndReviews
            }
        });

        // --------------------------------------------------
        // Delete Course
        // --------------------------------------------------
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: `${course.courseTitle} deleted successfully`
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while Deleting course.."
        })

    }
}