const mongoose = require("mongoose");
const validator = require("validator");
const Course = require("../models/courseModel");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxlength: 30
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email address"],
    },
    countrycode: {
        type: String,
        required: [true, "Please select country code"],
        default: '+91',


    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],

    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        trim: true,
        select: false,
    },
    role: {
        type: String,
        enum: ['Instructor', 'Student', 'Admin'],
        default: 'Student'
    },
    avatar: {
        url: {
            type: String,
            default: ""
        },
        public_id: {
            type: String,
            default: ""
        }
    },
    displayName: {
        type: String
    },

    about: {
        type: String,
        default: ""
    },

    profession: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },

    dateOfBirth: {
        type: Date
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "COURSE"
        }
    ],
    emailVerified: {
        type: Boolean,
        default: false
    },

    otp: {
        type: String,
        select: false
    },

    otpExpires: {
        type: Date,
        select: false
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
    },
    // ================= Brute-Force & Account Lockout Fields ================= //
    failedLoginAttempts: {
        type: Number,
        default: 0,
        select: false,
    },
    lockUntil: {
        type: Date,
        select: false,
    },
    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "COURSE",
        },
    ],

},
    { timestamps: true }
);

// Virtual property to check if the account is currently locked
userSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('USER', userSchema)