const Course = require("../models/courseModel");
const SECTION = require("../models/sectionModel");
const SUBSECTION = require("../models/subSectionModel");
const RATINGANDREVIEW = require("../models/ratingAndReviewsModel");
const cloudinary = require("cloudinary").v2


const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/uploadToCloudinary");


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

        const instructorId = req.user.id;

        const existingCourse = await Course.findOne({
            courseTitle
        });

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: "Course is already present with same Title."
            })
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Thumbnail is required"
            });
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

        const course = await Course.findById(courseId).populate({
            path: "courseSection",
            populate: {
                path: "subSections"
            }
        }).populate("ratingAndReviews");

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

        const { courseId } = req.params;
        const { sectionName } = req.body;
        const course = await Course.findById(courseId).populate("courseSection");

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const existingSection = course.courseSection.find(
            sec => sec.sectionName.trim().toLowerCase() === sectionName.trim().toLowerCase()
        );


        if (existingSection) {
            return res.status(409).json({
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


        return res.status(201).json({
            success: true,
            message: `Section Created Successfully`,
            data: createdSection,
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

        const { sectionId } = req.params;

        const {
            title,
            description,
            timeDuration
        } = req.body;

        const exisitingSection = await SECTION.findById(sectionId).populate("subSections");

        if (!exisitingSection) {
            return res.status(404).json({
                success: false,
                message: `Section Not Found`
            })
        }


        const existingsubSection = exisitingSection.subSections.find(
            sub => sub.title.trim().toLowerCase() ===
                title.trim().toLowerCase()
        );


        if (existingsubSection) {
            return res.status(409).json({
                success: true,
                error: `subSection already present with the same title.`
            })
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Thumbnail is required"
            });
        }

        const uploadedVideo =
            await uploadToCloudinary(
                req.file,
                `${process.env.FOLDER_NAME}/${process.env.VIDEOS_FOLDER}`
            );

        const createdsubSection = await SUBSECTION.create({
            title, description, timeDuration,
            videoUrl: {
                url: uploadedVideo.secure_url,
                public_id: uploadedVideo.public_id

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
        const { courseId } = req.params;
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

        if (existingCourse.status === "Published") {
            return res.status(400).json({
                success: false,
                message: `Course is already Published.`

            })
        }

        existingCourse.status = "Published";

        await existingCourse.save();

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



// edit course

exports.editCourse = async (req, res) => {
    try {

        const { courseId } = req.params;
        const {
            courseTitle,
            courseShortDescription,
            price,
            category,
            tags,
            benefitsOfCourse,
            requirements,
        } = req.body;

        const instructorId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course Not Found."
            })
        }

        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this course."
            });
        }

        if (req.file) {

            await cloudinary.uploader.destroy(
                course.courseThumbnail.public_id
            );

            const uploadedThumbnail =
                await uploadToCloudinary(
                    req.file,
                    `${process.env.FOLDER_NAME}/${process.env.COURSE_THUMBNAIL_FOLDER}`
                );

            course.courseThumbnail = {
                url: uploadedThumbnail.secure_url,
                public_id: uploadedThumbnail.public_id
            };
        }

        course.courseTitle = courseTitle;
        course.courseShortDescription = courseShortDescription;
        course.price = price;
        course.category = category;
        course.tags = tags;
        course.benefitsOfCourse = benefitsOfCourse;
        course.requirements = requirements;

        await course.save();


        return res.status(200).json({
            success: true,
            message: `Course Updated Succesfully.`,
            data: course
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while Editing course.."
        })
    }
}

exports.editSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.params;
        const { sectionName } = req.body;
        const instructorId = req.user.id;

        const course = await Course.findById(courseId);

        const section = await SECTION.findById(sectionId);

        if (!section) {
            return res.status(404).json({
                success: false,
                message: `Section Not found`
            })
        }


        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this course."
            });
        }


        if (sectionName) {
            section.sectionName = sectionName
            await section.save();

        }

        return res.status(200).json({
            success: true,
            message: `Section updated Successfully.`,
            data: section
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while editing Section.`
        })
    }
}

exports.editSubSection = async (req, res) => {
    try {
        const { subSectionId, courseId } = req.params;
        const {
            title,
            description,
            timeDuration
        } = req.body;

        const instructorId = req.user.id;

        const course = await Course.findById(courseId);
        const subSection = await SUBSECTION.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: `SubSection Not found`
            })
        }

        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this course."
            });
        }



        if (req.file) {

            await cloudinary.uploader.destroy(
                subSection.videoUrl.public_id
            );

            const uploadedVideo =
                await uploadToCloudinary(
                    req.file,
                    `${process.env.FOLDER_NAME}/${process.env.VIDEOS_FOLDER}`
                );

            subSection.videoUrl = {
                url: uploadedVideo.secure_url,
                public_id: uploadedVideo.public_id
            };
        }

        subSection.title = title;
        subSection.description = description;
        subSection.timeDuration = timeDuration;

        await subSection.save();

        return res.status(200).json({
            success: true,
            message: `SubSection updated Successfully.`,
            data: subSection
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while Editing subSection.."
        })
    }
}


// delete Course

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
        // Thumbnail
        await deleteFromCloudinary(course.courseThumbnail.public_id);


        // --------------------------------------------------
        // Delete all SubSections
        // --------------------------------------------------
        for (const section of course.courseSection) {

            // Delete Videos from Cloudinary (Optional)
            for (const subSection of section.subSections) {
                await deleteFromCloudinary(
                    subSection.videoUrl.public_id,
                    "video"
                );
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
        });

    }
}

// delete section

exports.deleteSection = async (req, res) => {
    try {

        const { sectionId } = req.params;

        if (!sectionId) {
            return res.status(404).json({
                success: false,
                message: `Section Id is not present...`
            })
        }

        const section = await SECTION.findById(sectionId).populate("subSections");

        if (!section) {
            return res.status(404).json({
                success: false,
                error: error.message,
                message: "Section Not Found.."
            })
        }

        // delete the video or image from cloudinary 
        for (const subSection of section.subSections) {
            await deleteFromCloudinary(
                subSection.videoUrl.public_id,
                "video"
            );
        }

        // delete the all subsection under section now
        await SUBSECTION.deleteMany({
            _id: {
                $in: section.subSections
            }
        });

        // now delete the section
        await SECTION.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success: true,
            message: `Section deleted Successfully..`
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while Deleting Section.."
        })
    }
}

// delete Subsection