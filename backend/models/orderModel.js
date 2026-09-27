const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Captures the exact courses & price at purchase moment
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        pricePaid: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String, // Razorpay Order ID (order_...)
      required: true,
    },
    paymentId: {
      type: String, // Razorpay Payment ID (pay_...)
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);