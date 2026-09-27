const User = require("../models/userModel");
const Course = require("../models/courseModel");
const courseProgress = require("../models/courseProgressModel");
const { sendEnrollmentEmail } = require("../utils/enrollmentEmail"); // Adjust path if needed

exports.enrollCourse = async (courses, studentId) => {
    if (!courses || courses.length === 0 || !studentId) {
        throw new Error("Please provide course details and studentId.");
    }

    try {
        const courseIds = courses.map(course => course._id);

        // 1. Add student to all courses atomically
        for (const courseId of courseIds) {
            await Course.findByIdAndUpdate(
                courseId,
                { $addToSet: { studentsEnrolled: studentId } },
                { returnDocument: "after" } // ✅ Clean, modern syntax
            );
        }

        // 2. Add courses to user's list AND clear their cart atomically
        const updatedUser = await User.findByIdAndUpdate(
            studentId,
            {
                $addToSet: { courses: { $each: courseIds } },$set: { cart: [] } // Empties the cart after purchase
            },
            { returnDocument: "after" } // ✅ Clean, modern syntax
        );

        // 3. Initialize Course Progress for each newly purchased course
        // This is strictly required so your video progress tracker doesn't throw a 404
        for (const courseId of courseIds) {
            await courseProgress.create({
                course: courseId,
                student: studentId,
                lectureProgress: []
            });
        }

        // 4. Send Confirmation Email
        if (updatedUser) {
            try {
                await sendEnrollmentEmail({
                    email: updatedUser.email,
                    studentName: `${updatedUser.firstName} ${updatedUser.lastName || ""}`.trim(),
                    courses: courses 
                });
            } catch (emailError) {
                // We catch this so an email failure doesn't roll back the student's purchase
                console.error("Failed to send enrollment email:", emailError.message);
            }
        }

        return true;
    } catch (error) {
        console.error("Error during student enrollment: ", error);
        throw new Error(error.message);
    }
}