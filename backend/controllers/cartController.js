// Here will have logic for add remove the course from cart

const User = require("../models/userModel");
const Course = require("../models/courseModel");
const mongoose = require("mongoose");


exports.addToCart = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id || req.user._id;

        // 1. Validate Course ID presence & MongoDB ObjectId format
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "A valid Course ID is required",
            });
        }

        // 2. Check if the course actually exists in the Course collection
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // 3. Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        // 4. Check if course already purchased (string comparison for ObjectIds)
        const isEnrolled = user.courses.some(
            (enrolledId) => enrolledId.toString() === courseId.toString()
        );
        if (isEnrolled) {
            return res.status(400).json({
                success: false,
                message: "Already enrolled in this course",
            });
        }

        // 5. Check if course is already in cart
        const alreadyInCart = user.cart.some(
            (cartItem) => cartItem.toString() === courseId.toString()
        );
        if (alreadyInCart) {
            return res.status(400).json({
                success: false,
                message: "Course already in cart",
            });
        }

        // 6. Push and save
        user.cart.push(courseId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Added to cart successfully",
            cart: user.cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while adding course to cart.",
        });
    }
};


// 2. Remove course from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { cart: courseId } },
            { new: true }
        ).populate("cart");

        return res.status(200).json({
            success: true,
            message: "Removed from cart successfully",
            cart: updatedUser.cart,
        });
    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                error: error.message,
                message: "Something went wrong while remove course from cart."
            });
    }
};

// 3. Get Cart with Courses & Total Amount
exports.getUserCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate({
            path: "cart",
            select: "courseTitle price courseThumbnail instructor",
            populate: {
                path: "instructor",
                select: "firstName lastName",
            },
        });

        if (!user) {
            return res.status(404).json(
                {
                    success: false,
                    message: "User not found"
                });
        }

        // Calculate total price of all courses in bucket
        const totalAmount = user.cart.reduce((acc, course) => acc + (course.price || 0), 0);

        return res.status(200).json({
            success: true,
            data: {
                cart: user.cart,
                totalItems: user.cart.length,
                totalAmount: totalAmount,
            },
        });
    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                error: error.message,
                message: "Something went wrong while fetching course in cart"
            });
    }
};