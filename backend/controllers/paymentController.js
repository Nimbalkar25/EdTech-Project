const { instance } = require("../config/razorpay");
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const crypto = require("crypto");
const mongoose = require("mongoose");

// ==========================================
// 1. INITIATE RAZORPAY ORDER (capturePayment)
// ==========================================
exports.capturePayment = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        // 1. Fetch user and their cart
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // 2. Fetch courses directly from DB to verify price & enrollment status
        const courses = await Course.find({ _id: { $in: user.cart } });

        if (courses.length !== user.cart.length) {
            return res.status(400).json({
                success: false,
                message: "One or more courses in your cart are no longer available",
            });
        }

        let totalAmount = 0;
        for (const course of courses) {
            // Check if user is already enrolled
            const isAlreadyEnrolled = course.studentsEnrolled.some(
                (id) => id.toString() === userId.toString()
            );

            if (isAlreadyEnrolled) {
                return res.status(400).json({
                    success: false,
                    message: `You are already enrolled in ${course.courseTitle}`,
                });
            }
            totalAmount += course.price;
        }

        // 3. Razorpay expects amount in paise (1 INR = 100 paise)
        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}_${userId.toString().slice(-4)}`,
            notes: {
                userId: userId.toString(),
            },
        };

        // 4. Create Order on Razorpay
        const paymentResponse = await instance.orders.create(options);

        return res.status(200).json({
            success: true,
            message: "Order initiated successfully",
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not initiate Razorpay order",
            error: error.message,
        });
    }
};

// ==========================================
// 2. VERIFY PAYMENT & ENROLL (verifyPayment)
// ==========================================
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const userId = req.user.id || req.user._id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification parameters missing",
            });
        }

        // 1. Verify Razorpay Signature using HMAC SHA256
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed: Invalid Signature",
            });
        }

        // 2. Signature is authentic: Enroll student and save receipt
        const user = await User.findById(userId);
        const cartCourseIds = user.cart;

        const courses = await Course.find({ _id: { $in: cartCourseIds } });

        // Build the snapshot for the Order schema
        const courseSnapshots = courses.map((course) => ({
            courseId: course._id,
            pricePaid: course.price,
        }));

        const totalAmountPaid = courses.reduce((sum, c) => sum + c.price, 0);

        // A. Create the Order / Purchase document
        const orderRecord = await Order.create({
            userId,
            courses: courseSnapshots,
            totalAmount: totalAmountPaid,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            status: "Success",
        });

        // B. Enroll student into each course & update Course's studentsEnrolled
        for (const courseId of cartCourseIds) {
            await Course.findByIdAndUpdate(courseId, {
                $addToSet: { studentsEnrolled: userId },
            });
        }

        // C. Add courses to User document and clear Cart
        await User.findByIdAndUpdate(userId, {
            $addToSet: { courses: { $each: cartCourseIds } }, $set: { cart: [] }, // Empty the cart
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified, courses enrolled, and cart cleared",
            orderId: orderRecord._id,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message,
        });
    }
};


// GET /api/v1/payment/purchase-history
exports.getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const history = await Order.find({ userId })
            .populate({
                path: "courses.courseId",
                select: "courseTitle courseThumbnail price",
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch purchase history",
            error: error.message,
        });
    }
};