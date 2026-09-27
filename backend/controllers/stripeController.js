const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const { enrollCourse } = require("../utils/enrollCourse");

// 1. INITIATE STRIPE PAYMENT
exports.proceedPayment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const courses = await Course.find({ _id: { $in: user.cart } });
    if (courses.length !== user.cart.length) {
      return res.status(400).json({
        success: false,
        message: "One or more courses in your cart are no longer available",
      });
    }

    let totalAmount = 0;
    for (const course of courses) {
      const isAlreadyEnrolled = course.studentsEnrolled.some(
        (id) => id.toString() === userId.toString()
      );
      if (isAlreadyEnrolled) {
        return res.status(400).json({
          success: false,
          message: `Already enrolled in ${course.courseTitle}`,
        });
      }
      totalAmount += course.price;
    }

    // Stripe takes the amount in the smallest currency sub-unit (paise for INR, cents for USD)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: "inr",
      metadata: { userId: userId.toString() },
      automatic_payment_methods: { enabled: true },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not create Stripe Payment Intent",
      error: error.message,
    });
  }
};

// 2. VERIFY PAYMENT & ENROLL
exports.verifyPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        const userId = req.user.id || req.user._id;

        if (!paymentIntentId) {
            return res.status(400).json({ 
                success: false, 
                message: "paymentIntentId is required" 
            });
        }

        // 1. Verify payment directly with Stripe's servers
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({
                success: false,
                message: `Payment status is ${paymentIntent.status}. Access denied.`,
            });
        }

        // 2. Fetch user and verify they have items in their cart
        const user = await User.findById(userId);
        if (!user || !user.cart || user.cart.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Cart is empty or already processed" 
            });
        }

        // 3. Fetch full course details based on the user's cart
        const courses = await Course.find({ _id: { $in: user.cart } });

        // 4. Create an immutable Order Ledger Receipt
        const courseSnapshots = courses.map((c) => ({
            courseId: c._id,
            pricePaid: c.price,
        }));
        const totalAmount = courses.reduce((sum, c) => sum + c.price, 0);

        const orderRecord = await Order.create({
            userId,
            courses: courseSnapshots,
            totalAmount,
            orderId: paymentIntent.id,
            paymentId: paymentIntent.latest_charge || paymentIntent.id,
            status: "Success",
        });

        // 5. Grant access via the enrollment helper
        // We pass the full 'courses' array so the email template gets the titles/descriptions
        await enrollCourse(courses, userId);

        // 6. Return Success Response
        return res.status(200).json({
            success: true,
            message: "Payment verified, courses enrolled, and email sent.",
            orderId: orderRecord._id,
        });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message,
        });
    }
};