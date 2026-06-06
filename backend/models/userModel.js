const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxlength: 10
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 10
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
        default:'+91',


    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
        
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [8, "Password should be at least 8 characters long"],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
            "Password must contain at least 1 uppercase letter, 1 lowercase letter and 1 number"
        ],
        select: false,
    },
    role: {
        type: String,
        enum: ['Instructor', 'Student', 'Admin'],
        default: 'Student'
    },
},
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema)