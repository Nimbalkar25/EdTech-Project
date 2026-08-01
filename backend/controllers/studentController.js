const User = require("../models/userModel");
const Course = require("../models/courseModel")
const CourseProgress = require("../models/courseProgress")


exports.enrollCourses = async (req, res) => {
    try {
        const { courseIds } = req.body;
        const studentId = req.user.id;


        if (!courseIds || courseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide courseIds."
            });
        }

        const user = await User.findById(studentId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        for (const courseId of courseIds) {


            const alreadyEnrolled = user.courses.find(course =>
                course.toString() === courseId
            )

            if (alreadyEnrolled) {
                continue; // if not continue other courses will not be added
            }
            const course = await Course.findById(courseId);





            if (!course) {
                continue // same other courses will not be handled or added in enrolledstudent in course model
            }


            user.courses.push(courseId);
            course.studentsEnrolled.push(studentId);
            await course.save();

            // Create Course Progress
            const progress = await CourseProgress.findOne({
                student: studentId,
                course: courseId
            });

            if (!progress) {
                await CourseProgress.create({
                    student: studentId,
                    course: courseId,
                    lectureProgress: []
                });
            }

        }

        await user.save();


        return res.status(200).json({
            success: true,
            message: `Enrolled Successfully`
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while enrolling `
        })
    }
}



exports.getEnrolledCourseForStudent = async (req, res) => {
    try {
        const studentId = req.user.id;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: `Student ID not found`
            })
        }

        const student = await User.findById(studentId).populate({
            path: "courses",
            populate: {
                path: "courseSection",
                populate: {
                    path: "subSections"
                }
            }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student not found`
            })
        }

        const courseProgress = await CourseProgress.find({
            student: studentId
        }).populate("course");

        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: `courseProgress not found`
            })
        }


        const enrolledCourses = [];

        for (const course of student.courses) {

            const progress = courseProgress.find(
                item => item.course._id.toString() === course._id.toString()
            );

            // Calculate total lectures
            let totalLectures = 0;

            for (const section of course.courseSection) {
                totalLectures += section.subSections.length;
            }

            // Calculate completed lectures
            const completedLectures = progress
                ? progress.lectureProgress.filter(
                    lecture => lecture.completed
                ).length
                : 0;

            // Calculate percentage
            const percentageCompleted =
                totalLectures === 0
                    ? 0
                    : Math.round((completedLectures / totalLectures) * 100);

            enrolledCourses.push({
                course,
                totalLectures,
                completedLectures,
                pendingLectures: totalLectures - completedLectures,
                percentageCompleted
            });
        }

        return res.status(200).json({
            success: true,
            message: `Enrolled Student fetched successfully..`,
            data: enrolledCourses
        })




    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while fetching enrolled course for user`,
            error: error.message
        })
    }
}


// Remove course from student course

exports.removeCourse = async (req, res) => {
    try {
        const studentId = req.user.id;

        if (!studentId) {
            return res.status(404).json({
                success: false,
                message: `StudentId Not found`
            })
        }

        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: `Please enter CourseId`
            })
        }

        const user = await User.findById(studentId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `Student Not Found May need to Login`
            })
        }

        const alreadyEnrolled = user.courses.find(
            course => course.toString() === courseId
        );

        if (!alreadyEnrolled) {
            return res.status(400).json({
                success: false,
                message: "Student is not enrolled in this course."
            });
        }


        user.courses = user.courses.filter((course) => course.toString() !== courseId);

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Course Not Found..`
            })
        }

        course.studentsEnrolled = course.studentsEnrolled.filter((student) => student.toString() !== studentId);

        await user.save();
        await course.save();


        await CourseProgress.findOneAndDelete({
            student: studentId,
            course: courseId
        });


        return res.status(200).json({
            success: true,
            message: `Course removed Successfully..`
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while removing course for user`,
            error: error.message
        })
    }
}